from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config

filter = Blueprint('filter', __name__)


#################################### FILTERING - suraiya ####################################

'''
FILTER PAGE, suraiya 
filter_page is the page the user can go to if they want to find products by filtering them. Users can only filter by 
category and variant, so this route fetches that information from the database to give options to user. (This basically 
renders categories and variants, doesn't do any actual filtering!) 
'''
@filter.route('/filter_page')
def filter_page():
    db_config=current_app.config['db_config']
    try:
        # Connect to database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Select row of data from category table 
        cursor.execute("SELECT category_id, category_name, category_description FROM category")
        categories = cursor.fetchall()

        # Select row of data from variant table 
        cursor.execute("SELECT variant_id, variant_name, variant_value FROM variant")
        variants = cursor.fetchall()

        # Close connection
        cursor.close()

        # Return data 
        return jsonify({
            'categories': categories,
            'variants': variants
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


'''
FILTER PRODUCTS, suraiya 
filter_products gets called to do the filtering. It takes the category and variant the user chooses as parameters and 
accesses the database with them. Once it finds products with the specific category and/or variant, it returns them to
frontend as a json array.
'''
@filter.route('/filter_products', methods=['GET'])
def get_products():
    db_config=current_app.config['db_config']
    try:
        # Retrieve category and variant parameters from url 
        category_id = request.args.get('category')
        variant_id = request.args.get('variant')

        # Connect to database 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Create query starter for products to display 
        query = "SELECT product_id, barcode, product_name, product_description, product_category, variant_id FROM product"
        params = []

        # Finish query with categories and variants that were checked. Selects data products with checked requirements. 
        if category_id is not None and variant_id is not None:
            query += " WHERE product_category = %s AND variant_id = %s"
            params = [category_id, variant_id]
        elif category_id is not None:
            query += " WHERE product_category = %s"
            params = [category_id]
        elif variant_id is not None:
            query += " WHERE variant_id = %s"
            params = [variant_id]

        # Execute finished query 
        cursor.execute(query, params)
        products = cursor.fetchall()

        # Close connection 
        cursor.close()

        # Return filtered products 
        response = jsonify(products)
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
