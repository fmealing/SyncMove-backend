import os

import numpy as np
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from knn_utils import get_user_features, haversine
from pymongo import MongoClient

# Load environment variables from .env file
load_dotenv()
mongo_uri = os.getenv("MONGO_DB_URI")

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client["SyncMove"]

# Initialize the Flask app
app = Flask(__name__)


@app.route("/match", methods=["POST"])
def match():
    try:
        # Fetch all user data from MongoDB and build the feature matrix
        feature_matrix, user_ids = get_user_features(db)

        # Parse incoming JSON data from the POST request
        req_data = request.get_json()
        lat, lon = req_data["location"]  # User's latitude and longitude
        preferences = req_data[
            "preferences"
        ]  # Other features such as activityType, etc.

        # Calculate the Haversine distance for all users
        distances = [
            haversine(lat, lon, user_lat, user_lon)
            for user_lat, user_lon, *_ in feature_matrix
        ]

        # Zip distances with user_ids for easier handling
        dist_with_ids = list(zip(distances, user_ids))

        # Sort by distance and return the top 3 closest users
        dist_with_ids.sort()
        matches = [
            {"user_id": user_id, "distance": dist}
            for dist, user_id in dist_with_ids[:3]
        ]

        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001)
