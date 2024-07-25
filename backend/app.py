from flask import Flask, session
from flask_cors import CORS 
from typing import Dict, Any 
import logging
from flask_session import Session
from datetime import timedelta
#from authentication import authentication
from products import products
from config import config 
from config import main_db_config, test_db_config
from inventories import inventories
from categories import categories
from variants import variants
#from display import display
from dashboards import dashboards
from map import map
from filter import filter
from stores import stores
from shipments import shipments
from inventoryGraphs import inventoryGraphs
from lowstock import lowstock
from flask import Blueprint, request, jsonify, session, current_app
import mysql.connector
import bcrypt
from typing import List, Tuple, Dict, Any 
import logging
import random
import string
from mailjet_rest import Client
import requests
import re
import jwt
 
logging.basicConfig(level=logging.DEBUG)


'''
USE_TEST_DB = False
if USE_TEST_DB:
    db_config = test_db_config
else: 
    db_config = main_db_config
'''

app = Flask(__name__)
app.config.update(config)
db_config = app.config['db_config']
# Below two are for sessions, not working very well
app.config['SESSION_TYPE'] = 'filesystem'
app.secret_key = 'greengreengrass'
Session(app)
CORS(app)

# Configs for session
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
app.config['SESSION_COOKIE_SECURE'] = True  # Ensure cookie is only sent over HTTPS
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
#CORS(app, supports_credentials=True)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

global roles
roles ='Amin'; # added to implement roles

logging.info('Flask initialized')

# https://realpython.com/flask-blueprint/
#app.register_blueprint(authentication)
app.register_blueprint(products)
app.register_blueprint(inventories)
app.register_blueprint(categories)
app.register_blueprint(variants)
#app.register_blueprint(display)
#app.register_blueprint(dashboards)
app.register_blueprint(filter)
app.register_blueprint(stores)
app.register_blueprint(shipments)
app.register_blueprint(inventoryGraphs)
app.register_blueprint(lowstock)
app.register_blueprint(map)


'''
ISOLATED USER SCHEMAS, suraiya
Creates a database separate from the main database to populate with users inventory data. 
Each database is named after user. 
Calls function to create user tables within database. 
'''
def create_user_database(username: str) -> None:
    # Connect to MySQL server
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Generate database name using username
        user_db_name = f"{username}_database"

        # Create new database
        cursor.execute(f"CREATE DATABASE {user_db_name}")
        print(f"Created database: {user_db_name}")

        # Switch to user's database
        conn.database = user_db_name
        #conn = mysql.connector.connect(user_db_name)

        # Create user tables
        create_user_tables(user_db_name, username)

    except mysql.connector.Error as err:
        print(f"Error creating database: {err}")

    finally:
        # Close cursor and connection
        cursor.close()
        conn.close()

global user_db_config


'''
ISOLATED USER SCHEMAS, suraiya
Creates tables in user databases identical to main database. 
Each table is named after user. 
'''
def create_user_tables(user_db_name, user_name):
    try:
        # Connect to database
        user_db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': 'Ch0colatecake!',
            'database': user_db_name
        }
        conn = mysql.connector.connect(**user_db_config)
        cursor = conn.cursor()

        # Table names
        category_table = f'{user_name}_category'
        inventory_table = f'{user_name}_inventory'
        product= f'{user_name}_product'
        product_locations = f'{user_name}_product_locations'
        variant = f'{user_name}_variant'
        verification = f'{user_name}_verification'
        shipment = f'{user_name}_shipment'
        store = f'{user_name}_store'

        # Create tables 
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {category_table} (category_id INT AUTO_INCREMENT PRIMARY KEY, category_name VARCHAR(45), category_description VARCHAR(255))")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {inventory_table} (inventory_id INT AUTO_INCREMENT PRIMARY KEY, quantity INT, minimum INT)")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {product} (product_id INT AUTO_INCREMENT PRIMARY KEY, barcode VARCHAR(45), product_name VARCHAR(45), product_description VARCHAR(100), product_category INT, variant_id INT)")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {product_locations} (id INT AUTO_INCREMENT PRIMARY KEY, product_id INT, purchase_address VARCHAR(255), current_location VARCHAR(255), destination_location VARCHAR(255), order_number VARCHAR(10))")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {variant} (variant_id INT AUTO_INCREMENT PRIMARY KEY, variant_name VARCHAR(45), variant_value VARCHAR(45))")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {verification} (email VARCHAR(255), verification_code VARCHAR(8))")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {shipment} (shipment_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT, store_id INT, quantity INT, to_from VARCHAR(45), status VARCHAR(45), time VARCHAR(45), order_date DATETIME, update_data DATETIME)")
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {store} (store_id INT AUTO_INCREMENT PRIMARY KEY, store_name VARCHAR(45), address VARCHAR(45), city VARCHAR(45), zipcode VARCHAR(45))")

        # Commit and close 
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as error:
        logging.info('Database error')
        return jsonify({'message': 'Database error occured: {}'.format(error)}), 500


'''
GENERATE JWT TOKEN FOR SESSIONS, suraiya
'''
def generate_jwt_token(email, user_id):
    payload = {
        'email': email,
        'user_id': user_id
    }
    return jwt.encode(payload, 'greengreengrass', algorithm='HS256')

#################################### LOGIN - suraiya ####################################
'''
LOGIN, suraiya 
Connecting to the database using a connector: 
https://dev.mysql.com/doc/connector-python/en/connector-python-example-connecting.html 
This route is called when the user is on the login page. The backend receives the username and password 
entered by the user before verifying that the user exists in the database and that the password matches
the one stored for that username. 
'''
@app.route('/login', methods = ['POST'])
def login() -> Any:
    db_config = current_app.config['db_config']
    logging.info('Login request received')

    # Store data received by frontend in variables 
    data: Dict[str, str] = request.json
    username: str = data.get('username', '')
    password: str = data.get('password', '')

    if (username == '' or password == ''):
        return jsonify({'message': "Required boxes not filled."}), 400

    try:
        # Connect to the database 
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Find and retrieve the username received by frontend in the database (user table)
        cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
        user = cursor.fetchone()
        print('user')

        global roles
        roles = user.get('role') # ADDED TO IMPLEMENT ROLES

        # Close connection with the database 
        cursor.close()
        connection.close()

        # If the user was found in the database, retrieve the hashed password associated with the given username. 
        # Compare user provided password with password in database. Return a message if successful or unsuccessful 
        # (with error message).
        if user:
            hashed_pw = user.get('password')
            if hashed_pw:
                #logging.debug(f'Hashed Password from Database: {hashed_pw}')
                #logging.debug(f'Hashed Password Entered: {hash_password(password)}')
                if bcrypt.checkpw(password.encode('utf-8'), hashed_pw.encode('utf-8')): 
                    session['username'] = username
                    session_data = session.get('username')
                    session.modified = True
                    print("Session Data:", session_data)


                    logging.info('successful!')
                    '''
                    user_db_name = f"{username}_database"
                    global user_db_config  
                    
                    user_db_config = {
                        'host': main_db_config['host'],
                        'user': main_db_config['user'],
                        'password': main_db_config['password'],
                        'database': user_db_name
                    }
                    '''


                    return jsonify({'message': 'Login successful'},{'roles':roles}), 200 #added the second bracket for roles implementation JUSTIN
                else:
                    logging.info('Invalid password')
                    return jsonify({'message': 'Invalid password'}), 401
        else:
            logging.info('User not found')
            return jsonify({'message': 'User not found.'}), 404
    except mysql.connector.Error as error:
        logging.info('Database error')
        return jsonify({'message': 'Database error occured: {}'.format(error)}), 500
    
                

#################################### LOGOUT - suraiya ####################################
'''
LOGOUT, suraiya 
Logging out route allows users to logout. If the user logs out, they will not be able to access the 
dashboard until they login. 
If they try to access the dash, they are redirected to the login page. 
Session was supposed to be cleared but didn't work. 
'''
@app.route("/logout", methods=['POST'])
def logout() -> Any:
    #session.clear()
    try:
        session_data_before = session.get('username')
        print("Session Data Before Logout:", session_data_before)
        session.clear()
        session.modified = True
        session_data_after = session.get('username')
        print("Session Data After Logout:", session_data_after)

        response_data = {'message': 'Logout successful'}
        response = jsonify(response_data)
        response.delete_cookie('session', domain='localhost', secure=True, httponly=True)
        
        return response, 200
    except Exception as e:
        error_message = 'Logout failed: {}'.format(str(e))
        return jsonify({'error': error_message}), 500


#################################### REGISTRATION - suraiya ####################################
'''
PASSWORD CHECK, suraiya 
Password requirements: https://www.geeksforgeeks.org/password-validation-in-python/
                       https://stackoverflow.com/questions/98768/should-i-impose-a-maximum-length-on-passwords
Given a password, this functions verifies that it fills all the requirements for a secure password. 
It returns a string of all the requirements to be displayed to the user.
'''
def password_check(pw):
    special_symbols = ['~','!', '@', '#', '$', '%', '^', '&', '*', '(', ')']
    
    if len(pw) < 12 or len(pw) > 128 or \
        (not any(char.isdigit() for char in pw)) or \
            (not any(char.isupper() for char in pw)) or \
                (not any(char.isupper() for char in pw)) or \
                    (not any(char.islower() for char in pw)) or \
                        (not any(char in special_symbols for char in pw)):

        requirements = """This password does not meet the requirements.\n
        Please make sure your password contains the following:\n
            at least 12 characters,\n
            at least one number,\n
            at least one uppercase letter,\n
            at least one lowercase letter,\n
            and at least one special character.""" 
        return requirements
  

'''
HASH PASSWORD, suraiya 
Hash password for database: https://stackoverflow.com/questions/48761260/bcrypt-encoding-error
After successful registration, this function takes the given password and hashes it. 
it returns the hashed password to be stored in the database. 
'''
def hash_password(password:str) -> str:
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    return hashed_password

'''
VALIDATE EMAIL, suraiya
Regex for email check. 
https://saturncloud.io/blog/how-can-i-validate-an-email-address-using-a-regular-expression/
'''
def validate_email(email):
    email_pattern = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
    return email_pattern.match(email) 

'''
REGISTRATION PART 1, suraiya
This route is called when the user is on the registration page. After the user enters the required data 
on the registration page, it is sent to the backend, where tests are done to make sure the account can 
be registered. 
'''
@app.route('/register_pt1', methods=['POST'])
def register1() -> Any:
    db_config = current_app.config['db_config']

    # Store data from frontend in variables.
    logging.info('Registration request received')
    data: Dict[str,str]  = request.json
    first_name: str = data.get('firstName', '')
    last_name: str = data.get('lastName', '')
    email: str = data.get('email', '')
    session['email'] = email
                    
    
    # Verify that all required boxes are filled by returning a message to be displayed if they are not. 
    if first_name == '' or last_name == '' or email == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    if not validate_email(email):
        return jsonify({'message': 'Please enter a valid email address.'}), 400

    try:
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check if email is in database
        cursor.execute("SELECT EXISTS(SELECT * from user WHERE email = %s)", (email,))
        email_exists = cursor.fetchone()[0] 

        # Close connection with database. 
        cursor.close()
        conn.close()

        # Handle if email or username exists by returning a message to be displayed. 
        if email_exists:
            return jsonify({'message': 'Email already exists. Please use a different email.'}), 400
        
      
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Insert user given data into the database. 
        cursor.execute("INSERT INTO user (first_name, last_name, email) VALUES (%s, %s, %s)", (first_name, last_name, email))
        conn.commit()

        # Close connection to database.
        cursor.close()
        conn.close()
        logging.info('User registered pt1 successfully')

        return jsonify({'message': 'User registered pt1 successfully;)'}), 201
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500



'''
REGISTRATION PART 2, suraiya 
Second part of user registration, user chooses username and password.
Database is checked to make sure username is not taken and passwords match. 
Updates database with user login information.  
'''
@app.route('/register_pt2', methods=['POST'])
def register2() -> Any:
    db_config = current_app.config['db_config']

    # Store data from frontend in variables.
    logging.info('Registration pt2 request received')
    data: Dict[str,str]  = request.json
    username: str = data.get('username', '')
    password: str = data.get('password', '')
    confirm_password: str = data.get('confirmPassword', '')
    email: str = data.get('email', '')

    
    # Verify that all required boxes are filled by returning a message to be displayed if they are not. 
    if username == '' or password == '' or confirm_password == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check if username is in database
        # cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
        cursor.execute("SELECT EXISTS(SELECT * from user WHERE username = %s)", (username,))
        username_exists = cursor.fetchone()[0]

        # Close connection with database. 
        cursor.close()
        conn.close()

        # Handle if email or username exists by returning a message to be displayed. 
        if username_exists:
            return jsonify({'message': 'Username already exists. Please choose a different username.'}), 400
        
        # Call password_check function to verify password fills requirements. 
        password_requirements = password_check(password)

        # Handle if password does not fill requirements by returning a message to be displayed. 
        if password_requirements: 
            return jsonify({'message': password_requirements}), 400
        
        if password != confirm_password:
            return jsonify({'message': "Passwords do not match."}), 400
        
        # Hash password before entering into database for added security. 
        hashed_password: str = hash_password(password)

        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Insert user given data into the database. 
        #cursor.execute("INSERT INTO user (username, password) VALUES (%s, %s)", (username, hashed_password))
        cursor.execute("UPDATE user SET username = %s, password = %s WHERE email = %s", ( username, hashed_password, email))
        conn.commit()

        # Close connection to database.
        cursor.close()
        conn.close()
        create_user_database(username)
        logging.info('User registered pt2 successfully')

        return jsonify({'message': 'User registered pt2 successfully;)'}), 201
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    

'''
REGISTRATION PART 3, suraiya
Third part of user registration. 
User enters company, address, and role. 
Database is updated with new user information.
'''
@app.route('/register_pt3', methods=['POST'])
def register3() -> Any:
    db_config = current_app.config['db_config']

    # Store data from frontend in variables.
    logging.info('Registration request pt3 received')
    data: Dict[str,str]  = request.json
    company: str = data.get('company', '')
    address: str = data.get('address', '')
    role: str = data.get('role', '')       
    email = data.get('email', '')

    
    # Verify that all required boxes are filled by returning a message to be displayed if they are not. 
    if company == '' or address == '' or role == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    try:
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()


        # Insert user given data into the database. 
        # cursor.execute("INSERT INTO user (company, address, role) VALUES (%s, %s, %s)", (company, address, role))
        cursor.execute("UPDATE user SET company = %s, address = %s, role = %s WHERE email = %s", ( company, address, role, email))

        conn.commit()

         # Close connection to database.
        cursor.close()
        conn.close()
        logging.info('User registered pt3 successfully')

        return jsonify({'message': 'User registered pt3 successfully;)'}), 201
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500




#################################### RESET PASSWORD - suraiya  ####################################
'''
ACCOUNT RECOVERY, suraiya
Enters email, generates verification code to send to users email given at registration.
Calls function to send email. 
'''
@app.route('/account_recovery', methods = ['POST'])
def account_recovery():
    db_config = current_app.config['db_config']

    logging.info('account recovery request received')
    # Store data received by frontend in variables 
    data: Dict[str] = request.json
    email: str = data.get('email', '')

    if (email == ''):
        return jsonify({'message': 'Required boxes not filled.'}), 400

    try:
        # Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Find and retrieve the email received by frontend in the database (user table)
        cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
        user_data = cursor.fetchone()

        if user_data:
            first_name = user_data.get('first_name', '')

            verification_code = generate_verification_code()
            #email_for_recovery.verification_code = verification_code
            
            # Check if email is already in database (email was used for account recovery before)
            cursor.execute("SELECT * FROM verification WHERE email = %s", (email,))
            email_exists_check = cursor.fetchone()

            if not email_exists_check: # If the email does not exist in the verification table, insert the verification code
                cursor.execute("INSERT INTO verification (email, verification_code) VALUES (%s, %s)", (email, verification_code))
            else: # If the email is in the verification table, update verification code
                cursor.execute("UPDATE verification SET verification_code = %s WHERE email = %s", ( verification_code, email))

            connection.commit()
            send_email(email, first_name, verification_code)

            # Close connection with the database 
            cursor.close()
            connection.close()

            return jsonify({'message': 'Verification code sent!'}), 200

        else:
            logging.info('Email not found')
            return jsonify({'message': 'Email not found.'}), 404
    except mysql.connector.Error as error:
        logging.info('Database error')
        return jsonify({'message': 'Database error occured: {}'.format(error)}), 500
    

'''
GENERATE VERIFICATION CODE, suraiya 
Returns verification code to insert into database. 
https://www.geeksforgeeks.org/python-generate-random-string-of-given-length/
https://stackoverflow.com/questions/2257441/random-string-generation-with-upper-case-letters-and-digits
'''
def generate_verification_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


'''
SEND EMAIL, suraiya 
Makes API call to Mailjet to send email to user with verification code. 
https://www.mailjet.com
'''

def send_email(email, first_name, verification_code):
    api_key = '5bdf5612d1640cc8e9a0237e66cb5f55'
    api_secret = '0bf5d60306e5ebfa29a5eb01519b998d'
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')
    email_content = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 10px; padding: 20px;">
                <h2 style="color: #333;">Password Reset Verification Code</h2>
                <p style="color: #666;">Dear {},</p>
                <p style="color: #666;">Your verification code is: {}</p>
                <p style="color: #666;">If you did not request this verification code, please disregard this email.</p>
                <p style="color: #666;">Thank you,<br> Smart Stock</p>
            </div>
        </body>
        </html>
    """.format(first_name, verification_code)

    data = {
    'Messages': [
                    {
                            "From": {
                                    "Email": "khoja.suraiya1@gmail.com",
                                    "Name": "Smart Stock"
                            },
                            "To": [
                                    {
                                            "Email": email,
                                            "Name": first_name
                                    }
                            ],
                            "Subject": "Password Reset Verification Code",
                            #"TextPart": f"Your verification code is: {verification_code}"
                            "HTMLPart": email_content

                    }
            ]
    }
    result = mailjet.send.create(data=data)
    print (result.status_code)
    print (result.json())


''' 
VERIFY CODE, suraiya
After user enters verification code they received, it is checked with code in database.
If it matches, user can create new password. 
'''
@app.route('/verify_code', methods=['POST'])
def verify_code():
    db_config = current_app.config['db_config']
    data: Dict[str, str] = request.json
    email_for_recovery = data.get('email', '')
    code_for_verification = data.get('code', '')
    print("Verification code is " + code_for_verification)
    print("Email  is " + email_for_recovery)


    # Email address user enters 
    if not email_for_recovery:
        return jsonify({'message': 'Email not found'}), 400
    if not code_for_verification:
        return jsonify({'message': 'Enter verification code'}), 400
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Retrieve data from verification table
        cursor.execute("SELECT * FROM verification WHERE email = %s", (email_for_recovery,))
        data_for_verification = cursor.fetchone()

        # Get verification code from table 
        if data_for_verification:
            db_verification_code = data_for_verification.get('verification_code', '')
            print(db_verification_code)
            if code_for_verification == db_verification_code:
                return jsonify({'message': 'Verification successful'}), 200
            else: 
                return jsonify({'message:' 'Verification code is incorrect'}), 400
        else:
            return jsonify({'message': 'No verification code for email'}), 404

    except mysql.connector.Error as error:
        print('database error')
        logging.info('Database error')
        return jsonify({'message': 'Database error occured: {}'.format(error)}), 500
    

''' 
RESET PASSWORD, suraiya 
User enters new password and database is updated with hashed password. 
'''
@app.route('/reset_password', methods=['POST'])
def reset_password():
    db_config = current_app.config['db_config']

    # Store data from frontend in variables.
    logging.info('reset password request received')
    data: Dict[str,str]  = request.json
    email: str = data.get('email', '')
    password: str = data.get('password', '')
    confirm_password: str = data.get('confirmPassword', '')
    
    # Verify that all required boxes are filled by returning a message to be displayed if they are not. 
    if  password == '' or confirm_password == '':
        return jsonify({'message': "Required boxes not filled."}), 400


    try:
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Call password_check function to verify password fills requirements. 
        password_requirements = password_check(password)

        # Handle if password does not fill requirements by returning a message to be displayed. 
        if password_requirements: 
            return jsonify({'message': password_requirements}), 400
        
        if password != confirm_password:
            return jsonify({'message': "Passwords do not match."}), 400
        
        # Hash password before entering into database for added security. 
        hashed_password: str = hash_password(password)
      
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Update data in database
        # https://pynative.com/python-mysql-update-data/
        cursor.execute("UPDATE user SET password = %s WHERE email = %s", ( hashed_password, email))
        conn.commit()

        # Close connection to database.
        cursor.close()
        conn.close()
        logging.info('Password changed successfully')

        return jsonify({'message': 'Password changed successfully;)'}), 200
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500



#################################### EMAIL VALIDATION ROUTE (doesn't work) - suraiya  ####################################
'''
EMAIL VALIDATION, suraiya 
This route is supposed to verify that an email provided by a user exists. It calls an API with the given email and retrieves 
the json response. If the email was verified, it would return a message to be displayed on the screen. (It would do the same if 
the email was not verified too.) Didn't work, and there was limited number of API requests.  
'''
@app.route('/email_validation', methods=['POST'])
def email_validation():
    try:
        data = request.get_json()
        email = data.get('email')
        
        url = "https://emailvalidation.abstractapi.com/v1"

        api_key = "675fcddde3194e629aea69c821b98465"

        querystring = {"api_key": "675fcddde3194e629aea69c821b98465", "email": email, "auto-correct": "true" }

        #print (response.text)
        response = requests.request("GET", url, params=querystring)
        result = response.json()
        #return result
        print (response.text)

        if response.ok:
            return jsonify({'message': 'Email validated.', 'result': result}), 200
        else:
            return jsonify({'message': 'Email not validated.'}), 500

    # except requests.RequestException as e
    except Exception as e:
        return jsonify({'error': str(e.response.data)}), 500   


#################################### DASHBOARD ROUTE - JUSTIN ####################################
def rows_to_dict(rows):
    json_dict = []
    for row in rows:
        # Convert each row tuple to a dictionary
        row_dict = {
            'id': row[0],
            'product_name': row[1],
            'product_desc': row[2],
            'quantity': row[3],
            'roles':roles,
            'product_id':row[4],
        }
        json_dict.append(row_dict)
    return json_dict


@app.route("/dashboard", methods=['GET'])
def dashboard() -> Any:
    # TRYING SESSION BUT ISN'T WORKING. -SURAIYA 
    #if 'username' not in session:
    #    return redirect(url_for('login'))        
    #user_db_config = current_app.config['user_db_config']
    #global user_db_config

    try :
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        

        cursor.execute("SELECT inventory_id, product_name, product_description, quantity, inventory.product_id FROM inventory JOIN product ON inventory.product_id = product.product_id")
        rows = cursor.fetchall() #This rows variable has all the rows in it, I have to deconstruct each rows
        #Fetchall had to be used because it is the only way to retrieve all the data from the query. https://www.geeksforgeeks.org/querying-data-from-a-database-using-fetchone-and-fetchall/
        #Fetchone only select the first row, so Looping through it is not an option either
        #data =json.load(rows) #This gave me a lot of errors

        json_dict = rows_to_dict(rows) #new dictionary made out of the result of fecthall

        cursor.close()
        conn.close()
        return jsonify(json_dict) #jsonify(data)
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500
    



        

@app.route("/")
def home() -> str:
    return "Hello Flask! this means server is up and running\nDatabase: my_inventory"

# Suraiya 
# Disable caching: https://stackoverflow.com/questions/34066804/disabling-caching-in-flask
# Trying it out for sessions
@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'

    return r

if __name__ == '__main__':
    app.run(debug=True)
