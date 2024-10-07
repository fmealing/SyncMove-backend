import numpy as np


def haversine(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers
    R = 6371.0

    # Convert degrees to radians
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)

    # Haversine formula
    a = (
        np.sin(dphi / 2.0) ** 2
        + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0) ** 2
    )
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    return R * c


def get_user_features(db):
    # Fetch user data from MongoDB
    users_collection = db["users"]
    user_data = list(users_collection.find({}, {"_id": 1, "features": 1}))

    # Prepare the feature matrix and user IDs
    feature_matrix = np.array([user["features"] for user in user_data])
    user_ids = [str(user["_id"]) for user in user_data]

    return feature_matrix, user_ids
