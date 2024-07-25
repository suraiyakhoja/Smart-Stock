from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config

categories = Blueprint('categories', __name__)

#################################### Category ROUTE - BOBBY ####################################
@categories.route('/category', methods=['GET'])
def category() -> Any:
    db_config = current_app.config['db_config']
    try:
        # function creates an address for the Category table from the database. 
        logging.info('Pulling Category request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve Category data from the database
        cursor.execute("SELECT * FROM category")
        category_data = cursor.fetchall()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert Category data to JSON format
        category_json = []
        for row in category_data:
            category_json.append({
                'category_id': row[0],
                'category_name': row[1],
                'category_description': row[2]
            })

        return jsonify({'category': category_json}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    

    #################################### Add Category ROUTE - BOBBY ####################################

@categories.route('/addCategory', methods=['POST'])
def add_category() -> Any:
    db_config = current_app.config['db_config']
    #Add a new category
    logging.info('Creating Category request received')
    data: Dict[str,str]  = request.json
    category_name: str = data.get('category_name', '')
    category_description: str = data.get('category_description', '')
    #allows for retrieval of values of fields such as 'category_name', 'category_description'
    
    # Check if all required fields are filled
    if category_name == '' or category_description == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        #check if category is in database
        cursor.execute("SELECT EXISTS(SELECT * from category WHERE category_name = %s)", (category_name,))
        category_exists = cursor.fetchone()[0]
        #cant create new category if it is already in database
        if category_exists:
            return jsonify({'message': 'Category already exists. Please use a different category name.'}), 400
        
        #create new row in database and insert new category
        cursor.execute("INSERT INTO category (category_name, category_description) VALUES (%s, %s)", (category_name, category_description))
        conn.commit()
        
        #close connection
        cursor.close()
        conn.close()
        logging.info('Category added successfully')
        
        return jsonify({'message': 'Category added successfully;)'}), 201
    except mysql.connector.Error as error:
        #There is a problem with the database connection with MySQL
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    


############################ Delete Category Route Nick #####################################
# DeleteCategory API for delete function.
# A non-empty category ID is required.
# Then a SQL query will be executed to remove the category in the database.

@categories.route('/deleteCategory', methods=['DELETE'])
def delete_category() -> Any:
    db_config=current_app.config['db_config']
    logging.info('Delete category request received')
    data: Dict[str,str]  = request.json
    category_id: str =data.get('category_id','')

    if category_id =='':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT EXISTS(SELECT * from category WHERE category_id = %s)", (category_id,))
        category_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        if not category_id_exists:
            return jsonify({'message': 'Category not found.'}), 404
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM category WHERE category_id = %s", (category_id,))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('Category deleted successfully')
        return jsonify({'message': "Category deleted successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500

