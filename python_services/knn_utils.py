import numpy as np


def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on Earth's surface, using the Haversine formula.

    Parameters:
    - lat1, lon1: Latitude and Longitude of the first point in decimal degrees.
    - lat2, lon2: Latitude and Longitude of the second point in decimal degrees.

    Returns:
    - Distance between the two points in kilometers.
    """
    R = 6371.0  # Earth’s radius in kilometers
    # Convert coordinates from degrees to radians
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)

    # Haversine formula
    a = (np.sin(dphi / 2) ** 2) + np.cos(phi1) * np.cos(phi2) * (
        np.sin(dlambda / 2) ** 2
    )
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c  # Return distance in kilometers


def get_user_features(db, include_ai=False):
    """
    Fetch user feature data from MongoDB for KNN processing, with an option to include AI users.

    Parameters:
    - db: MongoDB database connection object.
    - include_ai: Boolean flag to include AI users in the query results.

    Returns:
    - feature_matrix: NumPy array of user feature vectors for matching.
    - user_ids: List of user IDs corresponding to each feature vector.
    """
    users_collection = db["users"]

    # Define the query to filter out AI users if needed
    query = {} if include_ai else {"isAIUser": False}
    print("Query to MongoDB:", query)

    # Fetch user data
    user_data = list(
        users_collection.find(
            query,
            {
                "_id": 1,
                "features": 1,
                "location.coordinates": 1,
                "activityType": 1,
                "fitnessGoals": 1,
            },
        )
    )
    print("Fetched user data (full):", user_data)

    # Map categorical fields to numerical values
    activity_map = {"running": 1, "cycling": 2, "weightlifting": 3, "other": 4}
    goals_map = {
        "weight loss": 1,
        "endurance": 2,
        "muscle gain": 3,
        "general fitness": 4,
    }

    # Prepare feature matrix using activity type, fitness goals, experience level, and coordinates
    feature_matrix = []
    for user in user_data:
        activity_type = activity_map.get(user["activityType"], 0)
        fitness_goal = goals_map.get(user["fitnessGoals"], 0)
        experience_level = user.get("experienceLevel", 0)
        coordinates = user["location"]["coordinates"]

        print(f"User Activity Type: {user['activityType']}, Mapped: {activity_type}")
        print(f"User Fitness Goal: {user['fitnessGoals']}, Mapped: {fitness_goal}")

        # Construct the feature vector for each user
        feature_vector = [activity_type, fitness_goal, experience_level] + coordinates
        feature_matrix.append(feature_vector)

    # Convert to a NumPy array for compatibility
    feature_matrix = np.array(feature_matrix)
    print("Feature matrix shape:", feature_matrix.shape)
    print("Feature matrix:", feature_matrix)
    user_ids = [str(user["_id"]) for user in user_data]
    print("User IDs:", user_ids)

    return feature_matrix, user_ids


def calculate_preference_similarity(user_preferences, other_preferences, weights=None):
    """
    Calculate similarity between two users' preferences, using weighted scoring.

    Parameters:
    - user_preferences: List of the user's preferences for activity type, fitness goals, and experience level.
    - other_preferences: List of another user's preferences for matching.
    - weights: Optional dictionary with weights for each preference type.

    Returns:
    - Normalized similarity score (0 to 1) representing preference similarity.
    """
    print(f"User Preferences in calculate_preference_similarity: {user_preferences}")
    print(
        f"Other User Preferences in calculate_preference_similarity: {other_preferences}"
    )

    if weights is None:
        weights = {"activityType": 0.4, "fitnessGoals": 0.3, "experienceLevel": 0.3}

    user_activity, user_goal, user_experience = user_preferences
    other_activity, other_goal, other_experience = other_preferences

    score = 0
    total_weight = sum(weights.values())

    # Compare preferences and calculate score based on weighted criteria
    if user_activity == other_activity:
        score += weights["activityType"]

    if user_goal == other_goal:
        score += weights["fitnessGoals"]

    experience_diff = abs(user_experience - other_experience)
    if experience_diff == 0:
        score += weights["experienceLevel"]
    elif experience_diff == 1:
        score += weights["experienceLevel"] * 0.5

    return score / total_weight  # Normalized score between 0 and 1
