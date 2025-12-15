from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.models import UserPalace, PalaceTemplate, Furniture, Flashcard
import json

PALACE_MATRIX = [
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  [
    '1__',
    '1__',
    '1__',
    '1__',
    '1__',
    '0__',
    '2_bedGreen_',
    '2__',
    '2__',
    '2__',
    '2__',
  ],
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  ['1__', '1__', '1__', '1__', '1__', '0__', '2__', '2__', '2__', '2__', '2__'],
  ['0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__', '0__'],
  [
    '3__',
    '3__0',
    '3__',
    '3__',
    '3__',
    '0__',
    '4__',
    '4__',
    '4__0',
    '4__',
    '4__',
  ],
  ['3__', '3_chairWood_', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4_chairWood_', '4__', '4__', '4__', '4__'],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
  [
    '3__',
    '3__',
    '3_bedGreen_',
    '3__',
    '3__',
    '0__',
    '4__',
    '4_bedGreen_',
    '4__',
    '4__',
    '4__',
  ],
  ['3__', '3__', '3__', '3__', '3__', '0__', '4__', '4__', '4__', '4__', '4__'],
]



class Command(BaseCommand):
    help = "Create initial palace with flashcards data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding palace + flashcards...")

        user = User.objects.get(id=1)

        template, _ = PalaceTemplate.objects.get_or_create(
            name="Default Learning Palace",
            defaults={
                "palace_matrix": json.dumps(PALACE_MATRIX)
            }
        )

        palace, _ = UserPalace.objects.get_or_create(
            user=user,
            name="First Learning Palace",
            defaults={
                "palace_matrix": template.palace_matrix
            }
        )

        raw_flashcards = [
            ("What is soybean inoculation?",
             "Applying beneficial rhizobia bacteria to soybean seeds before planting."),
            ("Which bacteria is primarily used in soybean inoculants?",
             "Bradyrhizobium japonicum."),
            ("What is the main purpose of soybean inoculation?",
             "To enhance nitrogen fixation and improve plant growth."),
            ("Do soybeans naturally contain nitrogen-fixing bacteria in all soils?",
             "No, many soils lack effective Bradyrhizobium strains."),
            ("When should soybeans be inoculated?",
             "Shortly before sowing."),
            ("What environmental factor negatively affects inoculant bacteria?",
             "High temperatures and direct sunlight."),
            ("What is the optimal soil pH for effective nodulation?",
             "Around 6.0–6.8."),
            ("What is a nodule on a soybean root?",
             "A structure formed by rhizobia where nitrogen fixation occurs."),
            ("What color indicates an active nitrogen-fixing nodule?",
             "Pink or reddish inside."),
            ("What happens if nodules are white or greenish?",
             "They are inactive and not fixing nitrogen."),
            ("How deep should soybean seeds be planted?",
             "Typically 3–5 cm."),
            ("Should you inoculate soybeans in fields with a long history of cultivation?",
             "Often yes, to maintain strong rhizobia populations."),
            ("What reduces the effectiveness of inoculant bacteria on seeds?",
             "Sunlight, heat, and planting delays."),
            ("What increases nodulation in soybeans?",
             "Proper inoculation with effective rhizobia strains."),
            ("Should inoculated seeds be mixed with fertilizers?",
             "No, fertilizers may harm rhizobia."),
            ("Can rhizobia survive long on dry seed?",
             "They survive poorly; plant soon after inoculation."),
            ("What macronutrient do rhizobia supply?",
             "Nitrogen."),
            ("What type of nitrogen do rhizobia fix?",
             "Atmospheric nitrogen into plant-usable forms."),
            ("What soil condition can limit nodulation?",
             "Compacted or waterlogged soils."),
            ("Why is soybean inoculation cost-effective?",
             "It reduces the need for synthetic nitrogen fertilizers."),
        ]

        furniture, _ = Furniture.objects.get_or_create(
            palace=palace,
            user=user,
            name="Soybean Inoculation Basics",
            defaults={
                "description": "20 flashcards about soybean inoculation"
            }
        )

        for front, back in raw_flashcards:
            Flashcard.objects.get_or_create(
                furniture=furniture,
                user=user,
                front=front,
                back=back,
                interval=1,
                ease_factor=2.5,
                repetition=0,
                next_review=timezone.now()
            )

        self.stdout.write(self.style.SUCCESS("Seeding completed."))
