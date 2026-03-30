import random
import math

class QAgent:
    def __init__(self, alpha=0.1, gamma=0.9, epsilon=0.2):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        # Q-table: State (distance_category, urgency_category) -> Q-value
        self.q_table = {}

    def get_state(self, boat, cell):
        # Discretize state to reduce space
        distance = abs(boat.x - cell.x) + abs(boat.y - cell.y)
        dist_cat = distance // 3 # 0, 1, 2, ...
        urgency_cat = int(cell.urgency // 10)
        return (dist_cat, urgency_cat)

    def select_action(self, boat, grid):
        # Action is selecting a target cell
        # Grid is a 2D array of dicts from simulation state
        available_targets = []
        for x, row in enumerate(grid):
            for y, cell in enumerate(row):
                if cell["population"] > 0 and not cell["reserved"]:
                    # Create cell object stub for state calc
                    class Stub: pass
                    c = Stub()
                    c.x = x
                    c.y = y
                    c.urgency = cell["urgency"]
                    available_targets.append((x, y, c))

        if not available_targets:
            return None

        # Epsilon-greedy exploration
        if random.random() < self.epsilon:
            target = random.choice(available_targets)
            return (target[0], target[1])

        # Exploitation
        best_value = -float('inf')
        best_action = None

        for x, y, c in available_targets:
            state = self.get_state(boat, c)
            q_val = self.q_table.get(state, 0)
            
            # Add a slight tie-breaker based on pure distance to avoid stalls
            q_val -= (abs(boat.x - x) + abs(boat.y - y)) * 0.01

            if q_val > best_value:
                best_value = q_val
                best_action = (x, y)

        if not best_action:
            target = random.choice(available_targets)
            best_action = (target[0], target[1])
            
        return best_action

    def update_q_value(self, state, reward, next_state_max_q):
        old_val = self.q_table.get(state, 0)
        new_val = old_val + self.alpha * (reward + self.gamma * next_state_max_q - old_val)
        self.q_table[state] = new_val

    def reward_boat(self, boat, target_cell):
        # Called when a boat reaches a destination or completes a rescue
        state = self.get_state(boat, target_cell)
        reward = target_cell.urgency * 10 - target_cell.water_level * 2
        self.update_q_value(state, reward, 0) # 0 for terminal state of this run

