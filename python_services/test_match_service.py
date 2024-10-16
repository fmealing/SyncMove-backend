import unittest
from match_service import app


class TestMatchService(unittest.TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_match(self):
        response = self.client.post(
            "/match",
            json={
                "location": [52.5200, 13.4050],
                "preferences": ["running", "weight_loss", 2],
                "includeAI": False,
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("matches", data)
        self.assertIsInstance(data["matches"], list)
        self.assertLessEqual(len(data["matches"]), 3)  # Should return up to 3 matches


if __name__ == "__main__":
    unittest.main()
