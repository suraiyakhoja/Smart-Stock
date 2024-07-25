from typing import Dict

'''
    DATABASE CONNECTIONS, suraiya 
    Connect to the MySQL database by configuring login credentials and specifying which database to work with.
    For the web application we use main_db_config to store all inventory data. 
    For testing, we use test_db_config.
'''


main_db_config: Dict[str, str] = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Ch0colatecake!',
    'database': 'my_inventory'
}

test_db_config: Dict[str, str] = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Ch0colatecake!',
    'database': 'test_inventory'
}

config = {
    'db_config': main_db_config
}






