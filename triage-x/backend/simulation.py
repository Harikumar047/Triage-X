import random
import math

LAT_MIN = 12.90
LAT_MAX = 13.15
LNG_MIN = 80.10
LNG_MAX = 80.30

class GridCell:
    def __init__(self, x, y, grid_w, grid_h):
        self.x = x
        self.y = y
        
        self.lng_width = (LNG_MAX - LNG_MIN) / grid_w
        self.lat_height = (LAT_MAX - LAT_MIN) / grid_h
        
        self.lng_min = LNG_MIN + x * self.lng_width
        self.lng_max = self.lng_min + self.lng_width
        
        self.lat_max = LAT_MAX - y * self.lat_height
        self.lat_min = self.lat_max - self.lat_height
        
        self.center_lat = (self.lat_min + self.lat_max) / 2
        self.center_lng = (self.lng_min + self.lng_max) / 2
        
        self.base_elevation = random.randint(1, 10)
        self.water_level = 0
        self.population = random.randint(0, 100) if random.random() > 0.4 else 0
        self.reserved = False # If a boat is already heading here
        
    @property
    def urgency(self):
        return (self.water_level * 5) + (self.population * 0.5)

    def update_condition(self, severity_factor):
        if random.random() < severity_factor and self.base_elevation < 8:
            self.water_level = min(5, self.water_level + 1)
            
    def to_dict(self):
        return {
            "x": self.x,
            "y": self.y,
            "bounds": [[self.lat_min, self.lng_min], [self.lat_max, self.lng_max]],
            "center": [self.center_lat, self.center_lng],
            "water_level": self.water_level,
            "population": self.population,
            "urgency": self.urgency,
            "reserved": self.reserved
        }

class Boat:
    def __init__(self, id, x, y, grid_w, grid_h):
        self.id = id
        self.x = x
        self.y = y
        self.grid_w = grid_w
        self.grid_h = grid_h
        self.target = None
        self.status = "idle"
        self.rescue_time_left = 0
        self.update_geo()

    def update_geo(self):
        lng_width = (LNG_MAX - LNG_MIN) / self.grid_w
        lat_height = (LAT_MAX - LAT_MIN) / self.grid_h
        lng_min = LNG_MIN + self.x * lng_width
        lat_max = LAT_MAX - self.y * lat_height
        self.lat = (lat_max + (lat_max - lat_height)) / 2
        self.lng = (lng_min + (lng_min + lng_width)) / 2

    def move_towards(self, tx, ty):
        if self.x < tx: self.x += 1
        elif self.x > tx: self.x -= 1
        elif self.y < ty: self.y += 1
        elif self.y > ty: self.y -= 1
        self.update_geo()

    def to_dict(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "lat": self.lat,
            "lng": self.lng,
            "target": self.target,
            "status": self.status
        }

class Simulation:
    def __init__(self, width=15, height=10, num_boats=3):
        self.width = width
        self.height = height
        self.grid_w = width
        self.grid_h = height
        self.grid = [[GridCell(x, y, width, height) for y in range(height)] for x in range(width)]
        self.boats = [Boat(f"B{i+1}", 0, 0, width, height) for i in range(num_boats)]
        self.scenario = "low"
        self.mode = "ai"
        
        # Metrics
        self.lives_saved = 0
        self.total_response_time = 0
        self.rescues_completed = 0
        self.efficiency_start = 100

    def set_scenario(self, scenario):
        self.scenario = scenario
        for row in self.grid:
            for cell in row:
                cell.water_level = 0
                if scenario == "flash" and random.random() > 0.7:
                    cell.water_level = 2
                elif scenario == "extreme" and random.random() > 0.4:
                    cell.water_level = 3

    def tick(self):
        severity = {"low": 0.05, "flash": 0.15, "extreme": 0.3}.get(self.scenario, 0.1)
        
        for row in self.grid:
            for cell in row:
                cell.update_condition(severity)
                
        for boat in self.boats:
            if boat.target:
                tx, ty = boat.target
                if boat.x == tx and boat.y == ty:
                    if boat.status != "rescuing":
                        boat.status = "rescuing"
                        boat.rescue_time_left = 2
                    else:
                        boat.rescue_time_left -= 1
                        if boat.rescue_time_left <= 0:
                            cell = self.grid[tx][ty]
                            self.lives_saved += cell.population
                            cell.population = 0
                            cell.water_level = 0
                            cell.reserved = False
                            
                            boat.target = None
                            boat.status = "idle"
                            self.rescues_completed += 1
                            self.efficiency_start += 2
                else:
                    boat.status = "moving"
                    boat.move_towards(tx, ty)
                    
        total_urgency = sum(c.urgency for row in self.grid for c in row if c.population > 0)
        if total_urgency > 100:
            self.efficiency_start -= 1
        
        return self.get_state()

    def assign_boat(self, boat_id, target_x, target_y):
        for boat in self.boats:
            if boat.id == boat_id:
                boat.target = (target_x, target_y)
                self.grid[target_x][target_y].reserved = True
                break

    def get_state(self):
        return {
            "grid": [[c.to_dict() for c in row] for row in self.grid],
            "boats": [b.to_dict() for b in self.boats],
            "metrics": {
                "lives_saved": self.lives_saved,
                "efficiency": max(0, min(100, self.efficiency_start)),
                "active_zones": sum(1 for row in self.grid for c in row if c.urgency > 10),
                "avg_response_time": max(2, 5 + len(self.boats) - self.rescues_completed*0.1)
            },
            "mode": self.mode,
            "scenario": self.scenario
        }
