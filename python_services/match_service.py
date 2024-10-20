import os

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from knn_utils import calculate_preference_similarity, get_user_features, haversine
from pymongo import MongoClient
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()
mongo_uri = os.getenv("MONGO_DB_URI")
print("MongoDB URI:", mongo_uri)

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["test"]
print("Connected to MongoDB")

try:
    client.admin.command("ping")
    print("MongoDB connection is active")
except Exception as e:
    print("MongoDB connection error:", e)


# Initialize Flask application
app = Flask(__name__)
CORS(app)
print("Flask application initialized")


# Modify the match function inside the Flask app
@app.route("/match", methods=["POST"])
def match():
    print("Received match request")
    try:
        req_data = request.get_json()
        lat, lon = req_data["location"]
        print(f"Location: {lat}, {lon}")

        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return (
                jsonify(
                    {
                        "error": "Latitude must be between -90 and 90 and Longitude must be between -180 and 180"
                    }
                ),
                400,
            )

        preferences = req_data["preferences"]
        activity_map = {"running": 1, "cycling": 2, "weightlifting": 3, "other": 4}
        goals_map = {
            "weight loss": 1,
            "endurance": 2,
            "muscle gain": 3,
            "general fitness": 4,
        }

        user_preferences_numeric = [
            activity_map.get(preferences[0], 0),
            goals_map.get(preferences[1], 0),
            preferences[2],  # Experience level is already numeric
        ]

        include_ai = req_data.get("includeAI", False)

        feature_matrix, user_ids = get_user_features(db, include_ai)

        # Define the maximum distance for normalization
        MAX_DISTANCE = 100  # e.g., 100 km, adjust based on your use case

        combined_scores = []
        for user_features, user_id in zip(feature_matrix, user_ids):
            user_lat, user_lon = user_features[-2], user_features[-1]
            other_preferences = user_features[:-2]

            # Normalize the geographical distance
            geo_distance = haversine(lat, lon, user_lat, user_lon) / MAX_DISTANCE
            geo_distance = min(geo_distance, 1)  # Ensure the max is 1

            # Get preference similarity (already normalized to 0 to 1)
            preference_similarity = calculate_preference_similarity(
                user_preferences_numeric, other_preferences
            )

            # Weights should sum to 1 for a percentage-based score
            geo_weight = 0.6
            pref_weight = 0.4

            # Combined score now normalized between 0 and 1
            combined_score = (geo_weight * (1 - geo_distance)) + (
                pref_weight * preference_similarity
            )

            print(
                f"User ID: {user_id}, Geo Distance (normalized): {geo_distance}, Preference Similarity: {preference_similarity}, Combined Score: {combined_score}"
            )

            combined_scores.append((combined_score, user_id))

        combined_scores.sort(reverse=True)
        matches = [
            {"user_id": user_id, "score": score}
            for score, user_id in combined_scores[:3]
        ]
        print("Matches:", matches)

        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the Flask app on port 5001
if __name__ == "__main__":
    app.run(port=5001, debug=True)
