import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Grid, FormControl, InputLabel, MenuItem, TextField, Button, Paper } from '@mui/material';

const NavBar = () => {
    const navigate = useNavigate(); //navigation hook for going back to dashboard
    const [error, setError] = useState<string>("");

/*
    NAVIGATION BAR, suraiya 
    https://mui.com/material-ui/react-app-bar/
    The functions below control the navigation bar at the top of the screen. 
    It handles the opening/closing of buttons and menus. Some of these functions 
    are specific to menu items (like products and categories) to allow users to 
    choose between different options within them. 
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
          const response = await fetch("http://127.0.0.1:5000/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
    
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
      
      }

      return (
        <div>
        <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/dashboard"
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
    </div>
    )};

export default NavBar;