import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Music, Drum, Mic, Volume2, Download } from "lucide-react";
import { Song } from "@/types";

interface Stems {
  vocals: string;
  drums: string;
  bass: string;
  other: string;
}

interface Levels {
  vocals: number;
  drums: number;
  bass: number;
  other: number;
}

const StemSeparationDialog = () => {
  const currentSong = usePlayerStore((state) => state.currentSong) as Song | null;
  const [stems, setStems] = useState<Stems>({ vocals: "", drums: "", bass: "", other: "" });
  const [levels, setLevels] = useState<Levels>({ vocals: 100, drums: 100, bass: 100, other: 100 });

  useEffect(() => {
    if (!currentSong?.audioUrl) return; // Ensure filePath exists before processing
    const fetchStems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/stem-separation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filePath: currentSong.audioUrl,
            levels,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setStems({
            vocals: `http://localhost:5000${data.stems.vocals}`,
            drums: `http://localhost:5000${data.stems.drums}`,
            bass: `http://localhost:5000${data.stems.bass}`,
            other: `http://localhost:5000${data.stems.other}`,
          });
        }
      } catch (error) {
        console.error("Error fetching stems:", error);
      }
    };

    fetchStems();
  }, [levels, currentSong]);

  const handleChange = (stem: keyof Levels) => (value: number[]) => {
    setLevels((prev) => ({ ...prev, [stem]: value[0] }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="hover:text-white text-zinc-400">
          <Mic className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stem Separation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.keys(levels).map((stem) => (
            <div key={stem} className="flex items-center gap-4">
              {stem === "vocals" && <Mic className="w-6 h-6" />}
              {stem === "drums" && <Drum className="w-6 h-6" />}
              {stem === "bass" && <Volume2 className="w-6 h-6" />}
              {stem === "other" && <Music className="w-6 h-6" />}
              <Slider value={[levels[stem as keyof Levels]]} onValueChange={handleChange(stem as keyof Levels)} max={100} />
              <span>{levels[stem as keyof Levels]}%</span>
            </div>
          ))}
        </div>
        {Object.keys(stems).map((stem) =>
          stems[stem as keyof Stems] ? (
            <div key={stem} className="flex items-center justify-between p-2 bg-zinc-800 rounded-md">
              <audio controls src={stems[stem as keyof Stems]}></audio>
              <a href={stems[stem as keyof Stems]} download className="text-white">
                <Download className="w-6 h-6" />
              </a>
            </div>
          ) : null
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StemSeparationDialog;
