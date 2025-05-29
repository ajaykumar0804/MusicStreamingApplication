import axios from "axios";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// Fetch trending music videos (Default songs)
const getDefaultSongs = async () => {
    try {
        const response = await get(`${BASE_URL}/videos`, {
            params: {
                key: YOUTUBE_API_KEY,
                part: "snippet",
                chart: "mostPopular",
                videoCategoryId: "10", // Category 10 = Music
                maxResults: 10,
            },
        });
        return response.data.items;
    } catch (error) {
        console.error("Error fetching default songs:", error);
        return [];
    }
};

// Fetch recommended songs based on search
const getRecommendedSongs = async (query) => {
    try {
        const response = await get(`${BASE_URL}/search`, {
            params: {
                key: YOUTUBE_API_KEY,
                part: "snippet",
                q: query,
                type: "video",
                videoCategoryId: "10",
                maxResults: 10,
            },
        });
        return response.data.items;
    } catch (error) {
        console.error("Error fetching recommended songs:", error);
        return [];
    }
};

export default { getDefaultSongs, getRecommendedSongs };
