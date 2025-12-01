from django.utils import timezone
from datetime import timedelta


def apply_sm2(card, grade):
    """
    card = dict containing:
    id, front, back, interval, ease_factor, repetition, next_review
    """

    # Extract previous values
    repetition = card.get("repetition", 0)
    interval = card.get("interval", 1)
    ef = card.get("ease_factor", 2.5)

    # SM-2 Algorithm
    if grade >= 3:
        if repetition == 0:
            interval = 1
        elif repetition == 1:
            interval = 6
        else:
            interval = round(interval * ef)

        repetition += 1
    else:
        repetition = 0
        interval = 1

    # Update EF
    ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    if ef < 1.3:
        ef = 1.3

    next_review_date = timezone.now() + timedelta(days=interval)

    # Save changes inside card dict
    card["repetition"] = repetition
    card["interval"] = interval
    card["ease_factor"] = ef
    card["next_review"] = next_review_date.isoformat()

    return card
