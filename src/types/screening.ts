export interface ScreeningResult {
  age_months: number;
  eye_contact_score: 0 | 1 | 2;
  response_to_name_score: 0 | 1 | 2;
  response_latency_ms: number | null;
  vocalization_score: 0 | 1 | 2;
  gesture_joint_attention_score: 0 | 1 | 2;
  repetitive_behavior_score: 0 | 1 | 2;
}

export interface ModuleProps {
  onComplete: (data: any) => void;
}
