'''
TEST AUTHENTICATION PAGE, suraiya 
'''
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

#################################### Testing Logins ####################################
# Successful login
def test_successful_login(client):
    username = "spider"
    password = "Mandarin&0range"

    response = client.post('/login', json = {'username': username, 'password': password})

    assert response.status_code == 200

# Invalid password login
def test_invalid_password(client):
    username = "spider" 
    password = "spiderman_is_cool"
    
    response = client.post('/login', json = {'username': username, 'password': password})
    
    assert response.status_code == 401

def test_empty_field_user(client):
    username = ""
    password = "Mandarin&0range"

    response = client.post('/login', json = {'username': username, 'password': password})
    
    assert response.status_code == 400

def test_empty_field_pass(client):
    username = "spider"
    password = ""

    response = client.post('/login', json = {'username': username, 'password': password})

    assert response.status_code == 400

# User not found login 
def test_user_not_found(client):
    username = "pippy_longstocking"
    password = "redhairpigtails"

    response = client.post('/login', json = {'username': username, 'password': password})

    assert response.status_code == 404

#################################### Testing Registrations ####################################

# Successful registration
def test_successful_registration_pt1(client):
    #first, last, email, username, password, address, role

    data = {
        'firstName': 'Spongebob',
        'lastName': 'Squarepants',
        'email': 'spongebob@gmail.com',
    }
    response = client.post('/register_pt1', json=data)
    assert response.status_code == 201
    assert 'message' in response.json

# Successful registration
def test_successful_registration_pt2(client):
    #first, last, email, username, password, address, role

    data = {
        'username': 'spongebob_',
        'password': 'Mandarin&0range',
        'confirmPassword': 'Mandarin&0range',
    }
    response = client.post('/register_pt2', json=data)
    assert response.status_code == 201
    assert 'message' in response.json

# Successful registration
def test_successful_registration_pt3(client):
    #first, last, email, username, password, address, role

    data = {
        'address': 'Bikini Bottom',
        'role': 'sponge',
        'company': 'Krusty Krab',
    }
    response = client.post('/register_pt3', json=data)
    assert response.status_code == 201
    assert 'message' in response.json



# Required boxes not filled 
def test_required_boxes_pt1(client):
    first_name = "Spongebob"
    last_name = "Squarepants"
    email = ""

    response = client.post('/register_pt1', json = {'first_name': first_name, 'last_name': last_name, 'email': email})
    
    assert response.status_code == 400

# Required boxes not filled 
def test_required_boxes_pt2(client):
    username = ""
    password = "Mandarin&0range"
    confirm_password = "Mandarin&0range"

    response = client.post('/register_pt2', json = {'username': username, 'password': password, 'confirm_password': confirm_password})
    
    assert response.status_code == 400

# Required boxes not filled 
def test_required_boxes_pt3(client):
    address = "Bikini Bottom"
    role = "sponge"
    company = ""

    response = client.post('/register_pt3', json = {'address': address, 'role': role, 'company': company})
    
    assert response.status_code == 400

# Email already exists
def test_email_exists(client):
    first_name = "Spider"
    last_name = "Man"
    email = "spiderman@gmail.com"

    response = client.post('/register_pt1', json = {'first_name': first_name, 'last_name': last_name, 'email': email})

    assert response.status_code == 400

# Username already exists
def test_username_exists(client):
    username = "spider"
    password = "Mandarin&0range"
    confirm_password = "Mandarin&0range"


    response = client.post('/register_pt2', json = {'username': username, 'password': password, 'confirm_password': confirm_password})

    assert response.status_code == 400

# Password requirements not met 
def test_password_requirements(client):
    username = "spongebob_"
    password = "im ready"
    confirm_password = "Mandarin&0range"

    response = client.post('/register_pt2', json = {'username': username, 'password': password, 'confirm_password': confirm_password})

    assert response.status_code == 400

# Passwords don't match
def test_passwords_match(client):
    username = "spongebob_"
    password = "Mandarin&0range"
    confirm_password = "im ready"

    response = client.post('/register_pt2', json = {'username': username, 'password': password, 'confirm_password': confirm_password})

    assert response.status_code == 400

