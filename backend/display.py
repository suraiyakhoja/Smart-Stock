from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config

''' 
NOT USING THIS BLUEPRINT - suraiya 
'''


display = Blueprint('display', __name__)

global roles
roles ='Amin';#added to implement roles


'''
    This function is going to be in charge of creating a dictionary from the multiple rows fetched from our database.
    It is only implemented for 4 columns tho. so it needs to be revised to handle multiple column if it is going to be 
    used often in different ways.
    If I decide to rewrite this function it is important to notice that the keys in the dictionary would have to be 
    different and maybe specified ex(id, product_name,etc)
    
'''

#################################### SHOW LOW STOCK-NICK ####################################
#Show low stock products in ascending order from top to bottom
#Table shows product ID, quantity, product name, barcode and category information
@display.route('/showLowStock', methods=['GET'])
def show_low_stock() -> Any:
    db_config=current_app.config['db_config']
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
    


#################################### FETCH INVENTORY ROUTE - JUSTIN ####################################
def rows_to_dict(rows):
    json_dict = []
    for row in rows:
        # Convert each row tuple to a dictionary
        row_dict = {
            'inventory_id': row[0],
            'product_name': row[1],
            'product_description': row[2],
            'quantity': row[3],
            'roles':roles,
            #'product_category':row[4]
        }
        json_dict.append(row_dict)
    return json_dict

@display.route("/fetch_inventory", methods=['GET'])
def fetch_inventory() -> Any:
    db_config=current_app.config['db_config']
    print("ACCESSED FETCH INV")

    try :
        conn = mysql.connector.connect(**db_config)
        print(1)
        cursor = conn.cursor()
        print(2)

        cursor.execute("SELECT inventory_id, product_name, product_description, quantity FROM inventory JOIN product ON inventory.product_id = product.product_id")
        print(3)
        rows = cursor.fetchall() #This rows variable has all the rows in it, I have to deconstruct each rows
        #Fetchall had to be used because it is the only way to retrieve all the data from the query. https://www.geeksforgeeks.org/querying-data-from-a-database-using-fetchone-and-fetchall/
        #Fetchone only select the first row, so Looping through it is not an option either
        #data =json.load(rows) #This gave me a lot of errors
        print(4)
        json_dict = rows_to_dict(rows) #new dictionary made out of the result of fecthall
        print(5)
        cursor.close()
        print(6)
        return jsonify(json_dict) #jsonify(data)
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500


@display.route('/updateDashboard', methods=['POST'])
def update_dashboard() -> Any:
    db_config=current_app.config['db_config']
    data: Dict[str,str] = request.json
    product_id = data.get('product_id', '')
    quantity = data.get('quantity')
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        #cursor.execute("SELECT * from inventory WHERE product_id = %s", (product_id,))
        cursor.execute("UPDATE inventory SET quantity = %s WHERE product_id = %s", (quantity, product_id))
        product_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        if product_id_exists :
            return jsonify({'message': 'product found'}), 201
        else:
            return jsonify({'message':'Product not found'})
        
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'database error occure: {}'.format(error)})