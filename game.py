import random

print("=== Привіт! Я твій цифровий помічник ===")

name = input("Як тебе звати? ")
age = int(input("Скільки тобі років? "))
favorite_color = input("Твій улюблений колір? ")

lucky_number = random.randint(1, 100)
birth_year = 2026 - age

superpowers = [
    "телепортація", "читання думок", "керування часом",
    "невидимість", "надшвидкість", "розмова з тваринами"
]
spirit_animals = [
    "мудра сова", "хитра лисиця", "сильний ведмідь",
    "швидкий гепард", "спокійна черепаха", "вільний орел"
]
future_jobs = [
    "розробник ігор", "фахівець з кібербезпеки", "дизайнер роботів",
    "аналітик даних", "творець ШІ", "космічний інженер"
]

my_superpower = random.choice(superpowers)
my_animal = random.choice(spirit_animals)
my_job = random.choice(future_jobs)

facts = [
    f"{name}, твій колір '{favorite_color}' символізує творчість!",
    f"У {birth_year} році народилось багато класних програмістів 😉",
    f"Твоє щасливе число сьогодні: {lucky_number}",
    f"Твоя прихована суперсила: {my_superpower}!",
    f"Твоя тварина-патронус: {my_animal}",
    f"У майбутньому з тебе вийде чудовий {my_job}",
]

print("\n--- Ось що я про тебе дізнався ---")
for fact in facts:
    print(fact)

if age >= 16:
    print("\nТи вже можеш вивчати серйозне програмування!")
else:
    print("\nУ тебе ще все попереду!")

print(f"\nДо зустрічі, {name}!")
