// components/QueueDialog.tsx
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
  } from "@dnd-kit/core";
  import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
  } from "@dnd-kit/sortable";
  import { CSS } from "@dnd-kit/utilities";
  import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { usePlayerStore } from "@/stores/usePlayerStore";
  import { ListMusic } from "lucide-react";
  import { useEffect, useState } from "react";
  import { cn } from "@/lib/utils";
  
  // ==========================
  // SortableCard Component
  // ==========================
  function SortableCard({ song, index }: { song: any; index: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: song._id });

   
      
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    const { setCurrentSong, currentSong } = usePlayerStore();
  
    const isNext =
      currentSong?._id === song._id &&
      index < usePlayerStore.getState().queue.length - 1;
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "p-3 rounded-md border bg-card mb-2 flex items-center gap-4 cursor-pointer",
          isDragging && "opacity-50"
        )}
        onClick={() => {
  setCurrentSong(song);
  usePlayerStore.setState({ isPlaying: true }); // start playback
}}

        {...attributes}
        {...listeners}
      >
        <img
          src={song.imageUrl}
          alt={song.title}
          className="w-12 h-12 object-cover rounded-md"
        />
        <div>
          <p className="font-medium">{song.title}</p>
          <p className="text-sm text-muted-foreground">{song.artist}</p>
          {isNext && <span className="text-xs text-primary">Next Up</span>}
        </div>
      </div>
    );
  }
  
  // ==========================
  // QueueDialog Component
  // ==========================
  export function QueueDialog() {
    const { queue, currentSong, setCurrentSong } = usePlayerStore();
    const [open, setOpen] = useState(false);
    const [songs, setSongs] = useState(queue);
  
    // ⛏️ Keep queue in sync when dialog opens
    useEffect(() => {
      if (open) setSongs(queue);
    }, [open, queue]);
  
    const sensors = useSensors(useSensor(PointerSensor));
  
    const onDragEnd = (event: any) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
  
      const oldIndex = songs.findIndex((song) => song._id === active.id);
      const newIndex = songs.findIndex((song) => song._id === over.id);
      const newSongs = arrayMove(songs, oldIndex, newIndex);
  
      setSongs(newSongs);
      usePlayerStore.setState({
        queue: newSongs,
        currentIndex: newSongs.findIndex((s) => s._id === currentSong?._id),
      });
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="hover:opacity-80 p-2">
            <ListMusic className="w-5 h-5" />
          </button>
        </DialogTrigger>
  
        <DialogContent className="max-w-md bg-background">
          <h2 className="text-lg font-semibold mb-4">Up Next</h2>
  
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={songs.map((s) => s._id)}
              strategy={verticalListSortingStrategy}
            >
              {songs.map((song, index) => (
                <SortableCard key={song._id} song={song} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        </DialogContent>
      </Dialog>
    );
  }
  