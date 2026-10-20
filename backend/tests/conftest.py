"""
Tests run against a throwaway SQLite database seeded with the sample stores,
so they never touch your real tgtg_dev.db.
"""
import os
import tempfile
import uuid

import pytest

_tmp = tempfile.mkdtemp(prefix="tgtg-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["JWT_SECRET"] = "test-only-secret"

import seed  # noqa: E402,F401  (seeds the throwaway database on import)
from fastapi.testclient import TestClient  # noqa: E402
from main import app  # noqa: E402
from database import SessionLocal  # noqa: E402
import models  # noqa: E402

client = TestClient(app)


def signup(role="customer"):
    """Registers a brand-new user and returns auth headers for them."""
    email = f"{role}-{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/auth/register", json={
        "email": email, "password": "test-password-123", "full_name": "Test User", "role": role,
    })
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


def login(email, password):
    res = client.post("/auth/login", data={"username": email, "password": password})
    if res.status_code != 200:  # some versions take JSON instead of a form
        res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


@pytest.fixture()
def api():
    return client


@pytest.fixture()
def owner():
    """The seeded owner, who owns every sample store."""
    return login("owner@tgtg.com", "owner1234")


@pytest.fixture()
def a_bag():
    db = SessionLocal()
    try:
        bag = db.query(models.MagicBag).filter(models.MagicBag.quantity_available > 2).first()
        return {"id": bag.id, "store_id": bag.store_id}
    finally:
        db.close()
