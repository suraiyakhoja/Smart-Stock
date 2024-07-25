'''
TEST FILTER PAGE, suraiya 
'''
import pytest
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app
import requests



# https://testdriven.io/blog/flask-pytest/

# Test client 
@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


BASE_URL = 'http://localhost:5000'  

def test_filter_page():
    url = f'{BASE_URL}/filter_page'
    response = requests.get(url)
    assert response.status_code == 200
    data = response.json()
    assert 'categories' in data
    assert 'variants' in data
    assert isinstance(data['categories'], list)
    assert isinstance(data['variants'], list)

def test_filter_products_by_category():
    url = f'{BASE_URL}/filter_products?category=5'
    response = requests.get(url)
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    for product in products:
        assert product['product_category'] == 6

def test_filter_products_by_variant():
    url = f'{BASE_URL}/filter_products?variant=10'
    response = requests.get(url)
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    for product in products:
        assert product['variant_id'] == 6

def test_filter_products_by_category_and_variant():
    url = f'{BASE_URL}/filter_products?category=1&variant=4'
    response = requests.get(url)
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    for product in products:
        assert product['product_category'] == 4
        assert product['variant_id'] == 4

def test_filter_products_no_filters():
    url = f'{BASE_URL}/filter_products'
    response = requests.get(url)
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)

# Run tests
if __name__ == '__main__':
    test_filter_page()
    test_filter_products_by_category()
    test_filter_products_by_variant()
    test_filter_products_by_category_and_variant()
    test_filter_products_no_filters()
    print("All tests passed!")
   