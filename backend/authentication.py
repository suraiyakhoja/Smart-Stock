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

'''
NOT USING THIS BLUEPRINT - suraiya 
'''

authentication = Blueprint('authentication', __name__)

#################################### LOGIN - suraiya ####################################
'''
LOGIN, suraiya 
Connecting to the database using a connector: 
https://dev.mysql.com/doc/connector-python/en/connector-python-example-connecting.html 
This route is called when the user is on the login page. The backend receives the username and password 
entered by the user before verifying that the user exists in the database and that the password matches
the one stored for that username. 
'''
@authentication.route('/login', methods = ['POST'])
def login() -> Any:
    db_config = current_app.config['db_config']
    print("ACCESSED LOGIN")
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

        # If the user was found in the database, retrieve the hashed password associated with the given username. Compare user provided
        # password with password in database. Return a message if successful or unsuccessful (with error message).
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
    
                

#################################### LOGOUT ROUTE - SURAIYA ####################################
'''
    Logging out route allows users to logout. If the user logs out, they will not be able to access the dashboard until they login. 
    If they try to access the dash, they are redirected to the login page. 
    Maybe uses sessions to do this (?), but mainly local storage. Sessions were being tricky. 
'''
@authentication.route("/logout", methods=['POST'])
def logout() -> Any:
    print("ACCESSED LOGOUT ROUTE")
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


#################################### REGISTRATION ROUTE - SURAIYA ####################################
'''
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
  

    #if len(pw) > 128:
    #    errors.append('Length should not be greater than 128 characters.')

    #if not any(char.isdigit() for char in pw):
    #    errors.append('Password should have at least one number.')

    #if not any(char.isupper() for char in pw):
    #    errors.append('Password should have at least one uppercase letter.')

    #if not any(char.islower() for char in pw):
    #    errors.append('Password should have at least one lowercase letter.')

    #if not any(char in special_symbols for char in pw):
    #    errors.append('Password should have at least one symbol.')



# Hash password for database: https://stackoverflow.com/questions/48761260/bcrypt-encoding-error
# After successful registration, this function takes the given password and hashes it. 
# it returns the hashed password to be stored in the database. 
def hash_password(password:str) -> str:
    #hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    #max_length = 45
    #hashed_password = hashed_password[:max_length]
    #return hashed_password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    return hashed_password

# https://saturncloud.io/blog/how-can-i-validate-an-email-address-using-a-regular-expression/
def validate_email(email):
    email_pattern = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
    return email_pattern.match(email) 

'''
    This route is called when the user is on the registration page. After the user enters the required data on the registration page, it
    is sent to the backend, where tests are done to make sure the account can be registered. 
'''
@authentication.route('/register', methods=['POST'])
def register() -> Any:
    db_config = current_app.config['db_config']

    # Store data from frontend in variables.
    logging.info('Registration request received')
    data: Dict[str,str]  = request.json
    first_name: str = data.get('firstName', '')
    last_name: str = data.get('lastName', '')
    email: str = data.get('email', '')
    username: str = data.get('username', '')
    password: str = data.get('password', '')
    confirm_password: str = data.get('confirmPassword', '')
    address: str = data.get('address', '')
    role: str = data.get('role', '')                    
    
    # Verify that all required boxes are filled by returning a message to be displayed if they are not. 
    if first_name == '' or last_name == '' or email == '' or username == '' or password == '' or confirm_password == '' or address == '' or role == '':
        return jsonify({'message': "Required boxes not filled."}), 400
    
    if not validate_email(email):
        return jsonify({'message': 'Please enter a valid email address.'}), 400

    



    try:
        # Connect to the database. 
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check if email is in database: https://www.tutorialspoint.com/best-way-to-test-if-a-row-exists-in-a-mysql-table#:~:text=To%20test%20whether%20a%20row,table%2C%20otherwise%20false%20is%20returned.
        # cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
        cursor.execute("SELECT EXISTS(SELECT * from user WHERE email = %s)", (email,))
        email_exists = cursor.fetchone()[0] 

        # Check if username is in database
        # cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
        cursor.execute("SELECT EXISTS(SELECT * from user WHERE username = %s)", (username,))
        username_exists = cursor.fetchone()[0]

        # Close connection with database. 
        cursor.close()
        conn.close()

        # Handle if email or username exists by returning a message to be displayed. 
        if email_exists:
            return jsonify({'message': 'Email already exists. Please use a different email.'}), 400

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
        cursor.execute("INSERT INTO user (first_name, last_name, email, username, password, address, role) VALUES (%s, %s, %s, %s, %s, %s, %s)", (first_name, last_name, email, username, hashed_password, address, role))
        conn.commit()

        # Close connection to database.
        cursor.close()
        conn.close()
        logging.info('User registered successfully')

        return jsonify({'message': 'User registered successfully;)'}), 201
    except mysql.connector.Error as error:
        logging.info('Database error occured: %s', error)
        return jsonify({'message': 'Database error occurred: {}'.format(error)}), 500





#################################### RESET PASSWORD - Suraiya  ####################################
#@app.route('/forgot_password;/', methods = ['POST'])
#def forgot_password():

@authentication.route('/account_recovery', methods = ['POST'])
def account_recovery():
    db_config = current_app.config['db_config']
    print("ACCESSED account recovery!")
    logging.info('account recovery request received')
    # Store data received by frontend in variables 
    data: Dict[str] = request.json
    email: str = data.get('email', '')
    print(email)

    if (email == ''):
        return jsonify({'message': 'Required boxes not filled.'}), 400

    try:
        print('IN TRY')
        #Connect to the database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        print('CONNECTION DONE')
        # Find and retrieve the email received by frontend in the database (user table)
        cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
        user_data = cursor.fetchone()

        if user_data:
            first_name = user_data.get('first_name', '')


            print("email exists")
            print(user_data)
            verification_code = generate_verification_code()
            print(verification_code)
            #email_for_recovery.verification_code = verification_code
            cursor.execute("INSERT INTO verification (email, verification_code) VALUES (%s, %s)", (email, verification_code))
            print('trying to execute')
            connection.commit()
            print('commiting')
            send_email(email, first_name, verification_code)
            print('after send email')

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
    
# https://www.geeksforgeeks.org/python-generate-random-string-of-given-length/
# https://stackoverflow.com/questions/2257441/random-string-generation-with-upper-case-letters-and-digits
def generate_verification_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

# https://www.mailjet.com
def send_email(email, first_name, verification_code):
    api_key = '5bdf5612d1640cc8e9a0237e66cb5f55'
    api_secret = '0bf5d60306e5ebfa29a5eb01519b998d'
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')

    data = {
    'Messages': [
                    {
                            "From": {
                                    "Email": "khoja.suraiya1@gmail.com",
                                    "Name": "samah"
                            },
                            "To": [
                                    {
                                            "Email": email,
                                            "Name": first_name
                                    }
                            ],
                            "Subject": "Password Reset Verification Code",
                            "TextPart": f"Your verification code is: {verification_code}"
                    }
            ]
    }
    result = mailjet.send.create(data=data)
    print (result.status_code)
    print (result.json())

@authentication.route('/verify_code', methods=['POST'])
def verify_code():
    print("in verify code")
    db_config = current_app.config['db_config']
    print(1)
    data: Dict[str, str] = request.json
    print(2)
    email_for_recovery = data.get('email', '')
    print(email_for_recovery)
    code_for_verification = data.get('verification_code', '')
    print(code_for_verification)

    if not email_for_recovery:
        print('not email for recovery')
        return jsonify({'message': 'Email not found'}), 400
    if not code_for_verification:
        print('not code for verification')
        return jsonify({'message': 'verification code not given'}), 400
    
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM verification WHERE email = %s", (email_for_recovery,))
        data_for_verification = cursor.fetchone()
        print(data_for_verification)

        if data_for_verification:
            db_verification_code = data_for_verification.get('verification_code', '')
            print(db_verification_code)
            if code_for_verification == db_verification_code:
                print('were good')
                return jsonify({'message': 'Verification successful'}), 200
            else: 
                print('were bad')
                return jsonify({'message:' 'Verification code is incorrect'}), 400
        else:
            print('no verification code')
            return jsonify({'message': 'no verification code for email'}), 404

    except mysql.connector.Error as error:
        print('database error')
        logging.info('Database error')
        return jsonify({'message': 'Database error occured: {}'.format(error)}), 500
    
@authentication.route('/reset_password', methods=['POST'])
def reset_password():
    db_config = current_app.config['db_config']

    # Store data from frontend in variables.
    logging.info('reset password request received')
    data: Dict[str,str]  = request.json
    email: str = data.get('emailForRecovery', '')
    password: str = data.get('password', '')
    confirm_password: str = data.get('confirmPassword', '')
    print(password)

    
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



#################################### EMAIL VALIDATION ROUTE (doesn't work yet) - SURAIYA ####################################
# This route is supposed to verify that an email provided by a user exists. It calls an API with the given email and retrieves 
# the json response. If the email was verified, it would return a message to be displayed on the screen. (It would do the same if 
# the email was not verified too.) Wasn't working though, and I was working on a limited number of free API requests. 
@authentication.route('/email_validation', methods=['POST'])
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

