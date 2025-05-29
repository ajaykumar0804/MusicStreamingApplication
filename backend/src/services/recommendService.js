import axios from "axios";

const BASE_URL = "http://127.0.0.1:5001/recommend"; // Python server

export const getPopularSongs = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/popular`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching popular songs");
    }
};

export const getPersonalizedRecommendations = async (userId) => {
    try {
        const response = await axios.get(`${BASE_URL}/personalized?user_id=${userId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching personalized recommendations");
    }
};
