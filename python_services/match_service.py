import os

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from knn_utils import calculate_preference_similarity, get_user_features, haversine
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()
mongo_uri = os.getenv("MONGO_DB_URI")

# Establish MongoDB connection
client = MongoClient(mongo_uri)
db = client["SyncMove"]

# Initialize Flask application
app = Flask(__name__)


@app.route("/match", methods=["POST"])
def match():
    """
    Endpoint to find the best matches for a user based on location and preferences.

    Expected JSON request format:
    {
        "location": [latitude, longitude],
        "preferences": [activityType, fitnessGoals, experienceLevel]
    }

    Returns:
    - JSON response with top 3 matching user IDs and their respective scores.
    """
    try:
        # Retrieve user data from MongoDB
        feature_matrix, user_ids = get_user_features(db)

        # Parse the request data
        req_data = request.get_json()
        user_lat, user_lon = req_data["location"]
        user_preferences = req_data["preferences"]

        combined_scores = []
        for user_features, user_id in zip(feature_matrix, user_ids):
            user_feature_lat, user_feature_lon = user_features[-2], user_features[-1]
            other_user_preferences = user_features[:-2]

            # Calculate geographic and preference similarities
            geo_distance = haversine(
                user_lat, user_lon, user_feature_lat, user_feature_lon
            )
            preference_similarity = calculate_preference_similarity(
                user_preferences, other_user_preferences
            )

            # Combine scores with respective weights
            geo_weight = 0.6
            pref_weight = 0.4
            combined_score = (geo_weight * geo_distance) - (
                pref_weight * preference_similarity
            )

            # Add to list of combined scores
            combined_scores.append((combined_score, user_id))

        # Select and format the top 3 matches
        combined_scores.sort()
        matches = [
            {"user_id": user_id, "score": score}
            for score, user_id in combined_scores[:3]
        ]

        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the Flask app on port 5001
if __name__ == "__main__":
    app.run(port=5001)
