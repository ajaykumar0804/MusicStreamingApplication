from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import subprocess
import time
import threading
import glob
import io
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)

# Temporary directories
TEMP_DIR = "temp"
UPLOAD_FOLDER = os.path.join(TEMP_DIR, "uploads")
STEMS_FOLDER = os.path.join(TEMP_DIR, "stems")
MERGED_FOLDER = os.path.join(TEMP_DIR, "merged")

for folder in [UPLOAD_FOLDER, STEMS_FOLDER, MERGED_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Dictionary to track job statuses
jobs = {}

# Cleanup function to delete old files
def cleanup_temp_files():
    """Deletes temp files older than 5 minutes."""
    while True:
        now = time.time()
        for folder in [UPLOAD_FOLDER, STEMS_FOLDER, MERGED_FOLDER]:
            for file in os.listdir(folder):
                file_path = os.path.join(folder, file)
                try:
                    if os.path.isfile(file_path) and os.stat(file_path).st_mtime < now - 1800:
                        os.remove(file_path)
                    elif os.path.isdir(file_path) and not os.listdir(file_path):
                        os.rmdir(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
        time.sleep(60)

# Background Demucs separation
# def separate_stems_async(file_path, output_dir, job_id):
#     """Runs Demucs stem separation asynchronously."""
#     command = f"demucs --out {output_dir} {file_path}"
#     result = subprocess.run(command, shell=True, capture_output=True, text=True)

#     if result.returncode != 0:
#         jobs[job_id] = {"status": "failed", "error": "Stem separation failed!"}
#         return

#     stems = ["vocals", "drums", "bass", "other"]
#     stem_paths = {}

#     for stem in stems:
#         stem_path = os.path.join(output_dir, "htdemucs", os.path.splitext(os.path.basename(file_path))[0], f"{stem}.wav")
#         if os.path.exists(stem_path):
#             stem_paths[stem] = stem_path

#     jobs[job_id] = {"status": "completed", "stems": stem_paths}

def separate_stems_async(file_path, output_dir, job_id):
    """Runs Demucs stem separation asynchronously and updates status."""
    command = f"demucs --out {output_dir} {file_path}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

    if result.returncode != 0:
        jobs[job_id] = {"status": "failed", "error": "Stem separation failed!"}
        return

    stems = ["vocals", "drums", "bass", "other"]
    stem_paths = {}

    for stem in stems:
        stem_path = os.path.join(output_dir, "htdemucs", os.path.splitext(os.path.basename(file_path))[0], f"{stem}.wav")
        if os.path.exists(stem_path):
            stem_paths[stem] = stem_path

    if stem_paths:
        jobs[job_id] = {
            "status": "completed",
            "stems": stem_paths,
            "message": "Separation successful!",
        }
    else:
        jobs[job_id] = {"status": "failed", "error": "No stems found after separation!"}


@app.route("/api/stem/separate", methods=["POST"])
def separate_stems():
    """Starts stem separation and returns job ID."""
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No file uploaded!"}), 400

        file = request.files["audio"]
        if not file:
            return jsonify({"error": "Invalid file!"}), 400

        job_id = str(uuid.uuid4())
        filename = f"{job_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        output_dir = os.path.join(STEMS_FOLDER, f"output_{job_id}")
        os.makedirs(output_dir, exist_ok=True)

        jobs[job_id] = {"status": "processing"}

        threading.Thread(target=separate_stems_async, args=(file_path, output_dir, job_id)).start()

        return jsonify({"job_id": job_id, "message": "Processing started!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/stem/status/<job_id>", methods=["GET"])
def check_status(job_id):
    """Check the status of a stem separation job."""
    print(f"🟢 Checking Status for Job ID: {job_id}")
    print("Current Jobs:", jobs)
    if job_id in jobs:
        print(f"✅ Found Job: {jobs[job_id]}")
        return jsonify(jobs[job_id])
    return jsonify({"error": "Job not found!"}), 404

@app.route("/api/stem/download/<job_id>/<stem_name>", methods=["GET"])
def download_stem(job_id, stem_name):
    """Find and return a separated stem file for download."""
    job = jobs.get(job_id, {})
    stem_path = job.get("stems", {}).get(stem_name)

    if stem_path and os.path.exists(stem_path):
        return send_file(stem_path, as_attachment=True)

    return jsonify({"error": "File not found"}), 404


@app.route("/api/stem/merge", methods=["POST"])
def merge_stems():
    """Merge stems with user-defined volume levels and return the file directly."""
    try:
        data = request.json
        job_id = data.get("job_id")  # ✅ Ensure consistency with frontend
        levels = data.get("levels", {})

        print("🔹 Received job_id:", job_id)
        print("🔹 Received Levels from Frontend:", levels)  

        if not job_id or job_id not in jobs:
            return jsonify({"error": "Invalid job ID"}), 400

        stem_paths = jobs[job_id].get("stems", {})
        if not stem_paths:
            return jsonify({"error": "Stems not found!"}), 400

        mixed_audio = None

        for stem, path in stem_paths.items():
            if os.path.exists(path):
                audio = AudioSegment.from_file(path)

                # 🔥 Fix: Correct volume adjustment calculation
                volume_adjustment = 20 * (levels.get(stem, 1) - 1)  
                audio = audio + volume_adjustment  # Adjust audio volume

                mixed_audio = audio if mixed_audio is None else mixed_audio.overlay(audio)

        if mixed_audio:
            output_path = os.path.join(MERGED_FOLDER, f"{job_id}_merged.wav")
            mixed_audio.export(output_path, format="wav")

            jobs[job_id]["merged_file"] = output_path
            return jsonify({"success": True, "mergedFile": job_id})

        return jsonify({"error": "Merging failed"}), 500

    except Exception as e:
        print("🚨 Error in merging:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/stem/download/<job_id>", methods=["GET"])
def download_merged_audio(job_id):
    """Serve the merged audio file for download."""
    
    print(f"🟢 Download request for Job ID: {job_id}")
    print("📌 Current Jobs:", jobs)  # Debug: Print all stored jobs
    
    job = jobs.get(job_id)

    if not job:
        print(f"❌ Job {job_id} not found!")
        return jsonify({"error": "Job not found"}), 404

    merged_file = job.get("merged_file")

    if not merged_file or not os.path.exists(merged_file):
        print(f"❌ Merged file not found for Job {job_id}!")
        return jsonify({"error": "File not found"}), 404

    print(f"✅ Sending merged file for Job {job_id}: {merged_file}")
    return send_file(merged_file, as_attachment=True, mimetype="audio/wav")



@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    threading.Thread(target=cleanup_temp_files, daemon=True).start()
    app.run(debug=True,use_reloader=False, port=5000)
