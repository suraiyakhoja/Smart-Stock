from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config
import re
stores = Blueprint('stores', __name__)


###############################store route Bobby ##########################################
#store table for addresess

@stores.route('/store', methods=['GET'])
def store() -> Any:
    db_config = current_app.config['db_config']
    try:
        # function creates an address for the Store table from the database. 
        logging.info('Pulling Store request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve store data from the database
        cursor.execute("SELECT * FROM store")
        store_data = cursor.fetchall()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert Store data to JSON format
        store_json = []
        for row in store_data:
            store_json.append({
                'store_id': row[0],
                'store_name': row[1],
                'address': row[2],
                'city' : row[3],
                'zipcode' : row[4]
            })

        return jsonify({'store': store_json}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500


#############################ADD store Booby################################################
@stores.route('/addStore', methods=['POST'])
def add_store() -> Any:
    db_config=current_app.config['db_config']
    logging.info('Creating Variant request received')
    data: Dict[str,str]  = request.json
    store_name: str = data.get('store_name', '')
    address: str = data.get('address', '')
    city: str = data.get('city', '')
    zipcode: str = data.get('zipcode', '')
    
    if store_name == '' or address == '' or city =='' or zipcode == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
       # Check if address already exists in the database
        cursor.execute("SELECT EXISTS(SELECT * from store WHERE address = %s)", (address,))
        address_exists = cursor.fetchone()[0]

        #close connection
        cursor.close()
        conn.close()

        # If address already exists, return an error message
        if address_exists:
            return jsonify({'message': 'Address already exists. Please use a different barcode.'}), 400
        
        # Re-establish database connection to insert the new store
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        #create new row in database and insert new stre
        cursor.execute("INSERT INTO store (store_name, address, city, zipcode) VALUES (%s, %s, %s, %s)", (store_name, address, city, zipcode))
        conn.commit()

        cursor.close()
        conn.close()
        logging.info('Store added successfully')

        return jsonify({'message': 'Store added successfully;)'}), 201
    except mysql.connector.Error as error:
        #There is a problem with the database connection with MySQL
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    
##############################DELETE Store Bobby#################################################
    

@stores.route('/deleteStore', methods=['DELETE'])
def delete_store() -> Any:
    db_config=current_app.config['db_config']
    logging.info('Delete Store request received')
    data: Dict[str,str]  = request.json
    store_id: str =data.get('store_id', '')

    if store_id == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT EXISTS(SELECT * from store WHERE store_id = %s)", (store_id,))
        store_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        if not store_id_exists:
            return jsonify({'message': 'Store not found.'}), 404
        # Re-establish database connection to delete the product
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
    
        cursor.execute("DELETE FROM store WHERE store_id = %s", (store_id,))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('Store deleted successfully')
        return jsonify({'message': "Store deleted successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500