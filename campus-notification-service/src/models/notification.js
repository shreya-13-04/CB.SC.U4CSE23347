// In-memory notification store
const { v4: uuidv4 } = require('uuid');

let notifications = [];

// Priority weights as per Stage 6 requirements
const TYPE_WEIGHTS = {
  'placement': 30,
  'result': 20,
  'event': 10,
  'general': 0
};

/**
 * Returns notifications relevant to the user, sorted by priority (Weight + Recency)
 */
function getAll(userId, limit = 10) {
  return notifications
    .filter(n => 
      n.targetUserIds?.length === 0 || // Broadcast
      n.targetUserIds?.includes(userId) || // Targeted
      n.userId === userId // Created by this user
    )
    .map(n => {
      // Calculate priority score for sorting
      const weight = TYPE_WEIGHTS[n.type?.toLowerCase()] || 0;
      const recency = new Date(n.createdAt).getTime();
      return {
        ...n,
        isRead: n.readBy?.includes(userId) || false,
        priorityScore: weight + (recency / 10000000000) // Small weight for recency to keep it as a tie-breaker
      };
    })
    .sort((a, b) => {
      // Sort by priority score descending
      const weightA = TYPE_WEIGHTS[a.type?.toLowerCase()] || 0;
      const weightB = TYPE_WEIGHTS[b.type?.toLowerCase()] || 0;
      
      if (weightA !== weightB) return weightB - weightA;
      return new Date(b.createdAt) - new Date(a.createdAt); // Recency as tie-breaker
    })
    .slice(0, limit); // Top 'n' notifications
}

function getById(id, userId) {
  const n = notifications.find(n => 
    n.id === id && (
      n.targetUserIds?.length === 0 || 
      n.targetUserIds?.includes(userId) || 
      n.userId === userId
    )
  );
  
  if (!n) return null;
  return {
    ...n,
    isRead: n.readBy?.includes(userId) || false
  };
}

function create({ type, title, message, category, targetUserIds = [], createdBy }) {
  const notification = {
    id: uuidv4(),
    type: type?.toLowerCase(),
    title,
    message,
    category,
    readBy: [], 
    targetUserIds: targetUserIds || [],
    userId: createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notifications.push(notification);
  return notification;
}

function markRead(id, userId) {
  const n = notifications.find(n => n.id === id);
  if (!n) return null;
  
  if (!n.readBy) n.readBy = [];
  if (!n.readBy.includes(userId)) {
    n.readBy.push(userId);
    n.updatedAt = new Date().toISOString();
  }
  
  return {
    ...n,
    isRead: true
  };
}

function markAllRead(userId) {
  let count = 0;
  notifications.forEach(n => {
    const isTargeted = n.targetUserIds?.length === 0 || n.targetUserIds?.includes(userId) || n.userId === userId;
    if (isTargeted && !n.readBy?.includes(userId)) {
      if (!n.readBy) n.readBy = [];
      n.readBy.push(userId);
      n.updatedAt = new Date().toISOString();
      count++;
    }
  });
  return count;
}

function remove(id, userId) {
  const idx = notifications.findIndex(n => n.id === id);
  if (idx === -1) return false;
  notifications.splice(idx, 1);
  return true;
}

function getUnreadCount(userId) {
  return notifications.filter(n => {
    const isTargeted = n.targetUserIds?.length === 0 || n.targetUserIds?.includes(userId) || n.userId === userId;
    return isTargeted && !n.readBy?.includes(userId);
  }).length;
}

function fetchFromEvaluationAPI(apiNotifications) {
  // Map API fields (Capitalized) to local fields (lowercase)
  apiNotifications.forEach(n => {
    const id = n.ID || n.id;
    if (!notifications.find(x => x.id === id)) {
      const type = (n.Type || n.type || 'general').toLowerCase();
      notifications.push({ 
        id,
        type,
        title: n.Message || n.title || 'Notification', // Use message as title if title missing
        message: n.Message || n.message || '',
        category: n.Category || n.category || (type.charAt(0).toUpperCase() + type.slice(1) + 's'),
        createdAt: n.Timestamp || n.createdAt || new Date().toISOString(),
        updatedAt: n.Timestamp || n.updatedAt || new Date().toISOString(),
        readBy: [], 
        targetUserIds: [] // API notifications are broadcast to all
      });
    }
  });
}

module.exports = { getAll, getById, create, markRead, markAllRead, remove, getUnreadCount, fetchFromEvaluationAPI };
