from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config
import re
inventoryGraphs = Blueprint('inventoryGraphs', __name__)


################################# Inventory graph Bobby #####################################
@inventoryGraphs.route('/inventoryGraph', methods=['GET'])
def inventory_graph() -> Any:
    db_config = current_app.config['db_config']
    try:
        granularity = request.args.get('granularity', None)  #granularity query parameter
        selectedMonth = request.args.get('selectedMonth', None)
        logging.info('Pulling Inventory graph request received with granularity: %s', granularity)
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        if granularity == 'day':
            cursor.execute("""
                SELECT
                    inventory_graph.graph_id,
                    inventory_graph.product_id,
                    inventory_graph.quantity,
                    inventory_graph.time,
                    product.product_name
                FROM
                    inventory_graph
                JOIN
                    product ON inventory_graph.product_id = product.product_id
                WHERE
                    DATE(inventory_graph.time) = CURDATE()
            """)
        elif granularity == 'week':
            cursor.execute("""
                SELECT
                    inventory_graph.graph_id,
                    inventory_graph.product_id,
                    inventory_graph.quantity,
                    inventory_graph.time,
                    product.product_name
                FROM
                    inventory_graph
                JOIN
                    product ON inventory_graph.product_id = product.product_id
                WHERE
                    YEARWEEK(inventory_graph.time, 1) = YEARWEEK(CURDATE(), 1) 
            """)
        elif granularity == 'month':
            if selectedMonth is not None:
                cursor.execute("""
                    SELECT
                        inventory_graph.graph_id,
                        inventory_graph.product_id,
                        inventory_graph.quantity,
                        inventory_graph.time,
                        product.product_name
                    FROM
                        inventory_graph
                    JOIN
                        product ON inventory_graph.product_id = product.product_id
                    WHERE
                        YEAR(inventory_graph.time) = YEAR(CURDATE())
                        AND MONTH(inventory_graph.time) = %s
                    """, (selectedMonth,))
            else:
                cursor.execute("""
                    SELECT
                        inventory_graph.graph_id,
                        inventory_graph.product_id,
                        inventory_graph.quantity,
                        inventory_graph.time,
                        product.product_name
                    FROM
                        inventory_graph
                    JOIN
                        product ON inventory_graph.product_id = product.product_id
                    WHERE
                        YEAR(inventory_graph.time) = YEAR(CURDATE())
                        AND MONTH(inventory_graph.time) = MONTH(CURDATE())
                """)
        elif granularity == 'year':
            cursor.execute("""
                SELECT
                    inventory_graph.graph_id,
                    inventory_graph.product_id,
                    inventory_graph.quantity,
                    inventory_graph.time,
                    product.product_name
                FROM
                    inventory_graph
                JOIN
                    product ON inventory_graph.product_id = product.product_id
                WHERE
                    YEAR(inventory_graph.time) = YEAR(CURDATE())
            """)
        else:
            # Default to all data
            cursor.execute("""
                SELECT
                    inventory_graph.graph_id,
                    inventory_graph.product_id,
                    inventory_graph.quantity,
                    inventory_graph.time,
                    product.product_name
                FROM
                    inventory_graph
                JOIN
                    product ON inventory_graph.product_id = product.product_id
        
            """)


        graph_data = cursor.fetchall()
        cursor.execute("SELECT product_id, product_name FROM product")
        products = [{'product_id': row[0], 'product_name': row[1]} for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        graph_json = []
        for row in graph_data:
            graph_json.append({
                'graph_id': row[0],
                'product_id': row[1],
                'quantity': row[2],
                'time': row[3],
                'product_name': row[4]
            })
        return jsonify({'inventory_graph': graph_json, 'products': products}), 200
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500

################################# add inventory graph Bobby #####################################
@inventoryGraphs.route('/addInventoryGraph', methods=['POST'])
def add_inventorygraph() -> Any:
    db_config = current_app.config['db_config']
    data: Dict[str,str]  = request.json
    product_id: str = data.get('product_id', '')
    quantity = data.get('quantity', '')
    time = data.get('time', '')
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO inventory_graph (product_id, quantity, time) VALUES (%s, %s, %s)", (product_id, quantity, time))
        conn.commit()
        cursor.close()
        conn.close()
        logging.info('Inventory grpah added successfully')
        return jsonify({'message': "Inventory grpah added successfully"}), 201
    except mysql.connector.Error as error:
        logging.error('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500