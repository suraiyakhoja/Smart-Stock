from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config
import re
shipments = Blueprint('shipments', __name__)


###############################shipment route Bobby ##########################################
##orders from/to store with product and quantity
@shipments.route('/shipment', methods=['GET'])
def shipment() -> Any:
    db_config=current_app.config['db_config']
    try:
        # function creates an address for the shipment table from the database. 
        logging.info('Pulling shipment request received')
        # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Retrieve shipment data from the database
        cursor.execute("""
            SELECT 
                shipment.shipment_id,
                shipment.product_id,
                shipment.store_id,
                shipment.quantity,
                shipment.to_from,
                shipment.status,
                shipment.time,
                shipment.order_date,
                shipment.update_date,
                product.barcode,
                product.product_name,
                product.product_description,
                store.store_name,
                store.address
                
            FROM 
                shipment
            JOIN 
                product ON shipment.product_id = product.product_id
            JOIN
                store ON shipment.store_id = store.store_id
        """)
        shipment_data = cursor.fetchall()
#orderdate and update date
        # Close cursor and connection
        cursor.close()
        conn.close()

        # Convert shipment data to JSON format
        shipment_json = []
        for row in shipment_data:
            shipment_json.append({
                'shipment_id': row[0],
                'product_id': row[1],
                "store_id": row[2],
                'quantity': row[3],
                'to_from': row[4],
                'status' : row[5],
                'time' : row[6],
                'order_date': row[7],
                'update_date': row[8],
                'barcode': row[9],
                'product_name': row[10],
                'product_description': row[11], 
                'store_name': row[12],
                'address': row[13]
            })

        return jsonify({'shipment': shipment_json}), 200
    except mysql.connector.Error as error:
        # Handle database errors
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500

################################Add Shipment Bobby#################################################
@shipments.route('/addShipment', methods=['POST'])
def add_shipment() -> Any:
    db_config=current_app.config['db_config']
    logging.info('Creating Shipment request received')
    data: Dict[str,str]  = request.json
    product_id: str = data.get('product_id', '')
    store_id: str = data.get('store_id', '')
    quantity: str = data.get('quantity', '')
    to_from: str = data.get('to_from', '')
    status: str = data.get('status', '')
    time: str = data.get('time', '')
    order_date: str = data.get('order_date', '')
    
    if product_id == '' or store_id == '' or quantity == '' or to_from == '' or time == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    #status meaning order placed, order on hold, order shipped, order canceled
    # to means they are coming to us , from means from our inventory going to them
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("SELECT EXISTS(SELECT * from product WHERE product_id = %s)", (product_id,))
        product_exists = cursor.fetchone()[0]

        if not product_exists:
            return jsonify({'message': 'Product ID does not exist.'}), 400
        
        cursor.execute("SELECT EXISTS(SELECT * from store WHERE store_id = %s)", (store_id,))
        store_exists = cursor.fetchone()[0]

        if not store_exists:
            return jsonify({'message': 'Store ID does not exist.'}), 400
        
        # cant think of a logic to stop order
        # this is because it is possible to do a duplicate order and have it be valid
        #nothing stops us from buyng same pants at same store at same quantity because it could happen
        cursor.execute("INSERT INTO shipment (product_id, store_id, quantity, to_from, status, time, order_date) VALUES (%s, %s, %s, %s, %s, %s, %s)", (product_id, store_id, quantity, to_from, status, time, order_date))
        conn.commit()

        
        cursor.close()
        conn.close()
        logging.info('Shipment added successfully')
        
        return jsonify({'message': 'Shipment added successfully'}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occurred: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    


###################################Update Shipment Bobby############################################

@shipments.route('/updateShipment', methods=['POST'])
def update_shipment() -> Any:
    db_config=current_app.config['db_config']
    data: Dict[str,str]  = request.json
    shipment_id: str = data.get('shipment_id', '')
    product_id = data.get('product_id', '')
    store_id = data.get('store_id', '')
    quantity = data.get('quantity', '')
    to_from = data.get('to_from', '')
    status = data.get('status', '')
    time = data.get('time', '')
    update_date = data.get('update_date', '')
    
    if shipment_id == '':
        return jsonify({'message': "Required Shipment Id."}), 400
    if product_id == '' and store_id == '' and quantity == '' and to_from == '' and status == '' and time == '':
        return jsonify({'message': "Need to fill what needs to be changed."}), 400
    
    try:
         # Establish database connection
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        #sql command for slecting the shipment id from the database
        cursor.execute("SELECT * from shipment WHERE shipment_id = %s", (shipment_id,))
        shipment_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        if not shipment_id_exists:
            return jsonify({'message': 'Shipment not found.'}), 404
        # Re-establish database connection update shipment
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        if product_id:
            cursor.execute("SELECT * from product WHERE product_id = %s", (product_id,))
            product_id_exists = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            if not product_id_exists:
                return jsonify({'message': 'Product not found.'}), 404
            else:
                # Re-establish database connection update inventory
                conn = mysql.connector.connect(**db_config)
                cursor = conn.cursor()
                cursor.execute("UPDATE shipment SET product_id = %s, update_date = %s WHERE shipment_id = %s", (product_id, update_date, shipment_id))
            
        if store_id:
            cursor.execute("SELECT * from store WHERE store_id = %s", (store_id,))
            store_id_exists = cursor.fetchone()[0]
            cursor.close()
            conn.close()
            if not store_id_exists:
                return jsonify({'message': 'Store not found.'}), 404
            else:
                # Re-establish database connection update inventory
                conn = mysql.connector.connect(**db_config)
                cursor = conn.cursor()
                cursor.execute("UPDATE shipment SET store_id = %s, update_date = %s WHERE shipment_id = %s", (store_id, update_date, shipment_id))

        if quantity:
            #updating quantity it must be 0 or more and a number should not be hard limited
            if quantity.isdigit() and int(quantity) >= 0:
                cursor.execute("UPDATE shipment SET quantity = %s, update_date = %s WHERE shipment_id = %s", (quantity, update_date, shipment_id))
            else:
                return jsonify({'message': "Quantity needs to be 0 or greater"}), 400
            
        if to_from:
            cursor.execute("UPDATE shipment SET to_from = %s, update_date = %s WHERE shipment_id = %s", (to_from, update_date, shipment_id))

        if status:
            cursor.execute("UPDATE shipment SET status = %s, update_date = %s WHERE shipment_id = %s", (status, update_date, shipment_id))

        if time:
            if time.isdigit() and int(time) >= 0:
                cursor.execute("UPDATE shipment SET time = %s, update_date = %s WHERE shipment_id = %s", (time, update_date, shipment_id))
            else:
                return jsonify({'message': "Time needs to be 0 or greater"}), 400
        
        #if update_date: auto update with current time when updating shipment

        conn.commit()
        cursor.close()
        conn.close()
        logging.info('Shipment updated successfully')
        
        return jsonify({'message': 'Shipment updated successfully;)'}), 201
    except mysql.connector.Error as error:
        #There is a problem with the database connection with MySQL
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    

###################################Delete Shipment Bobby#############################################

@shipments.route('/deleteShipment', methods=['DELETE'])
def delete_Shipment() -> Any:
    db_config=current_app.config['db_config']
    
    logging.info('Delete Shipment request received')
    data: Dict[str,str]  = request.json
    shipment_id: str =data.get('shipment_id', '')

    if shipment_id == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT EXISTS(SELECT * from shipment WHERE shipment_id = %s)", (shipment_id,))
        shipment_id_exists = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        if not shipment_id_exists:
            return jsonify({'message': 'shipment not found.'}), 404
        # Re-establish database connection to delete the product
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
    
        cursor.execute("DELETE FROM shipment WHERE shipment_id = %s", (shipment_id,))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('shipment deleted successfully')
        return jsonify({'message': "shipment deleted successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500