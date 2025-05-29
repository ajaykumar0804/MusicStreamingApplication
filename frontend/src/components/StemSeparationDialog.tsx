import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider,
    Button,
    CircularProgress,
} from "@mui/material";
import { Upload } from "lucide-react";

const StemSeparationDialog = ({ onClose }: { onClose: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [stems, setStems] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [stemVolumes, setStemVolumes] = useState<{ [key: string]: number }>({});
    const [mixing, setMixing] = useState(false);
    const [mergedAvailable, setMergedAvailable] = useState(false);
    const [mixedFileReady, setMixedFileReady] = useState(false);  // ✅ Track if mix is ready

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("audio", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/api/stem/separate", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.job_id) {
                setJobId(data.job_id);
                checkStatus(data.job_id);
            } else {
                console.error("Job ID not received:", data);
                setLoading(false);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setLoading(false);
        }
    };

    const checkStatus = async (jobId: string) => {
        console.log("Checking status for Job ID:", jobId); // ✅ Debugging log

        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/stem/status/${jobId}`);

            if (!response.ok) {
                console.error(`Error ${response.status}: ${response.statusText}`);
                return;
            }

            const data = await response.json();

            if (data.status === "completed") {
                setStems(data.stems);
            } else if (data.status === "failed") {
                console.error("Stem separation failed:", data.error);
            } else {
                setTimeout(() => checkStatus(jobId), 3000);
            }
        } catch (error) {
            console.error("Error checking status:", error);
        }
    };


    const handleDownload = async (stem: string) => {
        if (!jobId || !stems[stem]) {
            console.error(`Missing job ID or stem path for: ${stem}`);
            return;
        }

        const response = await fetch(`http://127.0.0.1:5000/api/stem/download/${jobId}/${stem}`);

        if (!response.ok) {
            console.error("Download failed:", response.statusText);
            return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${stem}.wav`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleVolumeChange = (stem: string, value: number) => {
        setStemVolumes((prev) => ({ ...prev, [stem]: value }));
    };

    const handleConfirmMix = async () => {
        if (!jobId) {
            console.error("🚨 No job ID found!");
            return;
        }
    
        console.log("🛠 Sending Job ID to Backend:", jobId);
    
        setLoading(true);
    
        // ✅ Fix: Normalize levels to range (0.0 to 1.0)
        const normalizedLevels = Object.fromEntries(
            Object.entries(stemVolumes).map(([stem, value]) => [stem, value / 100])
        );
    
        console.log("🎛️ Sending Normalized Levels to Backend:", normalizedLevels);
    
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/stem/merge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ job_id: jobId, levels: normalizedLevels }), // ✅ Fix: Using correct "job_id"
            });
    
            const data = await response.json();
            setLoading(false);
    
            if (response.ok && data.success) {
                setMixedFileReady(true);
                console.log("✅ Mixing successful!");
            } else {
                console.error("🚨 Mixing failed:", data.error);
            }
        } catch (error) {
            console.error("❌ Error during mixing request:", error);
            setLoading(false);
        }
    };

    const handleDownloadMerged = async () => {
        if (!jobId) return;
    
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/stem/download/${jobId}`);
    
            if (!response.ok) {
                console.error("Download failed:", response.statusText);
                return;
            }
    
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `merged_song.wav`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("❌ Error downloading file:", error);
        }
    };
    



    return (
        <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle className="text-xl font-bold text-gray-800">Stem Separation</DialogTitle>
            <DialogContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                    <label className="w-full text-center">
                        <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<Upload size={20} />}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {file ? file.name : "Upload Audio File"}
                        </Button>
                    </label>

                    <Button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                        {loading ? <CircularProgress size={20} /> : "Separate"}
                    </Button>
                </div>

                {Object.keys(stems).length > 0 && (
                    <div className="mt-6 space-y-4">
                        {Object.entries(stems).map(([stem, path]) => (
                            <div key={stem} className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700 capitalize">{stem}</span>
                                <Button onClick={() => handleDownload(stem)} className="text-blue-500">
                                    Download
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {Object.keys(stems).length > 0 && (
                    <div className="mt-6 space-y-4">
                        {Object.entries(stems).map(([stem, path]) => (
                            <div key={stem} className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 capitalize">{stem}</span>
                                <Slider
                                    value={stemVolumes[stem] ?? 100}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onChange={(_, value) => handleVolumeChange(stem, value as number)}
                                />
                            </div>
                        ))}
                        <Button
                            onClick={handleConfirmMix}
                            className="text-white bg-green-500 hover:bg-green-600"
                            disabled={mixing}
                        >
                            {mixing ? <CircularProgress size={20} /> : "Confirm Mix"}
                        </Button>
                    </div>
                )}

                {/* {jobId && (
                    <div className="mt-4">
                        <Button
                            onClick={() => window.open(`http://127.0.0.1:5000/api/stem/download/${jobId}`, "_blank")}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Download Merged File
                        </Button>
                    </div>
                )} */}
                {mixedFileReady && (
                    <Button
                        onClick={handleDownloadMerged}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4"
                    >
                        Download Mixed Song
                    </Button>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StemSeparationDialog;
