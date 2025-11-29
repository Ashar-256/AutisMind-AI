import base64
import numpy as np
from audio_analyzer import audio_analyzer

def test_audio_analyzer():
    print("Testing AudioAnalyzer...")
    
    # Generate silence
    silence = np.zeros(16000, dtype=np.int16)
    silence_bytes = silence.tobytes()
    silence_b64 = base64.b64encode(silence_bytes).decode('utf-8')
    
    result = audio_analyzer.analyze_audio_chunk(silence_b64)
    print(f"Silence Result: RMS={result['rms']:.2f}, Speech={result['is_speech']}, Silence={result['is_silence']}")
    
    if result['is_silence']:
        print("PASS: Silence detected correctly")
    else:
        print("FAIL: Silence not detected")

    # Generate loud noise (simulating speech volume)
    # Amplitude 5000 should give RMS around 2886 (5000/sqrt(3))
    noise = np.random.randint(-5000, 5000, 16000, dtype=np.int16)
    noise_bytes = noise.tobytes()
    noise_b64 = base64.b64encode(noise_bytes).decode('utf-8')
    
    result = audio_analyzer.analyze_audio_chunk(noise_b64)
    print(f"Noise Result: RMS={result['rms']:.2f}, Speech={result['is_speech']}, Silence={result['is_silence']}")
    
    if result['is_speech']:
        print("PASS: Speech/Noise detected correctly")
    else:
        print("FAIL: Speech/Noise not detected")

if __name__ == "__main__":
    test_audio_analyzer()
