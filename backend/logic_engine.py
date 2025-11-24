import math

class NeuroLensLogicEngine:
    def __init__(self):
        pass

    def analyze(self, raw_metrics):
        """
        Analyzes raw metrics and returns computed scores and interpretation.
        
        Expected raw_metrics structure:
        {
            "totalFrames": int,
            "framesFaceDetected": int,
            "framesSocialSide": int,
            "framesGeometricSide": int,
            "sideSwitchCount": int,
            "startTime": float,
            "endTime": float,
            "durationSec": float
        }
        """
        
        # 1. Validate Data
        if raw_metrics.get("totalFrames", 0) < 40:
            return {
                "error": "Insufficient data collected. Please ensure the participant stays within camera frame and retry the demo.",
                "scores": {},
                "interpretation": "Insufficient data."
            }

        total_frames = raw_metrics["totalFrames"]
        frames_face_detected = raw_metrics["framesFaceDetected"]
        frames_social = raw_metrics["framesSocialSide"]
        frames_geometric = raw_metrics["framesGeometricSide"]
        side_switches = raw_metrics["sideSwitchCount"]

        # 2. Compute Scores
        
        # Engagement Score: 0.0 - 1.0
        engagement_score = 0.0
        if total_frames > 0:
            engagement_score = frames_face_detected / total_frames

        # Visual Preference Scores: 0.0 - 1.0
        social_preference = 0.0
        geometric_preference = 0.0
        
        if frames_face_detected > 0:
            social_preference = frames_social / frames_face_detected
            geometric_preference = frames_geometric / frames_face_detected

        # Attention Shifts (Raw count)
        attention_shifts = side_switches

        # 3. Derive Classifications
        
        # Dominant Focus
        dominant_focus = "mixed/no strong preference"
        if geometric_preference > 0.7:
            dominant_focus = "geometric"
        elif social_preference > 0.7:
            dominant_focus = "social"

        # Engagement Classification
        engagement_class = "low engagement"
        if engagement_score > 0.8:
            engagement_class = "high engagement"
        elif engagement_score > 0.5:
            engagement_class = "moderate engagement"

        # Attention Flexibility
        attention_flexibility = "low flexibility"
        if attention_shifts >= 5:
            attention_flexibility = "flexible attention"
        elif attention_shifts >= 2:
            attention_flexibility = "moderate flexibility"

        # 4. Generate Interpretation Summary
        pattern_summary = ""

        # A. Preference Patterns
        if geometric_preference > 0.7:
            pattern_summary += "In this demo, the participant looked more at geometric visual patterns compared to social visuals. "
        elif social_preference > 0.7:
            pattern_summary += "In this demo, the participant showed more focus on social visual content compared to geometric patterns. "
        else:
            pattern_summary += "The participant showed a balanced interest between social and geometric visuals. "

        # B. Engagement Interpretation
        if engagement_score > 0.8:
            pattern_summary += "Engagement level was consistently high throughout the demo. "
        elif engagement_score > 0.5:
            pattern_summary += "Engagement level was moderate with occasional periods of disengagement. "
        else:
            pattern_summary += "Engagement was relatively low, with several periods where the participant was not detected in the camera frame. "

        # C. Attention Shifting Interpretation
        if attention_shifts >= 5:
            pattern_summary += "Frequent visual shifts were observed between the two types of content. "
        elif attention_shifts >= 2:
            pattern_summary += "Some natural shifting of visual attention was observed. "
        else:
            pattern_summary += "Very few attention shifts were observed during the demo. "

        # D. Final Neutral Summary Line
        pattern_summary += "This demo reflects only momentary behavior during a short session and is not a diagnostic tool. For real behavioral concerns, consult a qualified professional."

        # 5. Construct Final Output
        return {
            "metrics": raw_metrics,
            "scores": {
                "engagementScore": round(engagement_score, 2),
                "socialPreference": round(social_preference, 2),
                "geometricPreference": round(geometric_preference, 2),
                "attentionShifts": attention_shifts
            },
            "classifications": {
                "dominantFocus": dominant_focus,
                "engagementClass": engagement_class,
                "attentionFlexibility": attention_flexibility
            },
            "interpretation": pattern_summary
        }

# Singleton instance
logic_engine = NeuroLensLogicEngine()
