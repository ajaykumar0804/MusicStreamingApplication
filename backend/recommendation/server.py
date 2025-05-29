from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from Recommenders import popularity_recommender_py, item_similarity_recommender_py

app = Flask(__name__)

# Load Data
song_df_1 = pd.read_csv('./triplets_file.csv')
song_df_2 = pd.read_csv('./song_data.csv')
song_df = pd.merge(song_df_1, song_df_2.drop_duplicates(['song_id']), on='song_id', how='left')
song_df['song'] = song_df['title'] + ' - ' + song_df['artist_name']
song_df = song_df.head(10000)

# Initialize recommenders
pr = popularity_recommender_py()
pr.create(song_df, 'user_id', 'song')

ir = item_similarity_recommender_py()
ir.create(song_df, 'user_id', 'song')

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

if __name__ == '__main__':
    app.run(port=5001, debug=True)
