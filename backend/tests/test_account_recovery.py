'''
TEST ACCOUNT RECOVERY, suraiya 
https://testdriven.io/blog/flask-pytest/
'''
import os
import sys
import unittest
import pytest

# Add path to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app  

# Test client 
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

# TEST VERIFICATION CODE IS CREATED AND SENT
'''
def test_successful_account_recovery(client):
        response = client.post('/account_recovery', json={'email': 'khoja.suraiya1@gmail.com'})
        assert response.status_code == 200
        data = response.get_json()
        assert(data['message'], 'Verification code sent!')
'''

def test_email_box_empty(client):
        response = client.post('/account_recovery', json={'email': ''})
        assert response.status_code == 400

def test_email_to_send_not_found(client):
        response = client.post('/account_recovery', json={'email': 'purpleorchids@gmail.com'})
        assert response.status_code == 404


# TEST USER RECEIVED VERIFICATION CODE (/verify_code)
def tets_verification_successful(client):
        response = client.post('/verify_code', json={'email': 'khoja.suraiya1@gmail.com', 'verification_code': 'HODK62'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Verification successful'

def test_email_not_found(client):
        response = client.post('/verify_code', json={'email': 'purpleorchids@gmail.com'})
        assert response.status_code == 400
        data = response.get_json()
        assert data['message'] == 'Email not found'


def test_incorrect_code(client):
        response = client.post('/verify_code', json={'email': 'khoja.suraiya1@gmail.com', 'verification_code': '1234'})
        assert response.status_code == 400
        data = response.get_json()
        assert data['message'] == 'Verification code is incorrect'

def test_verification_code_not_given(client):
        response = client.post('/verify_code', json={'email': 'khoja.suraiya1@gmail.com'})
        data = response.get_json()
        assert data['message'] == 'Enter verification code'
        assert response.status_code == 400


def test_empty_verification(client):
        response = client.post('/verify_code', json={'email': 'khoja.suraiya1@gmail.com', 'verification_code': ''})
        data = response.get_json()
        assert data['message'] == 'Enter verification code'
        assert response.status_code == 400

