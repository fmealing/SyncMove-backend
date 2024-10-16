import unittest

import numpy as np
from knn_utils import calculate_preference_similarity, haversine


class TestKNNUtils(unittest.TestCase):
    def test_haversine(self):
        lat1, lon1 = 0, 0
        lat2, lon2 = 0, 1
        result = haversine(lat1, lon1, lat2, lon2)
        expected = 111.19  # Adjusted expected distance
        self.assertAlmostEqual(result, expected, places=1)

    def test_calculate_preference_similarity(self):
        user_preferences = ["running", "weight_loss", 3]
        other_preferences = ["running", "weight_loss", 3]
        result = calculate_preference_similarity(user_preferences, other_preferences)
        self.assertEqual(result, 1.0)  # Full match

        other_preferences = ["cycling", "muscle_gain", 1]
        result = calculate_preference_similarity(user_preferences, other_preferences)
        self.assertTrue(0 <= result <= 1)  # Similarity should be between 0 and 1


if __name__ == "__main__":
    unittest.main()
