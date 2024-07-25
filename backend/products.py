from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
import re
#from app import db_config

products = Blueprint('products', __name__)


#################################### Product ROUTE - BOBBY ####################################
#https://www.tutorialspoint.com/how-can-you-perform-inner-join-on-two-tables-using-mysql-in-python
    #https://www.geeksforgeeks.org/flask-app-routing/
@products.route('/product', methods=['GET'])
def product() -> Any:
    db_config = current_app.config['db_config']
    try:
        # function creates an address for the product table from the database. 
        logging.info('Pulling Product request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve Product data from the database
        #cursor.execute("SELECT * FROM product")
        #product_data = cursor.fetchall()
        #modify the sql query so now in the product page I can see variant and category data.
        cursor.execute("""
            SELECT 
                product.product_id,
                product.barcode,
                product.product_name,
                product.product_description,
                product.product_category,
                category.category_name,
                product.variant_id,
                variant.variant_name,
                variant.variant_value
            FROM 
                product
            JOIN 
                category ON product.product_category = category.category_id
            JOIN
                variant ON product.variant_id = variant.variant_id
        """)
        product_data = cursor.fetchall()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert Product data to JSON format
        product_json = []
        for row in product_data:
            product_json.append({
                'product_id': row[0],
                'barcode': row[1],
                'product_name': row[2],
                'product_description': row[3],
                'product_category': row[4],
                'category_name': row[5],#for category name ie innerwear
                'variant_id': row[6],
                'variant_name': row[7], #variant name shape color 
                'variant_value': row[8] # large green
            })

        return jsonify({'product': product_json}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500


#################################### Add Product ROUTE - BOBBY ####################################
    
      #https://www.geeksforgeeks.org/flask-app-routing/

@products.route('/addProduct', methods=['POST'])
def add_product() -> Any:
    db_config = current_app.config['db_config']
    '''
    Add a new product to the database.
    reuturns a response with a status code of 201 if the product was added successfully, or 
    returns a response with a status code of 400 if the product was not added successfully.
    raises a response with a status code of 500 if the database connection failed.
    '''
    logging.info('Creating Product request received')
    data: Dict[str,str]  = request.json
    barcode: str = data.get('barcode', '')
    product_name: str = data.get('product_name', '')
    product_description: str = data.get('product_description', '')
    product_category: str = data.get('product_category', '')
    variant_id: str = data.get('variant_id', '')
    '''
    using dictionary allows for access and  handling of JSON data from requests.
    JSON data needs to be parsed and processed before it can be added to the database.
    data: Dict[str, str] = request.json parses the JSON data from the request into a dictionary 
    where the keys are strings and the values are strings. This allows for retrieval of values 
    of different fields such as 'barcode', 'product_name', 'product_description
    using dictionary allows for the code to be structured and access and manipulating data to be easier
    '''

    # Check if all required fields are filled
    if barcode == '' or product_name == '' or product_description == '' or product_category == '' or variant_id == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Check if barcode already exists in the database
        cursor.execute("SELECT EXISTS(SELECT * from product WHERE barcode = %s)", (barcode,))
        barcode_exists = cursor.fetchone()[0]

        # Check if product name already exists in the database
        cursor.execute("SELECT EXISTS(SELECT * from product WHERE product_name = %s)", (product_name,))
        product_exists = cursor.fetchone()[0]

        # Check if product_description is in database
        # cursor.execute("SELECT * FROM product WHERE product_description = %s", (product_description,))
        cursor.execute("SELECT EXISTS(SELECT * from product WHERE product_description = %s)", (product_description,))
        product_description_exists = cursor.fetchone()[0]

        #close connection
        cursor.close()
        conn.close()

        # If barcode already exists, return an error message
        if barcode_exists:
            return jsonify({'message': 'Barcode already exists. Please use a different barcode.'}), 400
        
        # If product name and description combination already exists, return an error message
        if product_exists:
            if product_description_exists:
                return jsonify({'message': 'Product with the same description already exists. Please choose a different product description.'}), 400
        
        # Re-establish database connection to insert the new product
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        #create new row in database and insert new product
        cursor.execute("INSERT INTO product (barcode, product_name, product_description, product_category, variant_id) VALUES (%s, %s, %s, %s, %s)", (barcode, product_name, product_description, product_category, variant_id))
        conn.commit()

        cursor.close()
        conn.close()
        logging.info('Product added successfully')

        return jsonify({'message': 'Product added successfully;)'}), 201
    except mysql.connector.Error as error:
        #There is a problem with the database connection with MySQL
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    
############################ Delete Product Route nick #####################################
# DeleteProduct API for delete function.
# A non-empty product ID is required.
# Then a SQL query will be executed to remove the product in the database.

@products.route('/deleteProduct', methods=['DELETE'])
def delete_product() -> Any:
    db_config=current_app.config['db_config']
    
    logging.info('Delete Product request received')
    data: Dict[str,str]  = request.json
    product_id: str =data.get('product_id', '')

    if product_id == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT EXISTS(SELECT * from product WHERE product_id = %s)", (product_id,))
        product_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        if not product_id_exists:
            return jsonify({'message': 'Product not found.'}), 404
        # Re-establish database connection to delete the product
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
    
        cursor.execute("DELETE FROM product WHERE product_id = %s", (product_id,))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('Product deleted successfully')
        return jsonify({'message': "Product deleted successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
