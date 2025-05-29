export const fetchDefaultSongs = async () => {
    const response = await fetch("/api/youtube/default");
    return response.json();
};

export const fetchRecommendedSongs = async (query: string) => {
    const response = await fetch(`/api/youtube/recommend?query=${query}`);
    return response.json();
};
