from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config

variants = Blueprint('variants', __name__)



#################################### Variant ROUTE - BOBBY ####################################
@variants.route('/variant', methods=['GET'])
def variant() -> Any:
    db_config = current_app.config['db_config']

    try:
        # function creates an address for the Variant table from the database. 
        logging.info('Pulling Variant request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve Variant data from the database
        cursor.execute("SELECT * FROM variant")
        variant_data = cursor.fetchall()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert Variant data to JSON format
        variant_json = []
        for row in variant_data:
            variant_json.append({
                'variant_id': row[0],
                'variant_name': row[1],
                'variant_value': row[2]
            })

        return jsonify({'variant': variant_json}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500

    #################################### Add Variant ROUTE - BOBBY ####################################
#for repeated code, documentation is in addProduct
@variants.route('/addVariant', methods=['POST'])
def add_variant() -> Any:
    db_config = current_app.config['db_config']

    logging.info('Creating Variant request received')
    data: Dict[str,str]  = request.json
    variant_name: str = data.get('variant_name', '')
    variant_value: str = data.get('variant_value', '')
    
    if variant_name == '' or variant_value == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Function to check if variant exists in the database
        def variant_exists(column, value):
            cursor.execute(f"SELECT EXISTS(SELECT * from variant WHERE {column} = %s)", (value,))
            return cursor.fetchone()[0]
        
        # Check if variant_name and variant_value exist
        variant_name_exists = variant_exists("variant_name", variant_name)
        variant_value_exists = variant_exists("variant_value", variant_value)
        
        if variant_name_exists and variant_value_exists:
            # Both variant name and value exist
            #can have shape, circle and cretae shape,square but not shape,circle and create shape,circle
            return jsonify({'message': 'Variant value already exists. Please use a different variant.'}), 400
        
        else: # Add the variant if either the name or value doesn't exist
            cursor.execute("INSERT INTO variant (variant_name, variant_value) VALUES (%s, %s)", (variant_name, variant_value))
            
            conn.commit()
        
        cursor.close()
        conn.close()
        logging.info('Variant added successfully')
        
        return jsonify({'message': 'Variant added successfully'}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500



#############################Delete Variant Route Nick############################
# DeleteVariant API for delete function.
# A non-empty variant ID is required.
# Then a SQL query will be executed to remove the variant in the database.

@variants.route('/deleteVariant', methods=['DELETE'])
def delete_variant() -> Any:
    db_config = current_app.config['db_config']
    logging.info('Delete variant request received')
    data: Dict[str,str]  = request.json
    variant_id: str =data.get('variant_id','')

    if variant_id =='':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
    
    
        cursor.execute("SELECT EXISTS(SELECT * from variant WHERE variant_id = %s)", (variant_id,))
        variant_id_exists = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        if not variant_id_exists:
            return jsonify({'message': 'Variant not found.'}), 404
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM variant WHERE variant_id = %s", (variant_id,))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('variant deleted successfully')
        
        return jsonify({'message': "variant deleted successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500

