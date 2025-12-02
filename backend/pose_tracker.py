import mediapipe as mp
import cv2
import numpy as np
import csv
from datetime import datetime
from collections import defaultdict

class PoseTracker:
    """
    Advanced pose tracker for detecting repetitive behaviors
    using MediaPipe Pose landmarks
    """
    
    def __init__(self, movement_threshold=0.02, log_to_csv=False):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        self.movement_threshold = movement_threshold
        self.log_to_csv_enabled = log_to_csv
        
        # Movement tracking
        self.prev_landmarks = {}
        self.movement_counters = defaultdict(int)
        
        # Pattern detection
        self.hand_movement_history = []
        self.body_sway_history = []
        self.max_history_length = 30  # frames
        
        # CSV logging setup
        self.csv_file = None
        if self.log_to_csv_enabled:
            self.csv_file = f"pose_tracking_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            self.init_csv()
    
    def init_csv(self):
        """Initialize CSV file for logging movements"""
        try:
            with open(self.csv_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'timestamp', 'landmark', 'x', 'y', 'z', 
                    'movement_detected', 'pattern_type'
                ])
        except Exception as e:
            print(f"CSV init error: {e}")
    
    def log_movement(self, landmark_name, coords, movement_detected, pattern_type=""):
        """Log movement to CSV"""
        if not self.csv_file:
            return
            
        try:
            with open(self.csv_file, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    datetime.now().isoformat(),
                    landmark_name,
                    coords.get('x', 0),
                    coords.get('y', 0),
                    coords.get('z', 0),
                    movement_detected,
                    pattern_type
                ])
        except Exception as e:
            print(f"CSV logging error: {e}")
    
    def process_frame(self, image):
        """
        Process a frame and detect pose landmarks and repetitive patterns
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            dict: Contains pose_detected, landmarks, movement_counters, repetitive_patterns
        """
        try:
            if image is None:
                return None
            
            # Convert to RGB for MediaPipe
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(image_rgb)
            
            if not results.pose_landmarks:
                return {
                    "pose_detected": False
                }
            
            # Extract landmarks
            landmarks = self._extract_landmarks(results.pose_landmarks)
            
            # Detect movements
            movements = self._detect_movements(landmarks)
            
            # Detect repetitive patterns
            patterns = self._detect_patterns(landmarks)
            
            return {
                "pose_detected": True,
                "landmarks": landmarks,
                "movement_counters": dict(self.movement_counters),
                "repetitive_patterns": patterns
            }
            
        except Exception as e:
            print(f"Pose tracking error: {e}")
            return None
    
    def _extract_landmarks(self, pose_landmarks):
        """Extract key landmarks from MediaPipe results"""
        landmarks = {}
        
        # Key landmarks to track
        landmark_names = {
            0: "NOSE",
            11: "LEFT_SHOULDER",
            12: "RIGHT_SHOULDER",
            13: "LEFT_ELBOW",
            14: "RIGHT_ELBOW",
            15: "LEFT_WRIST",
            16: "RIGHT_WRIST",
            23: "LEFT_HIP",
            24: "RIGHT_HIP",
            25: "LEFT_KNEE",
            26: "RIGHT_KNEE",
            27: "LEFT_ANKLE",
            28: "RIGHT_ANKLE"
        }
        
        for idx, name in landmark_names.items():
            lm = pose_landmarks.landmark[idx]
            landmarks[name] = {
                "x": lm.x,
                "y": lm.y,
                "z": lm.z,
                "visibility": lm.visibility
            }
        
        return landmarks
    
    def _detect_movements(self, landmarks):
        """Detect significant movements in landmarks"""
        movements = {}
        
        for name, coords in landmarks.items():
            if name in self.prev_landmarks:
                prev = self.prev_landmarks[name]
                
                # Calculate Euclidean distance
                distance = np.sqrt(
                    (coords['x'] - prev['x'])**2 +
                    (coords['y'] - prev['y'])**2 +
                    (coords['z'] - prev['z'])**2
                )
                
                if distance > self.movement_threshold:
                    self.movement_counters[name] += 1
                    movements[name] = True
                    self.log_movement(name, coords, True)
                else:
                    movements[name] = False
        
        # Update previous landmarks
        self.prev_landmarks = landmarks.copy()
        
        return movements
    
    def _detect_patterns(self, landmarks):
        """Detect repetitive behavior patterns"""
        patterns = {
            "hand_flapping": False,
            "rocking": False,
            "arm_swaying": False,
            "total_movements": sum(self.movement_counters.values())
        }
        
        # Hand flapping detection
        if "LEFT_WRIST" in landmarks and "RIGHT_WRIST" in landmarks:
            left_wrist_y = landmarks["LEFT_WRIST"]["y"]
            right_wrist_y = landmarks["RIGHT_WRIST"]["y"]
            
            # Track hand vertical movement
            current_hand_height = (left_wrist_y + right_wrist_y) / 2
            self.hand_movement_history.append(current_hand_height)
            
            if len(self.hand_movement_history) > self.max_history_length:
                self.hand_movement_history.pop(0)
            
            # Detect oscillation (hand flapping)
            if len(self.hand_movement_history) >= 10:
                recent_movements = self.hand_movement_history[-10:]
                movement_variance = np.var(recent_movements)
                
                # High variance indicates flapping
                if movement_variance > 0.01:
                    patterns["hand_flapping"] = True
                    self.log_movement("HANDS", {"x": 0, "y": current_hand_height, "z": 0}, 
                                    True, "hand_flapping")
        
        # Rocking detection (body sway)
        if "LEFT_SHOULDER" in landmarks and "RIGHT_SHOULDER" in landmarks:
            shoulder_center_x = (landmarks["LEFT_SHOULDER"]["x"] + 
                                landmarks["RIGHT_SHOULDER"]["x"]) / 2
            
            self.body_sway_history.append(shoulder_center_x)
            
            if len(self.body_sway_history) > self.max_history_length:
                self.body_sway_history.pop(0)
            
            # Detect side-to-side rocking
            if len(self.body_sway_history) >= 10:
                recent_sway = self.body_sway_history[-10:]
                sway_variance = np.var(recent_sway)
                
                # High variance indicates rocking
                if sway_variance > 0.005:
                    patterns["rocking"] = True
                    self.log_movement("BODY", {"x": shoulder_center_x, "y": 0, "z": 0},
                                    True, "rocking")
        
        # Arm swaying detection
        if ("LEFT_WRIST" in self.movement_counters and 
            "RIGHT_WRIST" in self.movement_counters):
            
            total_arm_movements = (self.movement_counters["LEFT_WRIST"] + 
                                  self.movement_counters["RIGHT_WRIST"])
            
            if total_arm_movements > 20:  # Threshold for repetitive arm movement
                patterns["arm_swaying"] = True
        
        return patterns
    
    def reset_counters(self):
        """Reset all movement counters for a new session"""
        self.movement_counters.clear()
        self.hand_movement_history.clear()
        self.body_sway_history.clear()
        self.prev_landmarks.clear()
        
        # Create new CSV file only if enabled
        if self.log_to_csv_enabled:
            self.csv_file = f"pose_tracking_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            self.init_csv()
