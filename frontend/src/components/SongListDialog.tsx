import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { ListMusic } from "lucide-react";
  import { useEffect, useState } from "react";
  import { usePlayerStore } from "@/stores/usePlayerStore";
  import { useAuth } from "@clerk/clerk-react";
  
  export function SongListDialog() {
    const [open, setOpen] = useState(false);
    const [songs, setSongs] = useState<any[]>([]);
    const { setCurrentSong } = usePlayerStore();
    const { getToken } = useAuth();
  
    useEffect(() => {
        const fetchSongs = async () => {
          try {
            const token = await getToken();
      
            if (!token) {
              console.error("No token found — user might not be logged in.");
              return;
            }
      
            const res = await fetch("http://localhost:5000/api/songs", {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
      
            if (!res.ok) {
              const errMsg = await res.text();
              throw new Error(`Error ${res.status}: ${errMsg}`);
            }
      
            const data = await res.json();
            setSongs(data);
          } catch (error) {
            console.error("Failed to fetch songs:", error);
          }
        };
      
        fetchSongs();
      }, [getToken]);
      
  
    const handleSongClick = (song: any) => {
      setCurrentSong(song);
      usePlayerStore.setState({ isPlaying: true });
      setOpen(false);
    };
  
    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="hover:opacity-80 p-2 fixed bottom-8 right-57 z-50 cursor-pointer text-center">
            <ListMusic className="w-7 h-7" />
          </button>
        </DialogTrigger>
  
        <DialogContent
          className="w-80 bg-background border shadow-lg rounded-md p-4 absolute z-50"
          style={{ position: "absolute", right: "1.5rem", bottom: "4rem" }}
        >
          <DialogTitle className="text-lg font-bold mb-2">My Songs</DialogTitle>
          {/* <h2 className="text-md font-semibold mb-4">All Songs</h2> */}
  
          <div
            className="space-y-2 max-h-[300px] pr-1 overflow-y-auto custom-scrollbar"
            >
            {songs.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">
                No songs found.
              </p>
            ) : (
              songs.map((song) => (
                <div
                  key={song._id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => handleSongClick(song)}
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {song.artist}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  