import subprocess
import os

def separate_stems(input_audio, output_dir):
    """Performs stem separation using Demucs."""
    try:
        command = [
            "demucs", "--out", output_dir, "--two-stems", "vocals", input_audio
        ]
        subprocess.run(command, check=True)
        print(f"Stem separation completed! Check '{output_dir}' for results.")
    except subprocess.CalledProcessError as e:
        print(f"Error during stem separation: {e}")

if __name__ == "__main__":
    input_audio = "./input/Edhuvaraiyo-Edhuvaraiyo-Intha-MassTamilan.com.mp3"  # Change this to your audio file path
    output_dir = "./output"  # Output directory for separated files
    
    os.makedirs(output_dir, exist_ok=True)
    separate_stems(input_audio, output_dir)
