# SURAIYA KHOJA 


import pytest
import mysql.connector
# In tests/test_add_and_delete.py, tests/test_authentication.py, tests/test_dashboard.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app

from typing import List, Tuple, Dict, Any 


# https://testdriven.io/blog/flask-pytest/

# Test client 
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_logout_route(client):
    # Send a POST request to the logout route
    response = client.post('/logout')

    # Verify the response status code
    assert response.status_code == 200

    # Verify that the session data is cleared after logout
    with client.session_transaction() as sess:
        assert 'username' not in sess

    # Verify the response message
    assert response.json['message'] == 'Logout successful'
