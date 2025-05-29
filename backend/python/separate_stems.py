from fastapi import FastAPI, UploadFile, File, Form
import subprocess
import os
from pathlib import Path

app = FastAPI()

# Directories
SEPARATED_DIR = "stems/separated"
ADJUSTED_DIR = "stems/adjusted"
MERGED_DIR = "stems/merged"

# Ensure directories exist
os.makedirs(SEPARATED_DIR, exist_ok=True)
os.makedirs(ADJUSTED_DIR, exist_ok=True)
os.makedirs(MERGED_DIR, exist_ok=True)

@app.post("/separate")
async def separate_stems(file: UploadFile = File(...)):
    """Separates stems using Demucs."""
    input_path = f"stems/{file.filename}"
    output_path = SEPARATED_DIR
    
    with open(input_path, "wb") as f:
        f.write(file.file.read())
    
    command = ["demucs", "-o", output_path, input_path]
    subprocess.run(command, check=True)
    
    return {"message": "Stem separation completed", "output_dir": output_path}

@app.post("/adjust")
async def adjust_stem(
    stem: str = Form(...),
    volume: float = Form(...),
):
    """Adjusts volume of a stem using FFmpeg."""
    input_file = f"{SEPARATED_DIR}/{stem}.wav"
    output_file = f"{ADJUSTED_DIR}/{stem}_adjusted.wav"
    
    command = ["ffmpeg", "-i", input_file, "-filter:a", f"volume={volume}", output_file]
    subprocess.run(command, check=True)
    
    return {"message": "Volume adjusted", "file": output_file}

@app.post("/merge")
async def merge_stems():
    """Merges adjusted stems into a final track."""
    merged_file = f"{MERGED_DIR}/final_mix.wav"
    
    command = ["ffmpeg", "-i", f"{ADJUSTED_DIR}/vocals_adjusted.wav", 
                         "-i", f"{ADJUSTED_DIR}/drums_adjusted.wav", 
                         "-i", f"{ADJUSTED_DIR}/bass_adjusted.wav", 
                         "-i", f"{ADJUSTED_DIR}/other_adjusted.wav", 
                         "-filter_complex", "amix=inputs=4:duration=first", merged_file]
    subprocess.run(command, check=True)
    
    return {"message": "Merged file created", "file": merged_file}
