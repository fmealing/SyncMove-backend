import os

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from knn_utils import calculate_preference_similarity, get_user_features, haversine
from pymongo import MongoClient

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
print("Flask application initialized")


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

        combined_scores = []
        for user_features, user_id in zip(feature_matrix, user_ids):
            user_lat, user_lon = user_features[-2], user_features[-1]
            other_preferences = user_features[:-2]

            geo_distance = haversine(lat, lon, user_lat, user_lon)
            preference_similarity = calculate_preference_similarity(
                user_preferences_numeric, other_preferences
            )

            geo_weight = 0.6
            pref_weight = 0.4
            combined_score = (geo_weight * geo_distance) - (
                pref_weight * preference_similarity
            )

            print(
                f"User ID: {user_id}, Geo Distance: {geo_distance}, Preference Similarity: {preference_similarity}, Combined Score: {combined_score}"
            )

            combined_scores.append((combined_score, user_id))

        combined_scores.sort()
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
