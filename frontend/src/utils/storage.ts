const RECENTLY_PLAYED_KEY = "recentlyPlayedSongs";

interface Song {
    id: string;
    snippet: {
        title?: string;
        thumbnails?: {
            medium?: { url?: string };
        };
    };
}

export const getRecentlyPlayed = (): Song[] => {
    const storedSongs = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return storedSongs ? JSON.parse(storedSongs) : [];
};

export const storeRecentlyPlayed = (song: Song) => {
    let songs = getRecentlyPlayed();

    // Ensure unique songs and limit to 10
    songs = [song, ...songs.filter((s) => s.id !== song.id)].slice(0, 10);

    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(songs));
};
