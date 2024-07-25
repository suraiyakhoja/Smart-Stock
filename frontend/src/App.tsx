import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage"; 
import Login from "./Login";
import AccountRecovery from './AccountRecovery'
import Dashboard from "./Dashboard";
import "./App.css";
import Registration from "./Registration";
import RegistrationPT2 from "./RegistrationPT2";
import RegistrationPT3 from "./RegistrationPT3";
import AddProduct from "./addProduct";
import AddCategory from "./addCategory";
import AddInventory from "./addInventory";
import AddVariant from "./addVariant";
import UpdateInventory from "./updateInventory";
import DeleteProduct from "./deleteProduct";
import DeleteVariant from "./deleteVariant";
import DeleteInventory from "./deleteInventory";
import DeleteCategory from "./deleteCategory";
import Filter from "./FilterPage";
import VerifyCode from "./VerifyCode";
import ResetPassword from "./ResetPassword";
import MapFeature from "./MapFeature"
import Forecast from "./forecast";
import Review from "./review";
import AddStore from "./addStore";
import AddShipment from "./addShipment";
import UpdateShipment from "./updateShipment";
import DeleteStore from "./deleteStore";
import DeleteShipment from "./deleteShipment";
import InventoryGraph from "./inventoryGraph";


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedIn === "true");
  }, []);

  return (
    <Router>
      <Routes>
      <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <LandingPage />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/account_recovery" element={<AccountRecovery />} />
        <Route path="/verify_code" element={<VerifyCode />} />
        <Route path="/reset_password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register_pt1" element={<Registration />} />
        <Route path="/register_pt2" element={<RegistrationPT2 />} />
        <Route path="/register_pt3" element={<RegistrationPT3 />} />
        <Route path="/addProduct" element={<AddProduct />} />
        <Route path="/deleteProduct" element={<DeleteProduct />} />
        <Route path="/addCategory" element={<AddCategory />} />
        <Route path="/deleteCategory" element={<DeleteCategory />} />
        <Route path="/addInventory" element={<AddInventory />} />
        <Route path="/updateInventory" element={<UpdateInventory />} />
        <Route path="/deleteInventory" element={<DeleteInventory />} />
        <Route path="/addVariant" element={<AddVariant />} />
        <Route path="/deleteVariant" element={<DeleteVariant />} />
        <Route path="/filter_page" element={<Filter />} />
        <Route path="/map_feature" element={<MapFeature />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/review" element={<Review />} />
        <Route path="/addStore" element={<AddStore />} />
        <Route path="/deleteStore" element={<DeleteStore />} />
        <Route path="/addShipment" element={<AddShipment />} />
        <Route path="/updateShipment" element={<UpdateShipment />} />
        <Route path="/deleteShipment" element={<DeleteShipment />} />
        <Route path="/inventoryGraph" element={<InventoryGraph />} />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </Router>
  );
};

export default App;
// import FetchInventoryData from "./FetchInventoryData";

// <Route path="/fetch_inventory" element={<FetchInventoryData />} />

// import ShowLowStock from "./showLowStock"; //Import ShowLowStock component

// <Route path="/showLowStock" element={<ShowLowStock />} />

