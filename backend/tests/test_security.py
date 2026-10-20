"""
Each test here is a hole that existed before October 2026: logging in was the only
check, so any user could change any store's bags, add-ons, and orders.
"""
from jose import jwt

from tests.conftest import signup


# ---------- sign-up ----------

def test_cannot_sign_up_as_admin(api):
    res = api.post("/auth/register", json={
        "email": "sneaky@example.com", "password": "x" * 12, "full_name": "Sneaky", "role": "admin",
    })
    assert res.status_code == 403


def test_customers_and_owners_can_sign_up():
    signup("customer")
    signup("store_owner")


# ---------- login tokens ----------

def test_token_signed_with_the_old_hardcoded_secret_is_rejected(api):
    forged = jwt.encode({"sub": "1"}, "fallback_secret_change_me", algorithm="HS256")
    res = api.get("/auth/me", headers={"Authorization": f"Bearer {forged}"})
    assert res.status_code == 401


# ---------- bags ----------

def test_only_the_store_owner_can_change_stock(api, owner, a_bag):
    url = f"/bags/{a_bag['id']}/stock?quantity=5"
    assert api.patch(url, headers=signup("customer")).status_code == 403
    assert api.patch(url, headers=signup("store_owner")).status_code == 403  # a different owner
    assert api.patch(url, headers=owner).status_code == 200


def test_stock_cannot_go_negative(api, owner, a_bag):
    assert api.patch(f"/bags/{a_bag['id']}/stock?quantity=-3", headers=owner).status_code == 400


def test_cannot_add_bags_to_someone_elses_store(api, a_bag):
    res = api.post("/bags/", headers=signup("store_owner"), json={
        "store_id": a_bag["store_id"], "title": "Fake bag", "description": "Not really from this store",
        "original_price": 10, "discounted_price": 1, "quantity_available": 99, "quantity_total": 99,
        "pickup_start": "17:00", "pickup_end": "19:00",
    })
    assert res.status_code == 403


# ---------- add-ons ----------

def test_add_ons_are_owner_only(api, owner, a_bag):
    payload = {"store_id": a_bag["store_id"], "name": "Test cookie", "price": 2.5}
    assert api.post("/addons/", headers=signup("customer"), json=payload).status_code == 403
    created = api.post("/addons/", headers=owner, json=payload)
    assert created.status_code == 200
    addon_id = created.json()["id"]
    assert api.delete(f"/addons/{addon_id}", headers=signup("store_owner")).status_code == 403
    assert api.delete(f"/addons/{addon_id}", headers=owner).status_code == 200


# ---------- orders ----------

def _place_order(api, customer, bag_id, quantity=1, addon_ids=()):
    return api.post("/orders/", headers=customer, json={
        "items": [{"bag_id": bag_id, "quantity": quantity}], "addon_ids": list(addon_ids),
    })


def test_only_the_stores_owner_can_update_an_order(api, owner, a_bag):
    customer = signup("customer")
    order = _place_order(api, customer, a_bag["id"])
    assert order.status_code == 200, order.text
    url = f"/orders/{order.json()['id']}/status?status=collected"
    assert api.patch(url, headers=customer).status_code == 403          # the customer themselves
    assert api.patch(url, headers=signup("store_owner")).status_code == 403  # another store
    assert api.patch(url, headers=owner).status_code == 200


def test_negative_quantity_orders_are_rejected(api, a_bag):
    res = _place_order(api, signup("customer"), a_bag["id"], quantity=-5)
    assert res.status_code == 422


def test_deleted_add_ons_cannot_be_bought(api, owner, a_bag):
    addon = api.post("/addons/", headers=owner, json={"store_id": a_bag["store_id"], "name": "Gone", "price": 1}).json()
    api.delete(f"/addons/{addon['id']}", headers=owner)
    res = _place_order(api, signup("customer"), a_bag["id"], addon_ids=[addon["id"]])
    assert res.status_code == 404
