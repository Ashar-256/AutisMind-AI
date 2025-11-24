import mediapipe as mp
import cv2
import numpy as np
import base64
from pose_tracker import PoseTracker

class TrackingEngine:
    def __init__(self):
        # Face Mesh for Gaze & Head Pose
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Pose for Body Movement (Repetitive behaviors)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Hands for Gestures (Pointing)
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Advanced Pose Tracker for detailed analysis
        self.pose_tracker = PoseTracker(movement_threshold=0.02)

    def process_frame(self, image_data_base64, task_type="eye_contact"):
        """
        Processes a frame based on the task type.
        """
        try:
            # Decode image
            if ',' in image_data_base64:
                image_data_base64 = image_data_base64.split(',')[1]
            
            image_bytes = base64.b64decode(image_data_base64)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return None

            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = {}

            # 1. Eye Contact / Face Logic
            if task_type in ["eye_contact", "name_response"]:
                face_results = self.face_mesh.process(image_rgb)
                if face_results.multi_face_landmarks:
                    results["face_detected"] = True
                    landmarks = face_results.multi_face_landmarks[0].landmark
                    
                    # Nose tip (1)
                    nose = landmarks[1]
                    results["face_x"] = nose.x
                    results["face_y"] = nose.y
                    
                    # Head Pose Approximation
                    left_ear = landmarks[234]
                    right_ear = landmarks[454]
                    mid_ear_x = (left_ear.x + right_ear.x) / 2
                    # Yaw: Positive = Left turn (user's right), Negative = Right turn
                    results["head_yaw"] = nose.x - mid_ear_x 
                    
                    # Gaze (Simple nose-based)
                    results["gaze_x"] = nose.x
                else:
                    results["face_detected"] = False

            # 2. Gestures Logic (Hands)
            if task_type == "gestures":
                hand_results = self.hands.process(image_rgb)
                if hand_results.multi_hand_landmarks:
                    results["hands_detected"] = True
                    # Check for pointing (Index finger extended, others curled)
                    # Simplified: Just detect if hand is present and raised
                    results["hand_count"] = len(hand_results.multi_hand_landmarks)
                else:
                    results["hands_detected"] = False

            # 3. Repetitive Behavior Logic (Advanced Pose)
            if task_type == "repetitive":
                # Use advanced pose tracker for detailed analysis
                pose_data = self.pose_tracker.process_frame(image)
                
                if pose_data and pose_data.get("pose_detected"):
                    results["pose_detected"] = True
                    
                    # Get landmarks data
                    landmarks = pose_data.get("landmarks", {})
                    
                    # Calculate body center X for basic tracking
                    if "LEFT_SHOULDER" in landmarks and "RIGHT_SHOULDER" in landmarks:
                        left_shoulder = landmarks["LEFT_SHOULDER"]
                        right_shoulder = landmarks["RIGHT_SHOULDER"]
                        results["body_x"] = (left_shoulder["x"] + right_shoulder["x"]) / 2
                    else:
                        results["body_x"] = 0.5
                    
                    # Include detailed landmark data
                    results["landmarks"] = landmarks
                    results["movement_counters"] = pose_data.get("movement_counters", {})
                    results["repetitive_patterns"] = pose_data.get("repetitive_patterns", {})
                    
                    # Calculate overall movement score
                    patterns = pose_data.get("repetitive_patterns", {})
                    results["movement_score"] = patterns.get("total_movements", 0)
                    results["hand_flapping_detected"] = patterns.get("hand_flapping", False)
                    results["rocking_detected"] = patterns.get("rocking", False)
                    results["arm_swaying_detected"] = patterns.get("arm_swaying", False)
                else:
                    results["pose_detected"] = False

            return results

        except Exception as e:
            print(f"Error processing frame: {e}")
            return None
    
    def reset_pose_tracking(self):
        """Reset the pose tracker counters for a new session."""
        self.pose_tracker.reset_counters()
