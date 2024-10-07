import numpy as np
from flask import Flask, jsonify, request
from sklearn.neighbors import NearestNeighbors

app = Flask(__name__)

# Sample data (to be replaced with actual data)
user_data = [
    {"id": 1, "features": [1, 2, 1, 51.5074, -0.1278]},
    {"id": 2, "features": [2, 3, 1, 48.8566, 2.3522]},  # fake data TODO: replace
]

# Extract feature matrix
feature_matrix = np.array([user["features"] for user in user_data])
user_ids = [user["id"] for user in user_data]


@app.route("/match", methods=["POST"])
def match():
    try:
        # Parse incomming data
        req_data = request.get_json()
        new_user_features = np.array(req_data["features"]).reshape(1, -1)

        # Fit KNN on existing data
        knn = NearestNeighbors(n_neighbors=3, metric="euclidean")
        knn.fit(feature_matrix)

        # Find the nearest neighbors
        distances, indices = knn.kneighbors(new_user_features)

        # Prepare response
        matches = [
            {"user_id": user_ids[idx], "distance": dist}
            for dist, idx in zip(distances[0], indices[0])
        ]
        return jsonify({"matches": matches})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001)
