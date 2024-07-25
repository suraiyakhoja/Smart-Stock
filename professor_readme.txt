Bobby Ng
Step 1: create smartstock/mvp main folder

creating database
I assume you have at least mysql downloads and a localhost profile created
host is localhost or your log in credentials and user is root or your log in credentials

Step 2: pull tes2.sql and updated_db2.sql into the main folder
Step 3: open mysql workbench and open local instance on mysql connections
Step 4: click server on top left and click data import
Step 5: click the second import from self-contained file option 
Step 6: in the right is 3 dots to open your folder navigate to the smartstock/mvp main folder
Step 7: pick a sql file and press open
Step 8: in default schema to be imported to  new.. button and type in the name of the database
(test2.sql -> stock6,updated_db2.sql -> my_inventory) 
the Default Target Schema should auto update to the name of the inputted database
if not can pick it through the drop down menu
Step 9: depending on your screen you can scroll down and press start import button
or right below the the down arrow icon on top of a flat circle you can see the import progress tab click on it and you can start import from there
Step 10: repeat step 4-9 to import the other sql file since there are 2


backend folder
Step 11: create a backend folder and pull the backend folder with all the files from the main branch
Step 12: open the terminal and create two terminals
Step 13: in terminal 1 cd backend
Step 14: terminal 1 pip install virtualenv
Step 15: terminal 1 virtualenv venv
Step 16: terminal 1 virtualenv venv
Step 17: terminal 1 venv\Scripts\activate 
(for when scripts are not allowed to be run
Set-ExecutionPolicy Unrestricted -Scope Process "press enter" then venv\Scripts\activate  again)
Step 18: terminal 1 pip install flask 
pip install flask_cors
pip install bcrypt
pip install mysql-connector-python
pip install requests
Step 19: terminal 1 set FLASK_APP=app
Step 20: in the config.py file change the file so you can log in to your mysql
Step 21: flask run
(if the terminal eventually says something about python.exe path not found or something 
python -m flask run )
i encounter this because i switch from working back and forth on my pc and laptop so the
venv pathways get confused 

if you ever closed your terminal / vsc always create 2 terminals and in terminal 1
cd backend
venv\Scripts\activate 
flask run

Step 22: control click the link and it should open http://127.0.0.1:5000/ in your browser
or copy the address and paste it there instead
if it works you should see 
Hello Flask! this means server is up and running Database: my_inventorry

frontend (do not create a frontend folder)

step 23: in terminal 2 it should still be in your main folder/directory
npx create-react-app frontend  --template typescript
(if the terminal says no npm folder or something do
npm install npm -g
npx create-react-app frontend  --template typescript
again)

step 24: pull all the files from the frontend folder into the new frontend folder
step 25: in terminal 2 npm install react-router-dom
Step 26: terminal 2 npm run start

using the app
Step 27: register your account making sure you follow the requirements
Step 28: log in 
Step 29: mess around with database through creating and deleting objects in the database

some things to keep in mind 
you can create as many user accounts as you want
variants and categories can be created as much as you want
however when deleting variants or categories if there is a product that exists in the database 
with that specific variant/category id you cannot delete that variant or category

for inventory you can only create an inventory using product_id that exists in the database
but you can delete inventory freely
future implementation would allow us to manipulate the rows in inventory directly such as amount/minmum/maximum 
this would be different from the add/delete inventory function

for products you can only create a product with variant/category ids that exist in the Database
(meaning if you create variant shape/circle and it is variant_id = 3 then you can use vairant_id =3 for a new product)
can only delete a product if there is no inventory of that item (not amount=0, i mean completely not a row exist with that specific product_id)

the dashboard button in every function page will return user back the the dashboard page

technically the log out button do return user back to homepage/log in page
the main function is to delete all system data which is a work in progress



new changes 
pip install flask_login
pip install flask_session
pip install config
pip install Flask-Caching

npm install chart.js @types/chart.js
npm audit fix
//npm install react-chartjs-2


npm mean frontend
pip mean backend
npm install recharts
npm install react-to-print
npm install react-bootstrap-icons
npm install reactstrap
npm install react-bootstrap   
npm install bootstrap
npm install @tomtom-international/web-sdk-maps
pip install pyjwt
pip install pytest




To run test cases: 
cd backend
cd tests
pytest 

The test_successful cases fail because they were already added to the database (registration/adding/deleting). Testing files 
would need to be changed to new information for these tests to pass. 
test_email_not_found, test_incorrect_code, and the test_filter pages don't work. 