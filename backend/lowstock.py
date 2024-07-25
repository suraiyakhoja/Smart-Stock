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

lowstock = Blueprint('lowstock', __name__)

#################################### SHOW LOW STOCK-NICK ####################################
#Show low stock products in ascending order from top to bottom
#Table shows product ID, quantity, product name, barcode and category information
@lowstock.route('/showLowStock', methods=['GET'])
def show_low_stock() -> Any:
    db_config=current_app.config['db_config']
    #user_db_config = current_app.config['user_db_config']
    #global user_db_config

    try:
        # function creates an address for the Variant table from the database. 
        logging.info('Pulling Low Stock request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        #query to get product list sorted based on its inventory quantity
        #if same quantity, the list is sorted based on product barcode 
        query='''
        SELECT product.product_id, quantity, barcode, product_name, category_name, variant_value
        FROM product
        INNER JOIN category
        ON product.product_category=category.category_id
        INNER JOIN variant
        ON product.variant_id = variant.variant_id
        LEFT JOIN inventory
        ON inventory.product_id=product.product_id
        ORDER BY quantity, barcode
        LIMIT 20;
        '''
        
        cursor.execute(query)
        low_stock_data = cursor.fetchall()
        #fetch all data from table

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert Low Stock data to JSON format
        lowstock = []
        for row in low_stock_data:
            lowstock.append({
                'product_id': row[0],
                'inventory_quantity': row[1],
                'product_barcode': row[2],
                'product_name': row[3],
                'category_name': row[4],
                'variant_value': row[5]
            })
        return jsonify({'lowstock': lowstock}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500

