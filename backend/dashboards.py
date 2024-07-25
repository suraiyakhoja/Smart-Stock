from flask import Blueprint, request, jsonify, session, current_app
import mysql.connector
from typing import List, Tuple, Dict, Any 
import logging
#from app import db_config

dashboards = Blueprint('dashboards', __name__)

'''
NOT USING THIS BLUEPRINT - suraiya
'''
#################################### DASHBOARD  ####################################
'''
    The dashboard is the main page of the product. It displays inventory information and gives users options to interact with the 
    inventory. 
'''
@dashboards.route('/dashboard', methods=['GET'])
#@login_required
def dash() -> Any:
    print("IN THE DASH")
    session_data = session.get('username') 
    session.modified = True
    print("Session Data:", session_data)



  
