export const fetchDefaultSongs = async (req, res) => {
    try {
        // Your logic to fetch default songs
        res.json({ message: "Default songs fetched successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch default songs" });
    }
};

export const fetchRecommendedSongs = async (req, res) => {
    try {
        // Your logic to fetch recommended songs
        res.json({ message: "Recommended songs fetched successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recommended songs" });
    }
};
