# TODO: Make this better
# Some issues I have
# 1. The algorithm is not very good. Only depends on activity, goal, experience and location
#  - a lot of the values look really close together
# 2. The value needs to be expressed as a percentage (of closely the users match)
# 3. I need to find a good way to test this other than unit tests
# The user contains the following fields than can be used to match
# - Date of birth
# - Availability (time of day - either morning, afternoon, evening)

import os

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from knn_utils import calculate_preference_similarity, get_user_features, haversine
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()
mongo_uri = os.getenv("MONGO_DB_URI")

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["test"]

try:
    client.admin.command("ping")
    print("MongoDB connection is active")
except Exception as e:
    print("MongoDB connection error:", e)


# Initialize Flask application
app = Flask(__name__)
CORS(app)


# Flask route to handle match requests
@app.route("/match", methods=["POST"])
def match():
    try:
        # Extract request data
        req_data = request.get_json()

        # Extract location and preferences from request data
        lat, lon = req_data["location"]
        preferences = req_data["preferences"]

        # Check that preferences array contains exactly 4 elements
        if len(preferences) != 4:
            return (
                jsonify(
                    {
                        "error": "Preferences array must contain 4 elements (activityType, fitnessGoal, experienceLevel, age)"
                    }
                ),
                400,
            )

        # Unpack the preferences array
        activity_type, fitness_goal, experience_level, age = preferences

        # Fetch user features from the database
        include_ai = req_data.get("includeAI", False)
        feature_matrix, user_ids = get_user_features(db, include_ai)

        MAX_DISTANCE = 100  # Define the maximum distance for normalization (100 km)
        combined_scores = []

        for user_features, user_id in zip(feature_matrix, user_ids):
            user_lat, user_lon = user_features[-2], user_features[-1]
            other_preferences = user_features[:-2]

            # Normalize geographical distance
            geo_distance = haversine(lat, lon, user_lat, user_lon) / MAX_DISTANCE
            geo_distance = min(geo_distance, 1)

            # Calculate preference similarity between users
            preference_similarity = calculate_preference_similarity(
                [activity_type, fitness_goal, experience_level, age], other_preferences
            )

            # Weights for combining geographical and preference similarity
            geo_weight = 0.6
            pref_weight = 0.4

            # Final combined score (normalized between 0 and 1)
            combined_score = (geo_weight * (1 - geo_distance)) + (
                pref_weight * preference_similarity
            )
            combined_percentage = round(combined_score * 100, 1)

            combined_scores.append((combined_percentage, user_id))

        # Sort matches by score in descending order and return top matches
        combined_scores.sort(reverse=True)
        matches = [
            {"user_id": user_id, "score": score}
            for score, user_id in combined_scores[:3]
        ]

        return jsonify({"matches": matches})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the Flask app on port 5001
if __name__ == "__main__":
    app.run(port=5001, debug=True)
