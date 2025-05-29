import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fileUpload from "express-fileupload";

const TEMP_DIR = path.join(process.cwd(), "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

export const uploadAndSeparateStems = (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "No file uploaded!" });
    }
    
    const file = req.files.file;
    const filename = `${uuidv4()}-${file.name}`;
    const filePath = path.join(TEMP_DIR, filename);
    
    file.mv(filePath, (err) => {
        if (err) return res.status(500).json({ error: "File upload failed!" });
        
        const outputDir = path.join(TEMP_DIR, `output-${Date.now()}`);
        fs.mkdirSync(outputDir, { recursive: true });
        const command = `demucs --out "${outputDir}" "${filePath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(stderr);
                return res.status(500).json({ error: "Stem separation failed!" });
            }
            
            const stemNames = ["vocals", "drums", "bass", "other"];
            const stems = stemNames.map(stem => {
                const stemPath = path.join(outputDir, "htdemucs", path.basename(filePath, path.extname(filePath)), `${stem}.wav`);
                return fs.existsSync(stemPath) ? { name: stem, path: stemPath } : null;
            }).filter(Boolean);
            
            res.json({ success: true, stems });
        });
    });
};

export const adjustStemVolumes = (req, res) => {
    let body = "";
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => {
        try {
            const { levels, stems } = JSON.parse(body);
            if (!levels || !stems) return res.status(400).json({ error: "Invalid data!" });
            
            const tempDir = path.join(TEMP_DIR, `merge-${Date.now()}`);
            fs.mkdirSync(tempDir, { recursive: true });
            
            const stemFiles = stems.map((stem, index) => {
                const filePath = path.join(tempDir, `${stem.name}.wav`);
                fs.copyFileSync(stem.path, filePath);
                return { path: filePath, volume: levels[index] };
            });
            
            const inputs = stemFiles.map(stem => `-i "${stem.path}"`).join(" ");
            const filters = stemFiles.map((stem, i) => `[${i}:0]volume=${stem.volume}[a${i}]`).join(";");
            const outputPath = path.join(tempDir, "merged.wav");
            
            const command = `ffmpeg ${inputs} -filter_complex "${filters};${stemFiles.map((_, i) => `[a${i}]`).join("")}amix=inputs=${stemFiles.length}:normalize=0[out]" -map "[out]" "${outputPath}"`;
            
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(stderr);
                    return res.status(500).json({ error: "Mixing failed!" });
                }
                res.json({ success: true, mergedFile: outputPath });
            });
        } catch (error) {
            res.status(400).json({ error: "Invalid JSON data" });
        }
    });
};

