# Vehicle Maintenance Scheduler

A Node.js solution that uses **0/1 Knapsack dynamic programming** to optimally schedule vehicle maintenance tasks across depots, maximising total operational impact within available mechanic-hour budgets.

## Problem Statement

Each depot has a fixed number of **mechanic-hours** available per day. Each vehicle task has a **Duration** (hours) and an **Impact** (importance score). The goal is to select the subset of tasks that:
- Does **not** exceed the mechanic-hours budget
- **Maximises** the total impact score

## Algorithm

**0/1 Knapsack (Dynamic Programming)**
- Time complexity: O(n × W) where n = tasks, W = mechanic-hours budget
- Space complexity: O(n × W)
- Guarantees **globally optimal** solution

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set AUTH_TOKEN=<your token>
npm start
```

## Output

For each depot, the scheduler prints:
- Tasks selected vs total available
- Hours used vs budget
- Total impact score achieved
- Efficiency percentage
- List of selected task IDs

## Sample Output

```
============================================================
  Vehicle Maintenance Scheduler – Knapsack Optimizer
============================================================

Depot 1 (Budget: 60h)
  Tasks Selected  : 7 / 9
  Hours Used      : 32 / 60
  Total Impact    : 38
  Efficiency      : 53.3%
  Selected Tasks:
    - [264e638f-...]  Duration: 1h  Impact: 5
    ...
```
