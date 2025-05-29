import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;currentAudio: string | null;
	isShuffle: boolean, // ✅ NEW
	repeatMode: "none" | "one" | "all" | "count";
	repeatCount: number,
    

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	setAudio: (audio: string) => void;
	toggleShuffle: () => void; // ✅ Add this
	setRepeatMode: (mode: "none" | "one" | "all" | "count", count?: number) => void; // ✅ Add this
	
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentAudio: null,
    setAudio: (audio) => set({ currentAudio: audio }),
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	isShuffle: false, // ✅ NEW
	repeatMode: "none", // "none" | "one" | "all" | "count"
	repeatCount: 0,
	

	

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity: `Playing ${song.title} by ${song.artist}`,
			});
		}

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	
	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;

		const currentSong = get().currentSong;
		const socket = useChatStore.getState().socket;
		if (socket.auth) {
			socket.emit("update_activity", {
				userId: socket.auth.userId,
				activity:
					willStartPlaying && currentSong ? `Playing ${currentSong.title} by ${currentSong.artist}` : "Idle",
			});
		}

		set({
			isPlaying: willStartPlaying,
		});
	},

	toggleShuffle: () => {
		set((state) => ({
			isShuffle: !state.isShuffle,
		}));
	},
	
	setRepeatMode: (mode, count = 0) => {
		set({
			repeatMode: mode,
			repeatCount: count,
		});
	},
	
	toggleRepeatMode: () => {
		const { repeatMode } = get();
		if (repeatMode === "none") {
			get().setRepeatMode("one");
		} else if (repeatMode === "one") {
			get().setRepeatMode("count", 2); // Repeat song twice
		} else if (repeatMode === "count") {
			get().setRepeatMode("all");
		} else {
			get().setRepeatMode("none");
		}
	},
	

	playNext: () => {
		const {
			isShuffle,
			queue,
			currentIndex,
			repeatMode,
			repeatCount,
			currentSong,
			setCurrentSong,
		} = get();
	
		if (!queue.length || !currentSong) return;
	
		const forceReplayCurrent = () => {
			set({ isPlaying: false });
			setTimeout(() => {
				set({
					currentSong,
					isPlaying: true,
				});
			}, 0);
		};
	
		// 🔁 Repeat same song infinitely
		if (repeatMode === "one") {
			forceReplayCurrent();
			return;
		}
	
		// 🔁 Repeat N times
		if (repeatMode === "count") {
			if (repeatCount > 1) {
				set({
					repeatCount: repeatCount - 1,
				});
				forceReplayCurrent();
				return;
			} else {
				// Count done, move to next and reset repeat
				set({
					repeatMode: "none",
					repeatCount: 0,
				});
				// Continue to next song (below)
			}
		}
	
		// 🔀 Shuffle
		if (isShuffle) {
			const remaining = queue.filter((_, index) => index !== currentIndex);
			if (remaining.length > 0) {
				const randomIndex = Math.floor(Math.random() * remaining.length);
				const nextSong = remaining[randomIndex];
				setCurrentSong(nextSong);
				return;
			}
		}
	
		// ▶️ Next song in queue
		const nextIndex = currentIndex + 1;
		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];
			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else {
			// 🔁 Repeat all (loop back to start)
			if (repeatMode === "all") {
				const firstSong = queue[0];
				set({
					currentSong: firstSong,
					currentIndex: 0,
					isPlaying: true,
				});
			} else {
				// 🛑 End of queue
				set({ isPlaying: false });
			}
		}
	},	
	
	
	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
				});
			}

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			// no prev song
			set({ isPlaying: false });

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Idle`,
				});
			}
		}
	},
}));
