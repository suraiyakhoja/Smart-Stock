from flask import Blueprint, request, jsonify, session, current_app
import mysql.connector
import bcrypt
from typing import List, Tuple, Dict, Any 
import logging
import random
import string
from mailjet_rest import Client
import requests
import re

map = Blueprint('map', __name__)

#################################### MAP - suraiya ####################################

'''
GET ADDRESS, suraiya
Gets address from database from username in localStorage. This is to display users address on map. 
'''
@map.route('/map_get_address', methods=['GET'])
def get_user_address():
    db_config=current_app.config['db_config']
    connection = mysql.connector.connect(**db_config)
    #user_db_config = current_app.config['user_db_config']
    #global user_db_config


    #data: Dict[str, str] = request.json
    # Retrieves username from parameter. 
    username = request.args.get('username', '')
    try:
        # Connect to database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Retrieves address associated witih username from local storage. 
        cursor.execute("SELECT address FROM user WHERE username = %s", (username,))
        address = cursor.fetchone()

        # Close connection 
        cursor.close()
        connection.close()

        # Return address 
        if address:
            return jsonify({'address': address[0]}), 200
        else:
            return jsonify({'message': 'address not found'}), 404
    except mysql.connector.Error as error:
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    

'''
BUY PRODUCT, suraiya
When user buys product, information of purchase is inserted into product_locations table in database. 
'''
@map.route('/buy_product', methods=['POST'])
def buy_product():
    # Data received from frontend
    db_config = current_app.config['db_config']
    data = request.get_json()
    product_id = data['product_id']
    #quantity = data['quantity']
    purchase_address = data['purchase_address']
    username = data['user']
    order_number = data['order_number']

    # Connect to database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Insert addresses for location of product into database. 
        cursor.execute("SELECT address FROM user WHERE username = %s", (username,))
        user_address = cursor.fetchone()[0]
        cursor.execute("INSERT INTO product_locations (product_id, purchase_address, current_location, destination_location, order_number) VALUES (%s, %s, %s, %s, %s)",
                       (product_id, purchase_address, purchase_address, user_address, order_number))
        
        # Commit and close 
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Product purchased and location updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to process purchase: ' + str(e)}), 500

'''
SELL PRODUCT, suraiya
When user sells product, information of sell is inserted into product_locations table in database. 
'''
@map.route('/sell_product', methods=['POST'])
def sell_product():
    # Retrieve data from frontend 
    db_config = current_app.config['db_config']
    data = request.get_json()
    product_id = data['product_id']
    #quantity = data['quantity']
    purchase_address = data['purchase_address']
    username = data['user']
    order_number = data['order_number']

    # Connect to database
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Insert address for location of product in database. 
        cursor.execute("SELECT address FROM user WHERE username = %s", (username,))
        user_address = cursor.fetchone()[0]
        cursor.execute("INSERT INTO product_locations (product_id, purchase_address, current_location, destination_location, order_number) VALUES (%s, %s, %s, %s, %s)",
                       (product_id, user_address, user_address, purchase_address, order_number))
        
        # Commit and close 
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Product sold and location updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to process purchase: ' + str(e)}), 500


'''
GET PRODUCT LOCATIONS, suraiya
Gets location of the product 
'''
@map.route('/get_product_locations', methods=['GET'])
def get_product_locations():
    db_config = current_app.config['db_config']

    try:
        # Connect to database 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve data about location of product from database. 
        cursor.execute("SELECT product_id, current_location FROM product_locations")
        locations = cursor.fetchall()

        # Commit and close 
        cursor.commit()
        cursor.close()
        conn.close()
        return jsonify(locations), 200
    
    except Exception as e: 
        return jsonify({'message': str(e)}), 500
    

'''
GEOCODE ADDRESS, suraiya 
Makes an API call to TomTom API to geocode a given address to display on map. 
Address string is made into location with latitude and longitude. 
'''
def geocode_address(address):
    api_key = 'P2UKHO4MG64AGnfS0vAHaUKtEY9mL7UG'
    # Inserts address parameter to API call in url with API key. 
    url = f'https://api.tomtom.com/search/2/geocode/{address}.json?key={api_key}'
    response = requests.get(url)
    data = response.json()
    try: 
        # Separate into latitude and longitude 
        lat = data['results'][0]['position']['lat']
        lon = data['results'][0]['position']['lon']
        return lat, lon
    except (IndexError, KeyError):
        return None, None
    
'''
SEARCH PRODUCT, suraiya
User enters product to search by order number. Geocodes addresses for current and purchase locations from database
for displaying on map. 
'''
@map.route('/search_product', methods=['GET'])
def search_product():
    search_order = request.args.get('query', '')
    db_config = current_app.config['db_config']

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Select information from product_locations and product table. 
        cursor.execute('''
            SELECT pl.product_id, pl.purchase_address, pl.current_location, p.product_name, p.barcode
            FROM product_locations pl
            JOIN product p ON pl.product_id = p.product_id
            WHERE pl.order_number= %s;
        ''', (search_order,))

        products = cursor.fetchall()

        # Close and commit 
        cursor.close()
        conn.close()

        results = []

        # Geocode locations for current location and purchased location 
        for product in products:
            purchase_lat, purchase_lon = geocode_address(product[1])
            current_lat, current_lon = geocode_address(product[2])
            results.append({
                'product_id': product[0],
                'purchase_coords': {'lat': purchase_lat, 'lng': purchase_lon},
                'current_coords': {'lat': current_lat, 'lng': current_lon}
            })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

'''
UPDATE LOCATION, suraiya
Updates location of product in database with new string address. (not geocoded). 
'''
@map.route('/update_location', methods=['POST'])
def update_location():
    # Retrieve data from frontend
    data = request.get_json()
    #product_id = data['product_id']
    search_order = data['searchOrder']
    new_location = data['newLocation']
    db_config = current_app.config['db_config']

    try:
        # Connect to database 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Update database with new current location of product. 
        cursor.execute("""
            UPDATE product_locations
            SET current_location = %s
            WHERE order_number = %s;
        """, (new_location, search_order))

        # Commit and close 
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Location updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to update location: ' + str(e)}), 500

