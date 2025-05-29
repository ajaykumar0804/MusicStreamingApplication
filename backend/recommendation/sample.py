from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import surprise
from surprise import Dataset, Reader, SVD
from Recommenders import popularity_recommender_py, item_similarity_recommender_py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests

app = Flask(__name__)

# Load Data
song_df_1 = pd.read_csv('./triplets_file/triplets_file.csv')
song_df_2 = pd.read_csv('./song_data/song_data.csv')
song_df = pd.merge(song_df_1, song_df_2.drop_duplicates(['song_id']), on='song_id', how='left')
song_df['song'] = song_df['title'] + ' - ' + song_df['artist_name']
song_df = song_df.head(10000)

# Popularity-Based Recommender
pr = popularity_recommender_py()
pr.create(song_df, 'user_id', 'song')

# Item Similarity Recommender
ir = item_similarity_recommender_py()
ir.create(song_df, 'user_id', 'song')

# Collaborative Filtering Model
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(song_df[['user_id', 'song', 'listen_count']], reader)
trainset = data.build_full_trainset()
svd = SVD()
svd.fit(trainset)

# Content-Based Filtering Model
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(song_df['title'] + " " + song_df['artist_name'])
similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

def get_youtube_metadata(song_name):
    url = f"https://youtube-search-and-download.p.rapidapi.com/search?query={song_name}"
    headers = {"X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY", "X-RapidAPI-Host": "youtube-search-and-download.p.rapidapi.com"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if 'contents' in data and data['contents']:
            video = data['contents'][0]['video']
            return {
                "title": video['title'],
                "artist": song_name.split(' - ')[1],
                "imageUrl": video['thumbnails'][0]['url'],
                "audioUrl": f"https://www.youtube.com/watch?v={video['videoId']}"
            }
    return {}

@app.route('/recommend/popular', methods=['GET'])
def recommend_popular():
    user_id = request.args.get('user_id', None)
    recommendations = pr.recommend(user_id).to_dict(orient='records')
    return jsonify(recommendations)

@app.route('/recommend/personalized', methods=['GET'])
def recommend_personalized():
    user_id = request.args.get('user_id', None)
    recommendations = ir.recommend(user_id).to_dict(orient='records')
    return jsonify(recommendations)

@app.route('/recommend/collaborative', methods=['GET'])
def recommend_collaborative():
    user_id = request.args.get('user_id', None)
    user_songs = song_df[song_df['user_id'] == user_id]['song'].unique()
    predictions = [(song, svd.predict(user_id, song).est) for song in song_df['song'].unique() if song not in user_songs]
    recommendations = sorted(predictions, key=lambda x: x[1], reverse=True)[:10]
    return jsonify([{"song": rec[0], "score": rec[1]} for rec in recommendations])

@app.route('/recommend/content', methods=['GET'])
def recommend_content():
    song_name = request.args.get('song', None)
    if song_name not in song_df['song'].values:
        return jsonify([])
    song_idx = song_df[song_df['song'] == song_name].index[0]
    similar_songs = list(enumerate(similarity_matrix[song_idx]))
    similar_songs = sorted(similar_songs, key=lambda x: x[1], reverse=True)[1:11]
    recommended_songs = [{"song": song_df.iloc[i[0]]['song'], "score": i[1]} for i in similar_songs]
    return jsonify(recommended_songs)

@app.route('/recommend/youtube', methods=['GET'])
def recommend_youtube():
    song_name = request.args.get('song', None)
    metadata = get_youtube_metadata(song_name)
    return jsonify(metadata)

if __name__ == '__main__':
    app.run(port=5001, debug=True)