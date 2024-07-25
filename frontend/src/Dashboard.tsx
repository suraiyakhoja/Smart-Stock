
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inventory } from "./components/inventory";
import ShowLowStock from "./components/showLowStock";
import "./Dashboard.css";
import { Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Container, Typography, MenuItem, Button } from '@mui/material';



// JUSTIN
// Creating an iterface to be able to handle the rows from the table efficiently as an object
interface InventoryItem {
  id: number;
  productName: string;
  productDescription: number;
  quantity: number;
  role: string;
  productId: number;
  //productId: number;
}

interface Order {
  orderType: string;
  orderId: number;
  time: any;
  itemName: string;
  quantity: number;
  orderNumber: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [permission, setPermission] = useState<string>(""); //For Roles
  const [inventoryItems, setinventoryItems] = useState<InventoryItem[]>([]);
  //const [quantity, setQuantity] = useState<number>(1);

  /*
    NAVIGATION BAR, suraiya 
    https://mui.com/material-ui/react-app-bar/
    The functions below control the navigation bar at the top of the screen. 
    It handles the opening/closing of buttons and menus. Some of these functions 
    are specific to menu items (products, categories, inventory, variants, etc.)
    to allow users to choose between different options within them. 
  */
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const [anchorElProductMenu, setAnchorElProductMenu] = useState<null | HTMLElement>(null);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const handleOpenProductMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProductMenu(event.currentTarget);
  };
  const handleCloseProductMenu = () => {
    setAnchorElProductMenu(null);
  };

  const [anchorElCategoryMenu, setAnchorElCategoryMenu] = useState<null | HTMLElement>(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const handleOpenCategoryMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCategoryMenu(event.currentTarget);
  };
  const handleCloseCategoryMenu = () => {
    setAnchorElCategoryMenu(null);
  }

  const [anchorElInventoryMenu, setAnchorElInventoryMenu] = useState<null | HTMLElement>(null);
  const [isInventoryMenuOpen, setIsInventoryMenuOpen] = useState(false);
  const handleOpenInventoryMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElInventoryMenu(event.currentTarget);
  };
  const handleCloseInventoryMenu = () => {
    setAnchorElInventoryMenu(null);
  }

  const [anchorElVariantMenu, setAnchorElVariantMenu] = useState<null | HTMLElement>(null);
  const [isVariantMenuOpen, setIsVariantMenuOpen] = useState(false);
  const handleOpenVariantMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElVariantMenu(event.currentTarget);
  };
  const handleCloseVariantMenu = () => {
    setAnchorElVariantMenu(null);
  }

  const [anchorElStoreMenu, setAnchorElStoreMenu] = useState<null | HTMLElement>(null);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const handleOpenStoreMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElStoreMenu(event.currentTarget);
  };
  const handleCloseStoreMenu = () => {
    setAnchorElStoreMenu(null);
  }

  const [anchorElShipmentMenu, setAnchorElShipmentMenu] = useState<null | HTMLElement>(null);
  const [isShipmentMenuOpen, setIsShipmentMenuOpen] = useState(false);
  const handleOpenShipmentMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElShipmentMenu(event.currentTarget);
  };
  const handleCloseShipmentMenu = () => {
    setAnchorElShipmentMenu(null);
  }

   /*
   ADDRESSES, suraiya
   Hardcoded locations to buy/sell from. 
   */
   const [purchaseAddresses, setPurchaseAddresses] = useState([
    "230 Vesey St, New York, NY 10281",
    "1050 2nd Ave, New York, NY 10022",
    "828 Broadway, New York, NY 10003"
  ]);

  /*
  ADDRESSES, suraiya
  selectedPurchaseAddress is address user selects to buy/sell from. 
  */
  const [selectedPurchaseAddress, setSelectedPurchaseAddress] = useState('');

  /*
  LOGIN/LOGOUT, suraiya
  Checks localStorage to see if user is logged in. If user is not logged in, redirects to 
  login page. 
  */
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login page if not logged in
    }
  }, [navigate]);

  

  /*
    LOGOUT, suraiya 
    Logout is supposed to logout and user should not be able to access the dashboard
    before logging in again, but it's not working very well. (I don't think I'm creating 
    a cookie. Have to look into it.)
    Logout redirects user to login page. It was supposed to clear the users session 
    with jwt tokens but that didn't work. 
    https://stackoverflow.com/questions/32640090/python-flask-keeping-track-of-user-sessions-how-to-get-session-cookie-id
  */
  const handleLogout = async () => {
    try {
      // Backend request to logout 
      const response = await fetch("http://127.0.0.1:5000/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Clears local storage and navigates to login page. 
      if (response.ok) {
        //localStorage.clear();
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem('username');
        navigate("/login");
      } else {
        const errorMessage = await response.json();
        setError(errorMessage.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //The following is to try to add to inventory table when we submit the order
  const [error1, setError1] = useState<string>("");
  const [price, setPrice] = useState<number>(9.99);
  const [minimum, setMinimum] = useState<number>(100);
  const [maximum, setMaximum] = useState<number>(10000);
  const [orderQuantity, setOrderQuantity] = useState<number>(0);
  const [product_name, setProduct_name] = useState<string>("");
  const [orderID, setOrderID] = useState<number>(1);
  const [orderNumber, setOrderNumber] = useState<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  //const [product_id, setProduct_id] = useState<number>();

  //Testing Graph
  const [data, setData] = useState<any>([]);


  //Implementing the UpdateInventory version
  const [product_id, setProduct_id] = useState<string>("1");
  const [newProductName, setNewProductName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  useEffect(() => {
    dashboardData();
  }, []); //This empty array is so that it only first this function once on the initial render and avoid an infinity loop

  //New Implementation of Dashboard
  const dashboardData = async () => {
    try {
      const username = localStorage.getItem("username");
      const response = await fetch("http://127.0.0.1:5000/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory data");
      }
      const data = await response.json();

      //Parsing through the json containing all the rows and making an object out of each of those rows
      const mappedInventory: InventoryItem[] = data.map((eachData: any) => {
        const item = {
          id: eachData.id,
          productName: eachData.product_name,
          productDescription: eachData.product_desc,
          quantity: eachData.quantity,
          roles: eachData.roles,
          productId: eachData.product_id,
        };
        return item;
      });
      //console.log("Inventory Data:", data); // Log fetched data
      console.log("Mapped inventory data: ", mappedInventory);
      setPermission(data[0].roles); //setting the permission from any of the row would do
      setinventoryItems(mappedInventory);
      //setQuantity(data.map((inv: { quantity: any }) => inv.quantity));
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };
  // JUSTIN


  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ NEW NEW NEW NEW NEW NEW NEW NEW NEW NEW NEW ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // New Area to try to implement the Order Features

  /*      ------submit the changes to the database */
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      //logging inputs to console
      console.log("Quantity: ", quantity);
      console.log("Product Id: ", product_id);
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateInventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
          product_id,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError1(errorMessage.message);
      } else {
        //await fetchInventory(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };

  /*       ----------------------                   END SUBMISSION       ------------------*/

  //Given a product Name and Assuming it exists, the following function should be able to return its index
  const retreiveProduct = (name: string) => {
    //Trying out a new way to retreive the index of the product
    const secondIndex = inventoryItems.findIndex(
      (obj) => obj.productName === name
    );
    console.log("using the second method the index retreived is ", secondIndex);
    return secondIndex;
  };

  //JUSTIN
  //Given a product name the following function should return the product ID from the inventory table
  const findId = (pname: string) => {
    return inventoryItems[retreiveProduct(newProductName)].productId;
  };

// This is the intial Buy feature That I had to settled with using the product ID to accomplish the task
const handleBuy = async () => {
  if (+quantity <= 0) {
    //handle 0 or negative quantity
    alert("Quantity can NOT be less or equal to 0");
  } else {
    //lets try to make sure we find the actual product
    const location: number = inventoryItems.findIndex(
      (item) => item.productId === +product_id
    );

    //console.log(`Item is located at ${location}`);
    const actualQuantity = inventoryItems[location].quantity + +quantity;
    //console.log(`the new number is ${inventoryItems[location].quantity} + ${quantity} and is equal to ${actualQuantity}`);
    setQuantity(String(actualQuantity));
    //console.log("product ID from product name input is ", findId(product_name));

    try {
      //logging inputs to console
      console.log("Quantity: ", quantity);
      console.log("Product Id: ", product_id);
      //making sure inputs are not empty
      if (product_id === "" || quantity === "") {
        setError1("Product Id and quantity needed.");
        return;
      }
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateInventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actualQuantity,
          product_id,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError1(errorMessage.message);
      } else {
        await dashboardData(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
    setQuantity("");
  }
};


 //Handle the sell feature but it uses the product ID to accomplish
  //the task which is not the best for our user experience
  const handleSell = async () => {
    if (+quantity <= 0) {
      //handle 0 or negative quantity
      alert("Quantity can NOT be less or equal to 0");
    } else {
      const location: number = inventoryItems.findIndex(
        (item) => item.productId === +product_id
      );

      console.log(`Item is located at ${location}`);
      const actualQuantity = inventoryItems[location].quantity - +quantity;
      console.log(
        `the new number is ${inventoryItems[location].quantity} - ${quantity} and is equal to ${actualQuantity}`
      );
      setQuantity(String(actualQuantity));
      try {
        //logging inputs to console
        console.log("Quantity: ", quantity);
        console.log("Product Id: ", product_id);
        //making sure inputs are not empty
        if (product_id === "" || quantity === "") {
          setError1("Product Id and quantity needed.");
          return;
        }
        //sending form data to backend server
        const response = await fetch("http://127.0.0.1:5000/updateInventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actualQuantity,
            product_id,
          }),
        });
        //handling server response
        if (!response.ok) {
          const errorMessage = await response.json();
          //set error message if server response is not ok
          setError1(errorMessage.message);
        } else {
          await dashboardData(); // Refresh inventory data
        }
      } catch (error) {
        //logging error to console
        console.error("Error:", error);
      }
      setQuantity("");
    }
  };

  // This is for the new sell feature. The only issue is that it seems to have a
  //problem on the first try but then the folling tries work fine

  const handleNewSell = async () => {
    if (+quantity <= 0) {
      //handle 0 or negative quantity
      alert("Quantity can NOT be less or equal to 0");
    } else {
      const newProduct_id = findId(newProductName);
      const location: number = inventoryItems.findIndex(
        (item) => item.productId === newProduct_id
      );
      setProduct_id(String(newProduct_id));
      const actualQuantity = inventoryItems[location].quantity - +quantity;
      setQuantity(String(actualQuantity));
      try {
        //logging inputs to console
        console.log("Quantity: ", quantity);
        console.log("actual quantity: ", actualQuantity);
        console.log("Product Id: ", newProduct_id);
        //making sure inputs are not empty
        if (product_id === "" || quantity === "") {
          setError1("Product Id and quantity needed.");
          return;
        }
        //sending form data to backend server
        const response = await fetch("http://127.0.0.1:5000/updateInventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actualQuantity,
            product_id,
          }),
        });
        //handling server response
        if (!response.ok) {
          const errorMessage = await response.json();
          //set error message if server response is not ok
          setError1(errorMessage.message);
        } else {
          await dashboardData(); // Refresh inventory data
        }

        /*
          TRACKING SELL, suraiya
          Request to sell_product endpoint, where the sell is logged in the database. 
          Order number is generated and sent to database.
        */
        const newOrderNumber = generateOrderNumber();
        setOrderNumber(newOrderNumber);
        // Request to backend to update database with locations 
        const sellResponse = await fetch("http://127.0.0.1:5000/sell_product", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              product_id: findId(newProductName),
              quantity: quantity,
              purchase_address: selectedPurchaseAddress,
              user: localStorage.getItem('username'),
              order_number: newOrderNumber
          })
      });
      
      if (!sellResponse.ok) {
          throw new Error('Failed to log sell.');
      }

      await dashboardData();

      } catch (error) {
        //logging error to console
        console.error("Error:", error);
      }
      setQuantity("");
      //adding to order log
      const orderObject = {
        orderType: "Sell",
        orderId: orderID,
        time: Date(),
        itemName: newProductName,
        quantity: +quantity,
        orderNumber: orderNumber
      };
      setOrders(orders.concat(orderObject));
      setOrderID(orderID + 1);
      //Testing Graph
      if (data.some((e: { name: string }) => e.name === newProductName)) {
        const i = data.findIndex(
          (e: { name: string }) => e.name === newProductName
        );
        const newData = [...data];
        newData[i].sold = data[i].sold + +quantity;
        console.log("New Data is ", newData);
        console.log("Old Data is ", data);
      } else {
        //Testing Graph
        const dataObject = {
          id: data.length + 1,
          name: newProductName,
          sold: +quantity,
          bought: 0,
        };
        setData(data.concat(dataObject));
      }

    }
    
  };

   //This handle the new Buy feature by using the product name rather than the product ID.
  // However there is a problem with it on the first Try
  const handleNewBuy = async () => {
    if (+quantity <= 0) {
      //handle 0 or negative quantity
      alert("Quantity can NOT be less or equal to 0");
    } else if (!selectedPurchaseAddress){
        alert("Please select an address.");
        
    } else {
        const newProduct_id = findId(newProductName);
        const location: number = inventoryItems.findIndex(
          (item) => item.productId === newProduct_id
        );
        setProduct_id(String(newProduct_id));
        const actualQuantity = inventoryItems[location].quantity + +quantity;
        setQuantity(String(actualQuantity));

        try {
          //logging inputs to console
          console.log("Quantity: ", quantity);
          console.log("actual quantity: ", actualQuantity);
          console.log("Product Id: ", newProduct_id);
          //making sure inputs are not empty
          if (product_id === "" || quantity === "") {
            setError1("Product Id and quantity needed.");
            return;
          }
          //sending form data to backend server
          const response = await fetch("http://127.0.0.1:5000/updateInventory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              actualQuantity,
              product_id,
            }),
          });
          //handling server response
          if (!response.ok) {
            const errorMessage = await response.json();
            //set error message if server response is not ok
            setError1(errorMessage.message);
          } else {
              /*
                TRACKING BUY, suraiya
                Request to buy_product endpoint, where the purchase is logged in the database. 
                Order number is generated and sent to database. 
              */
              const newOrderNumber = generateOrderNumber();
              setOrderNumber(newOrderNumber);
              // Request to backend to update database with buy locations. 
              const buyResponse = await fetch("http://127.0.0.1:5000/buy_product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: findId(newProductName),
                    quantity: quantity,
                    purchase_address: selectedPurchaseAddress,
                    user: localStorage.getItem('username'),
                    order_number: newOrderNumber
                })
            });

            if (!buyResponse.ok) {
                throw new Error('Failed to log purchase');
            }
            await dashboardData(); // Refresh inventory data
            //Adding to order log
            const orderObject = {
              orderType: "Buy",
              orderId: orderID,
              time: Date(),
              itemName: newProductName,
              quantity: +quantity,
              orderNumber: orderNumber
            };
            setOrders(orders.concat(orderObject));
            setOrderID(orderID + 1);

            //Testing Graph
            if (data.some((e: { name: string }) => e.name === newProductName)) {
              const i = data.findIndex(
                (e: { name: string }) => e.name === newProductName
              );
              const newData = [...data];
              newData[i].bought = data[i].bought + +quantity;
              console.log("New Data is ", newData);
              console.log("Old Data is ", data);
            } else {
              //Testing Graph
              const dataObject = {
                id: data.length + 1,
                name: newProductName,
                sold: 0,
                bought: +quantity,
              };
              setData(data.concat(dataObject));
            }
          } 



        await dashboardData();
        } catch (error) {
          //logging error to console
          console.error("Error:", error);
        }
        setQuantity("");
    }
  };

  /*
    GENERATING ORDER NUMBER, suraiya 
    https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    String of ten random letters and digits created and returned tracking products.
  */
  
  const generateOrderNumber = () => {
    const characters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 10;
    let result = '';
    for (let i = 0; i < length; i++) 
    {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }


  /*
    DASHBOARD, suraiya 
    https://mui.com/material-ui/react-app-bar/
    Layout of menu bar used from link, added menus inside menus for add/delete endpoints. 
    Displays menu bar with pages user can navigate to, inventory data, low stock table, 
    inventory bar graph.
  */
  return (
    <div>
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr:2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SMART STOCK
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem onClick={handleCloseNavMenu}>
                <Link href="/map_feature" color="inherit" underline="none">
                  Map
                </Link>
              </MenuItem>

              <MenuItem onClick={handleOpenProductMenu}>
                Products
                <Menu 
                  open={isProductMenuOpen}
                  onClose={() => setIsProductMenuOpen(false)}
                >
                  <MenuItem onClick={() => window.location.href = '/addProduct'}>
                    Add Product
                  </MenuItem>
                  <MenuItem onClick={() => window.location.href = '/deleteProduct'}>
                    Delete Product
                  </MenuItem>
                </Menu>
              </MenuItem>

              <MenuItem onClick={handleOpenCategoryMenu}>
                Categories
                <Menu
                  open={isCategoryMenuOpen}
                  onClose={() => setIsCategoryMenuOpen(false)}
                >
                  <MenuItem onClick={() => window.location.href = '/addCategory'}>
                    Add Category
                  </MenuItem>
                  <MenuItem onClick={() => window.location.href = '/deleteCategory'}>
                    Delete Category
                  </MenuItem>
                </Menu>
              </MenuItem>

              <MenuItem onClick={handleOpenInventoryMenu}>
                Inventory
                <Menu
                  open={isInventoryMenuOpen}
                  onClose={() => setIsInventoryMenuOpen(false)}
                >
                  <MenuItem onClick={() => window.location.href = '/addInventory'}>
                    Add Inventory
                  </MenuItem>
                  <MenuItem onClick={() => window.location.href = '/deleteInventory'}>
                    Delete Inventory
                  </MenuItem>
                </Menu>
              </MenuItem>

              <MenuItem onClick={handleOpenVariantMenu}>
                Variant
                <Menu
                  open={isVariantMenuOpen}
                  onClose={() => setIsVariantMenuOpen(false)}
                >
                  <MenuItem onClick={() => window.location.href = '/addVariant'}>
                    Add Variant
                  </MenuItem>
                  <MenuItem onClick={() => window.location.href = '/deleteVariant'}>
                    Delete Variant
                  </MenuItem>
                </Menu>
              </MenuItem>

              <MenuItem onClick={handleOpenStoreMenu}>
                Store
                <Menu
                  open={isStoreMenuOpen}
                  onClose={() => setIsStoreMenuOpen(false)}
                >
                  <MenuItem onClick={() => window.location.href = '/addStore'}>
                    Add Store
                  </MenuItem>
                  <MenuItem onClick={() => window.location.href = '/deleteStore'}>
                    Delete Store
                  </MenuItem>
                </Menu>
              </MenuItem>

              <MenuItem onClick={handleOpenShipmentMenu}>
                Shipment
                <Menu
                  open={isShipmentMenuOpen}
                  onClose={() => setIsShipmentMenuOpen(false)}
                >
                  <MenuItem onClick={() => window.location.href = '/addShipment'}>
                    Add Shipment
                  </MenuItem>
                  <MenuItem onClick={() => window.location.href = '/deleteShipment'}>
                    Delete Shipment
                  </MenuItem>
                </Menu>
              </MenuItem>

              <MenuItem onClick={handleCloseNavMenu}>
                <Link href="/inventoryGraph" color="inherit" underline="none">
                  Graph
                </Link>
              </MenuItem>

              <MenuItem onClick={handleCloseNavMenu}>
                <Link href="/filter_page" color="inherit" underline="none">
                  Filter
                </Link>
              </MenuItem>

              <MenuItem onClick={handleCloseNavMenu}>
                <Link href="/forecast" color="inherit" underline="none">
                  Forecast
                </Link>
              </MenuItem>

              <MenuItem onClick={handleCloseNavMenu}>
                <Link href="/review" color="inherit" underline="none">
                  Review
                </Link>
              </MenuItem>

         


              
            </Menu>
          </Box>
   
      
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            SMART STOCK
          </Typography>
          

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>

          <Button
              component={RouterLink}
              to="/map_feature"
              color="inherit"
              sx={{ mr: 2 }}
            >
              Map
          </Button>
          <Button
              aria-controls="product-menu"
              aria-haspopup="true"
              onClick={handleOpenProductMenu}
              color="inherit"
            >
              Product
            </Button>
            <Menu
              id="product-menu"
              anchorEl={anchorElProductMenu}
              open={Boolean(anchorElProductMenu)}
              onClose={handleCloseProductMenu}
            >
              <MenuItem onClick={handleCloseProductMenu}>
                <Link href="/addProduct" color="inherit" underline="none">
                  Add Product
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCloseProductMenu}>
                <Link href="/deleteProduct" color="inherit" underline="none">
                  Delete Product
                </Link>
              </MenuItem>
            </Menu>

            <Button
              aria-controls="category-menu"
              aria-haspopup="true"
              onClick={handleOpenCategoryMenu}
              color="inherit"
            >
              Category
            </Button>
            <Menu
              id="category-menu"
              anchorEl={anchorElCategoryMenu}
              open={Boolean(anchorElCategoryMenu)}
              onClose={handleCloseCategoryMenu}
            >
              <MenuItem onClick={handleCloseCategoryMenu}>
                <Link href="/addCategory" color="inherit" underline="none">
                  Add Category
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCloseCategoryMenu}>
                <Link href="/deleteCategory" color="inherit" underline="none">
                  Delete Category
                </Link>
              </MenuItem>
            </Menu>

            <Button
              aria-controls="inventory-menu"
              aria-haspopup="true"
              onClick={handleOpenInventoryMenu}
              color="inherit"
            >
              Inventory
            </Button>
            <Menu
              id="inventory-menu"
              anchorEl={anchorElInventoryMenu}
              open={Boolean(anchorElInventoryMenu)}
              onClose={handleCloseInventoryMenu}
            >
              <MenuItem onClick={handleCloseInventoryMenu}>
                <Link href="/addInventory" color="inherit" underline="none">
                  Add Inventory
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCloseInventoryMenu}>
                <Link href="/deleteInventory" color="inherit" underline="none">
                  Delete Inventory
                </Link>
              </MenuItem>
            </Menu>

            <Button
              aria-controls="variant-menu"
              aria-haspopup="true"
              onClick={handleOpenVariantMenu}
              color="inherit"
            >
              Variant
            </Button>
            <Menu
              id="variant-menu"
              anchorEl={anchorElVariantMenu}
              open={Boolean(anchorElVariantMenu)}
              onClose={handleCloseVariantMenu}
            >
              <MenuItem onClick={handleCloseVariantMenu}>
                <Link href="/addVariant" color="inherit" underline="none">
                  Add Variant
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCloseVariantMenu}>
                <Link href="/deleteVariant" color="inherit" underline="none">
                  Delete Variant
                </Link>
              </MenuItem>
            </Menu>

            <Button
              aria-controls="store-menu"
              aria-haspopup="true"
              onClick={handleOpenStoreMenu}
              color="inherit"
            >
              Store
            </Button>
            <Menu
              id="store-menu"
              anchorEl={anchorElStoreMenu}
              open={Boolean(anchorElStoreMenu)}
              onClose={handleCloseStoreMenu}
            >
              <MenuItem onClick={handleCloseStoreMenu}>
                <Link href="/addStore" color="inherit" underline="none">
                  Add Store
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCloseStoreMenu}>
                <Link href="/deleteStore" color="inherit" underline="none">
                  Delete Store
                </Link>
              </MenuItem>
            </Menu>

            <Button
              aria-controls="shipment-menu"
              aria-haspopup="true"
              onClick={handleOpenShipmentMenu}
              color="inherit"
            >
              Shipment
            </Button>
            <Menu
              id="shipment-menu"
              anchorEl={anchorElShipmentMenu}
              open={Boolean(anchorElShipmentMenu)}
              onClose={handleCloseShipmentMenu}
            >
              <MenuItem onClick={handleCloseShipmentMenu}>
                <Link href="/addShipment" color="inherit" underline="none">
                  Add Shipment
                </Link>
              </MenuItem>
              <MenuItem onClick={handleCloseShipmentMenu}>
                <Link href="/deleteShipment" color="inherit" underline="none">
                  Delete Shipment
                </Link>
              </MenuItem>
            </Menu>

            <Button
              component={RouterLink}
              to="/inventoryGraph"
              color="inherit"
              sx={{ mr: 2}}
            >
              Graph
            </Button>



            <Button
              component={RouterLink}
              to="/filter_page"
              color="inherit"
              sx={{ mr: 2}}
            >
              Filter
            </Button>

            <Button
              component={RouterLink}
              to="/forecast"
              color="inherit"
              sx={{ mr: 2 }}
            >
              Forecast
            </Button>

            <Button
              component={RouterLink}
              to="/review"
              color="inherit"
              sx={{ mr: 2 }}
            >
              Review
            </Button>


          
          </Box>



          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="profile pic" src="/profile.png" />
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem  onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>

    <Container style={{ marginTop: '70px' }}>
        {/*Inventory stuffs */}
        <Row className="justify-content-between">
          <Col md={6}>
          <div className="inventory-data">
            {/*<h2 className="inventory-header">Inventory Data</h2>*/}
            <Inventory inventory={inventoryItems}></Inventory>
  
            <Form onSubmit={handleSubmit}> 
              <FormGroup style={{ width: '50%', marginBottom: '20px' }}>
                <Input
                  type="select"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                >
                  <option value="">Select item</option>
                  {inventoryItems.map((item) => (
                  <option key={item.id}>{item.productName}</option>
                ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Input
                  disabled={permission === "worker"}
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                  style={{ width: '50%' }}
                ></Input>
              </FormGroup>
              <FormGroup style = {{ width: '50%' }}>
                  <Label for="addressSelect">Select Purchase Address:</Label>
                  <Input type="select" name="addressSelect" id="addressSelect"
                      value={selectedPurchaseAddress}
                      onChange={e => setSelectedPurchaseAddress(e.target.value)}>
                      <option value="">Select an Address</option>
                      {purchaseAddresses.map((address, idx) => (
                          <option key={idx} value={address}>{address}</option>
                      ))}
                  </Input>
              </FormGroup>

              <button onClick={handleNewBuy}>New Buy</button>
              <button onClick={handleNewSell}>New Sell</button>
              {/*
              <Button variant="contained" onClick={handleNewBuy} style={{ marginRight: '10px' }}>New Buy</Button>
              <Button variant="contained" onClick={handleNewSell}>New Sell</Button>
            */}

            </Form>
            <div>
              <h1>List of Orders from Order object</h1>
              <ul>
                {orders.map((each) => (
                  <li key={each.orderId}>
                    {each.orderNumber}
                     You placed an order to{" "}
                    <b>
                      {each.orderType} {each.quantity} {each.itemName}s
                    </b>{" "}
                    on {each.time}
                  </li>
                ))}
              </ul>
            </div>
        </div>
        </Col>

        <Col md={6}>
          <div>
            <h1>Visual representation</h1>
            <BarChart
              width={500}
              height={500}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip/>
              <Legend />
              <Bar
                dataKey="sold"
                fill="#8884d8"
                activeBar={<Rectangle fill="red" stroke="green" />}
              />
              <Bar
                dataKey="bought"
                fill="#82ca9d"
                activeBar={<Rectangle fill="gray" stroke="blue" />}
              />
            </BarChart>
          </div>
        </Col>
          
        <div>
            <div className="low-stock-container">
              <ShowLowStock/>
            </div>
          </div>
       
        </Row>
      </Container>
    </div>
  )
};
export default Dashboard;