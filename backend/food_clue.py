"""Server-side food-clue inference, mirroring frontend/src/utils/foodClue.js.
Used to enforce the dietary "hard auto-cancel" at checkout."""
import re

def store_diet(store):
    h = f"{store.name or ''} {store.category or ''} {store.description or ''}".lower()
    if re.search(r"sushi|seafood|fish|ocean|poke|oyster|shrimp|crab|lobster", h):
        return "seafood"
    if re.search(r"steak|grill|bbq|burger|meat|butcher|beef|pork|chicken|deli|smokehouse", h):
        return "meat"
    if re.search(r"veg|salad|green|garden|plant|vegan", h):
        return "veggie"
    if re.search(r"bakery|bread|pastry|patisserie|bagel|donut|cake", h):
        return "bakery"
    cat = (store.category or "").lower()
    return {"bakery": "bakery", "cafe": "cafe", "grocery": "mixed", "restaurant": "mixed"}.get(cat, "mixed")

# Each dietary preference -> the set of store "diets" it conflicts with.
_CONFLICTS = {
    "vegetarian": {"meat", "seafood"},
    "vegan": {"meat", "seafood", "bakery"},   # bakery commonly has dairy/eggs
    "no_seafood": {"seafood"},
    "gluten_free": {"bakery"},
}

_LABELS = {
    "vegetarian": "vegetarian",
    "vegan": "vegan",
    "no_seafood": "no seafood/shellfish",
    "gluten_free": "gluten-free",
}

def conflict_reason(prefs, diet):
    """Return a human label for the first conflicting pref, or None."""
    for p in prefs:
        if diet in _CONFLICTS.get(p, set()):
            return _LABELS.get(p, p)
    return None
