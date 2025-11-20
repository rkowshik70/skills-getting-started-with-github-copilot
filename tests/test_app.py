
import pytest
from fastapi.testclient import TestClient
from src.app import app, activities
import copy

@pytest.fixture(autouse=True)
def reset_activities():
    # Save original state
    original = copy.deepcopy(activities)
    yield
    # Restore original state after each test
    activities.clear()
    activities.update(copy.deepcopy(original))

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Use a unique email to avoid conflicts
    email = "pytestuser@mergington.edu"
    activity = "Chess Club"
    # Signup
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email}" in response.json()["message"]
    # Unregister
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert f"Removed {email}" in response.json()["message"]

def test_signup_duplicate():
    email = "pytestduplicate@mergington.edu"
    activity = "Chess Club"
    # Signup first time
    client.post(f"/activities/{activity}/signup?email={email}")
    # Signup again (should fail)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]
    # Cleanup
    client.post(f"/activities/{activity}/unregister?email={email}")

def test_unregister_nonexistent():
    email = "notregistered@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 404
    assert "Participant not found" in response.json()["detail"]
