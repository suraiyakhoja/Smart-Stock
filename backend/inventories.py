from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config
import re
inventories = Blueprint('inventories', __name__)


#################################### Inventory ROUTE - BOBBY ####################################
    
    #https://www.tutorialspoint.com/how-can-you-perform-inner-join-on-two-tables-using-mysql-in-python
    #https://www.geeksforgeeks.org/flask-app-routing/
@inventories.route('/inventory', methods=['GET'])
def inventory() -> Any:
    db_config = current_app.config['db_config']
    try:
        # function creates an address for the Inventory table from the database. 
        logging.info('Pulling Inventory request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve inventory data from the database
        #need product table for product name
        cursor.execute("""
            SELECT 
                product.product_id,
                product.product_name,
                inventory.inventory_id,
                inventory.quantity,
                inventory.price,
                inventory.minimum,
                inventory.maximum
            FROM 
                product
            JOIN 
                inventory ON product.product_id = inventory.product_id
        """)
        inventory_data = cursor.fetchall()

        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert inventory data to JSON format
        inventory_json = []
        for row in inventory_data:
            inventory_json.append({
                'product_id': row[0],
                'product_name': row[1],
                'inventory_id': row[2],
                'quantity': row[3],
                'price': row[4],
                'minimum': row[5],
                'maximum': row[6]
            })

        return jsonify({'inventory': inventory_json}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    

########3boobby creating a regex check for price######
    
#https://www.geeksforgeeks.org/us-currency-validation-using-regular-expressions/  
   # https://regex101.com/r/FPl92N/1
def is_valid_price(str):
    # Define the pattern to match "$X.XX" format
    regex = "^\\d+\\.\\d{2}$"
    # Compile the ReGex
    p = re.compile(regex)
 
    # If the string is empty
    # return false
    if (str == None):
        return False
 
    # Return if the string
    # matched the ReGex
    if(re.search(p, str)):
        return True
    else:
        return False
    
    #################################### Add Inventory ROUTE - BOBBY ####################################

#suggestion for change is in the inventory table it is 
#from current inventory_id, quantity, minimum, maximum, product_id 
    #to  inventory_id, product_id, quantity, minimum, maximum
#this is because no need to input inventory_id if provided product_id on input and itll auto add +1 to the previous inventory_id number

@inventories.route('/addInventory', methods=['POST'])
def add_inventory() -> Any:
    db_config = current_app.config['db_config']

    '''
    Add a new inventory to the database.
    reuturns a response with a status code of 201 if the inventory was added successfully, or 
    returns a response with a status code of 400 if the inventory was not added successfully.
    raises a response with a status code of 500 if the database connection failed.
    '''
    logging.info(' Creating Inventory request received')
    data: Dict[str,str]  = request.json
    quantity: str = data.get('quantity', '')
    price: str = data.get('price', '')
    minimum: str = data.get('minimum', '')
    maximum: str = data.get('maximum', '')
    product_id: str = data.get('product_id', '')
    '''
    Allows for retrieval of values of fields such as 'quantity', 'price' , 'minimum', 'maximum', 'product_id'
    '''
    # Check if all required fields are filled
    if quantity == '' or price == '' or minimum == '' or maximum == '' or product_id == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    #check if price is a valid number
    
    if is_valid_price(price) == False  or float(price) <= 0:
        # Price is a valid double number and it's non-negative
        return jsonify({'message': "Price must be a more than $0 and decimals in 2 places"}), 400
    # Check if minimum is a non-negative integer
    if not (minimum.isdigit() and int(minimum) >= 0):
        return jsonify({'message': "Minimum value must be a non-negative integer."}), 400
    # Check if minimum is less than maximum
    if not (minimum.isdigit() and maximum.isdigit() and int(minimum) < int(maximum)):
        return jsonify({'message': "Maximum value must be more than minimum value."}), 400
    try:
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        #check if product_id is in database 
        cursor.execute("SELECT EXISTS(SELECT * from inventory WHERE product_id = %s)", (product_id,))
        product_exists = cursor.fetchone()[0]
        
        #close connection
        cursor.close()
        conn.close()
        
        # If product_id exist that mean you cant add the same inventory for that product
        if product_exists:
            return jsonify({'message': 'Product already exists. Please use a different product id.'}), 400
        # Re-establish database connection to insert the new product
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        #create new row in database and insert new inventory
        cursor.execute("INSERT INTO inventory (quantity, price, minimum, maximum, product_id) VALUES (%s, %s, %s, %s, %s)", (quantity, price, minimum, maximum, product_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        logging.info('Inventory added successfully')
        
        return jsonify({'message': 'Inventory added successfully;)'}), 201
    except mysql.connector.Error as error:
        #There is a problem with the database connection with MySQL
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    

############################ Update Inventory Bobby #####################################
#changing data in inventory table to new amount/maximum/minimum
@inventories.route('/updateInventory', methods=['POST'])
def update_inventory() -> Any:
    db_config = current_app.config['db_config']
    data: Dict[str,str]  = request.json
    product_id = data.get('product_id', '')
    quantity = data.get('quantity')
    price = data.get('price')
    minimum = data.get('minimum')
    maximum = data.get('maximum')
     #Need to know which product inventory to update
    if product_id == '':
        print(1)
        return jsonify({'message': "Required Product Id."}), 400
    if quantity == '' and price == '' and minimum == '' and maximum == '':
        print(2)
        return jsonify({'message': "Need to fill what needs to be changed"}), 400
    
    try:
         # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        #sql command for slecting the product id from the database
        cursor.execute("SELECT * from inventory WHERE product_id = %s", (product_id,))
        product_id_exists = cursor.fetchone()[0]
        print(product_id_exists)
        cursor.close()
        conn.close()
        if not product_id_exists:
            print(3)
            return jsonify({'message': 'Product not found.'}), 404
        # Re-establish database connection update inventory
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Update the inventory based on the provided data
        if quantity:
            #updating quantity it must be 0 or more and a number should not be hard limited
            if quantity.isdigit() and int(quantity) >= 0:
                print(4)
                cursor.execute("UPDATE inventory SET quantity = %s WHERE product_id = %s", (quantity, product_id))
            else:
                print(5)
                return jsonify({'message': "Quantity needs to be 0 or greater"}), 400
 
        if price:
            if is_valid_price(price) == False  or float(price) <= 0:
                print(6)
                # Price is a valid double number and it's non-negative
                return jsonify({'message': "Price must be a more than $0 and decimals in 2 places"}), 400
            # Price is a valid double number and it's non-negative
            else:
                print(7)
                cursor.execute("UPDATE inventory SET price = %s WHERE product_id = %s", (price, product_id))

        if minimum:
            print(8)
        # Fetch the maximum value from the inventory table
            cursor.execute("SELECT maximum FROM inventory WHERE product_id = %s", (product_id,))
            maximum_ = cursor.fetchone()
            #logic for minimum vs maximum minimum must be more than 0 
            if int(minimum) < 0:
                print(9)
                return jsonify({'message': 'Provided minimum value must be 0 or more.'}), 400
            elif int(maximum_[0]) < int(minimum):
                print(10)
                #inputted minimum must be less than current maximum
                return jsonify({'message': 'Provided minimum value must be less than the existing maximum value.'}), 400
            else:
                print(11)
                cursor.execute("UPDATE inventory SET minimum = %s WHERE product_id = %s", (minimum, product_id))
        if maximum:
        # Fetch the maximum value from the inventory table
            cursor.execute("SELECT minimum FROM inventory WHERE product_id = %s", (product_id,))
            minimum_ = cursor.fetchone()
            print(12)
            #making sure inputted maximum is more than the existing minimum
            if int(maximum) > int(minimum_[0]) :
                print(13)
                cursor.execute("UPDATE inventory SET maximum = %s WHERE product_id = %s", (maximum, product_id))
            else:
                print(14)
                return jsonify({'message': 'Provided maximum value must be more than the existing minimum value.'}), 400
            


        conn.commit()
        cursor.close()
        conn.close()
        logging.info('Inventory added successfully')
        
        return jsonify({'message': 'Inventory added successfully;)'}), 201
    except mysql.connector.Error as error:
        print(15)
        #There is a problem with the database connection with MySQL
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500


###################################Delete Inventory Route Nick ########################################
# DeleteInventory API for delete function.
# A non-empty inventory ID is required.
# Then a SQL query will be executed to remove the inventory in the database.

@inventories.route('/deleteInventory', methods=['DELETE'])
def delete_inventory() -> Any:
    db_config=current_app.config['db_config']
    logging.info('Delete inventory request received')
    data: Dict[str,str]  = request.json
    inventory_id: str =data.get('inventory_id','')

    if inventory_id =='':
        return jsonify({'message': "Required boxes not filled."}), 400
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT EXISTS(SELECT * from inventory WHERE inventory_id = %s)", (inventory_id,))
        inventory_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        if not inventory_id_exists:
            return jsonify({'message': 'Inventory not found.'}), 404
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM inventory WHERE inventory_id = %s", (inventory_id,))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('inventory deleted successfully')
        return jsonify({'message': "inventory deleted successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
