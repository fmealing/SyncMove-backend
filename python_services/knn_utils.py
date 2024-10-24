from datetime import datetime

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


from datetime import datetime


def get_user_features(db, include_ai=False):
    """
    Fetch user feature data from MongoDB for KNN processing, including the user's age.
    """
    users_collection = db["users"]

    # Define the query to filter out AI users if needed
    query = {} if include_ai else {"isAIUser": False}

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
                "dob": 1,  # Fetching date of birth (dob)
            },
        )
    )

    # Map categorical fields to numerical values
    activity_map = {"running": 1, "cycling": 2, "weightlifting": 3, "other": 4}
    goals_map = {
        "weight loss": 1,
        "endurance": 2,
        "muscle gain": 3,
        "general fitness": 4,
    }

    feature_matrix = []
    for user in user_data:
        activity_type = activity_map.get(user["activityType"], 0)
        fitness_goal = goals_map.get(user["fitnessGoals"], 0)
        experience_level = user.get("experienceLevel", 0)
        coordinates = user["location"]["coordinates"]

        # Calculate age from date of birth (dob)
        dob = user.get("dob")
        if dob:
            birth_date = datetime.strptime(dob, "%Y-%m-%d")
            age = (datetime.now() - birth_date).days // 365
        else:
            age = 0  # Default to 0 if dob is missing

        # Create feature vector including age
        feature_vector = [
            activity_type,
            fitness_goal,
            experience_level,
            age,
        ] + coordinates
        feature_matrix.append(feature_vector)

    # Convert to a NumPy array for compatibility
    feature_matrix = np.array(feature_matrix)
    user_ids = [str(user["_id"]) for user in user_data]

    return feature_matrix, user_ids


def calculate_preference_similarity(user_preferences, other_preferences, weights=None):
    """
    Calculate similarity between two users' preferences, using weighted scoring, including age similarity.
    """
    if weights is None:
        weights = {
            "activityType": 0.3,
            "fitnessGoals": 0.2,
            "experienceLevel": 0.2,
            "age": 0.3,  # Adding age as a weighted factor
        }

    user_activity, user_goal, user_experience, user_age = user_preferences
    other_activity, other_goal, other_experience, other_age = other_preferences

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

    # Calculate similarity based on age (difference in age)
    age_diff = abs(user_age - other_age)
    if age_diff <= 3:  # Small age difference means higher similarity
        score += weights["age"]
    elif age_diff <= 5:
        score += weights["age"] * 0.7
    elif age_diff <= 10:
        score += weights["age"] * 0.5
    # Larger age differences lower the score; no score for differences > 10 years

    return score / total_weight  # Normalized score between 0 and 1
