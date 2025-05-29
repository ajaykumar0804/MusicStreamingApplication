from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import subprocess
import time
from pydub import AudioSegment
import threading
import glob


app = Flask(__name__)
CORS(app)

# app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB limit

TEMP_DIR = "temp"
UPLOAD_FOLDER = os.path.join(TEMP_DIR, "uploads")
STEMS_FOLDER = os.path.join(TEMP_DIR, "stems")
MERGED_FOLDER = os.path.join(TEMP_DIR, "merged")

# Create directories
for folder in [UPLOAD_FOLDER, STEMS_FOLDER, MERGED_FOLDER]:
    os.makedirs(folder, exist_ok=True)

def cleanup_temp_files():
    """Deletes files older than 1 hour from temp folders"""
    while True:
        now = time.time()
        for folder in [UPLOAD_FOLDER, STEMS_FOLDER, MERGED_FOLDER]:
            for file in os.listdir(folder):
                file_path = os.path.join(folder, file)
                try:
                    if os.path.isfile(file_path) and os.stat(file_path).st_mtime < now - 3600:
                        os.remove(file_path)
                    elif os.path.isdir(file_path) and not os.listdir(file_path):  # Delete empty folders
                        os.rmdir(file_path)
                except PermissionError:
                    print(f"Permission denied: {file_path}")
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
        time.sleep(1800)  # Run cleanup every 30 minutes

def separate_stems_async(file_path, output_dir, stems, response_data):
    """Runs Demucs separation in a thread and updates response data"""
    command = f"demucs --out {output_dir} {file_path}"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)

    if result.returncode != 0:
        response_data["error"] = "Stem separation failed!"
        return

    for stem in stems:
        stem_path = os.path.join(output_dir, "htdemucs", os.path.splitext(os.path.basename(file_path))[0], f"{stem}.wav")
        if os.path.exists(stem_path):
            response_data["stems"][stem] = stem_path

@app.route("/api/stem/separate", methods=["POST"])
def separate_stems():
    try:
        if "audio" not in request.files:
            return jsonify({"error": "No file uploaded!"}), 400

        file = request.files["audio"]
        if not file:
            return jsonify({"error": "Invalid file!"}), 400

        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        output_dir = os.path.join(STEMS_FOLDER, f"output_{uuid.uuid4()}")
        os.makedirs(output_dir, exist_ok=True)

        stems = ["vocals", "drums", "bass", "other"]
        response_data = {"success": True, "stems": {}}

        thread = threading.Thread(target=separate_stems_async, args=(file_path, output_dir, stems, response_data))
        thread.start()
        thread.join()  # Ensures response includes the updated stems

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/stem/download/<stem_name>", methods=["GET"])
def download_stem(stem_name):
    """Find and download the correct stem file"""
    search_path = os.path.join(STEMS_FOLDER, "**", stem_name)
    matching_files = glob.glob(search_path, recursive=True)

    if matching_files:
        return send_file(matching_files[0], as_attachment=True)

    return jsonify({"error": "File not found"}), 404

import io

@app.route("/api/stem/merge", methods=["POST"])
def merge_stems():
    """Merge stems with user-defined volume levels and return the file directly"""
    data = request.json
    stem_paths = data.get("stems", {})
    volume_levels = data.get("levels", {})

    if not stem_paths or not volume_levels:
        return jsonify({"error": "Invalid data"}), 400

    mixed_audio = None

    for stem, path in stem_paths.items():
        if os.path.exists(path):
            audio = AudioSegment.from_file(path) - (1 - float(volume_levels.get(stem, 1))) * 10
            mixed_audio = audio if mixed_audio is None else mixed_audio.overlay(audio)

    if mixed_audio:
        output_buffer = io.BytesIO()
        mixed_audio.export(output_buffer, format="wav")
        output_buffer.seek(0)

        return send_file(output_buffer, as_attachment=True, mimetype="audio/wav", download_name="merged_audio.wav")

    return jsonify({"error": "Merging failed"}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    threading.Thread(target=cleanup_temp_files, daemon=True).start()  # Start cleanup process
    app.run(debug=True, port=5000)
