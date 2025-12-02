import numpy as np
import base64
import struct

class AudioAnalyzer:
    def __init__(self):
        self.sample_rate = 16000  # 16kHz
        self.silence_threshold = 300  # RMS threshold for silence
        self.speech_threshold = 600  # RMS threshold for speech
        
    def analyze_audio_chunk(self, audio_data_base64):
        """
        Analyzes a chunk of audio data.
        Expected format: base64 encoded PCM audio (16-bit, mono, 16kHz)
        
        Returns:
        {
            "rms": float,  # Root Mean Square (volume)
            "is_speech": bool,  # Whether speech/vocalization detected
            "energy": float  # Audio energy
        }
        """
        try:
            # Decode base64
            if ',' in audio_data_base64:
                audio_data_base64 = audio_data_base64.split(',')[1]
            
            audio_bytes = base64.b64decode(audio_data_base64)
            
            # Convert bytes to numpy array (16-bit PCM)
            audio_data = np.frombuffer(audio_bytes, dtype=np.int16)
            
            if len(audio_data) == 0:
                return None
            
            # Calculate RMS (Root Mean Square) - volume level
            rms = np.sqrt(np.mean(audio_data.astype(np.float32) ** 2))
            
            # Calculate energy
            energy = np.sum(audio_data.astype(np.float32) ** 2) / len(audio_data)
            
            # Detect speech/vocalization
            is_speech = rms > self.speech_threshold
            is_silence = rms < self.silence_threshold
            
            return {
                "rms": float(rms),
                "energy": float(energy),
                "is_speech": is_speech,
                "is_silence": is_silence,
                "volume_level": self._categorize_volume(rms)
            }
            
        except Exception as e:
            print(f"Error analyzing audio: {e}")
            return None
    
    def _categorize_volume(self, rms):
        """Categorize volume into levels"""
        if rms < self.silence_threshold:
            return "silence"
        elif rms < self.speech_threshold:
            return "quiet"
        elif rms < 3000:
            return "moderate"
        else:
            return "loud"

# Singleton instance
audio_analyzer = AudioAnalyzer()
