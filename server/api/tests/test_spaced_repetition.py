from django.test import TestCase
from django.utils import timezone
from api.services.spaced_repetition import apply_sm2
from datetime import datetime, timedelta


class SpacedRepetitionTests(TestCase):

    def test_first_review_grade_3_sets_interval_1_day(self):
        card = {
            "repetition": 0,
            "interval": 1,
            "ease_factor": 2.5,
            "next_review": None,
        }

        now = timezone.now()
        result = apply_sm2(card, grade=3)

        self.assertEqual(result["repetition"], 1)
        self.assertEqual(result["interval"], 1)

        next_review = datetime.fromisoformat(result["next_review"])
        delta = next_review - now

        self.assertTrue(
            timedelta(hours=23) <= delta <= timedelta(hours=25)
        )


    def test_low_grade_resets_repetition_and_interval(self):
        card = {
            "repetition": 3,
            "interval": 10,
            "ease_factor": 2.5,
            "next_review": None,
        }

        result = apply_sm2(card, grade=1)

        self.assertEqual(result["repetition"], 0)
        self.assertEqual(result["interval"], 1)

    def test_high_grade_increases_interval_for_learned_card(self):
        card = {
            "repetition": 2,
            "interval": 6,
            "ease_factor": 2.5,
            "next_review": None,
        }

        result = apply_sm2(card, grade=5)

        self.assertEqual(result["repetition"], 3)
        self.assertGreater(result["interval"], 6)
        self.assertGreaterEqual(result["ease_factor"], 1.3)
        self.assertEqual(result["interval"], round(6 * 2.5))
        self.assertAlmostEqual(result["ease_factor"], 2.6, places=2)

    def test_ease_factor_never_drops_below_minimum(self):
        card = {
            "repetition": 5,
            "interval": 30,
            "ease_factor": 1.3,
            "next_review": None,
        }

        result = apply_sm2(card, grade=0)

        self.assertEqual(result["ease_factor"], 1.3)
        self.assertEqual(result["repetition"], 0)
        self.assertEqual(result["interval"], 1)

    def test_second_successful_review_sets_interval_to_6_days(self):
        card = {
            "repetition": 1,
            "interval": 1,
            "ease_factor": 2.5,
            "next_review": None,
        }

        result = apply_sm2(card, grade=4)

        self.assertEqual(result["repetition"], 2)
        self.assertEqual(result["interval"], 6)
