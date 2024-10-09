import os
import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from knn_utils import haversine, get_user_features, calculate_preference_similarity
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()
mongo_uri = os.getenv("MONGO_DB_URI")

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["SyncMove"]

# Initialize Flask application
app = Flask(__name__)


@app.route("/match", methods=["POST"])
def match():
    """
    Endpoint to find the best matches for a user based on location, preferences, and AI matching option.

    Expected JSON request format:
    {
        "location": [latitude, longitude],
        "preferences": [activityType, fitnessGoals, experienceLevel],
        "includeAI": Boolean (optional, defaults to False)
    }

    Returns:
    - JSON response with top 3 matching user IDs and their respective scores.
    """
    try:
        # Parse the request data
        req_data = request.get_json()
        lat, lon = req_data["location"]
        preferences = req_data["preferences"]
        include_ai = req_data.get("includeAI", False)  # Default to excluding AI users

        # Fetch user data from MongoDB, with AI inclusion option
        feature_matrix, user_ids = get_user_features(db, include_ai)

        combined_scores = []
        for user_features, user_id in zip(feature_matrix, user_ids):
            user_lat, user_lon = user_features[-2], user_features[-1]
            other_preferences = user_features[:-2]

            # Calculate Haversine distance
            geo_distance = haversine(lat, lon, user_lat, user_lon)

            # Calculate preference similarity
            preference_similarity = calculate_preference_similarity(
                preferences, other_preferences
            )

            # Weighted score
            geo_weight = 0.6
            pref_weight = 0.4
            combined_score = (geo_weight * geo_distance) - (
                pref_weight * preference_similarity
            )

            combined_scores.append((combined_score, user_id))

        # Sort and select top 3 matches
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
