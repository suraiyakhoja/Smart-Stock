import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Inventory } from "./inventory";

/*
NOT USING THIS, ALREADY IN DASHBOARD - suraiya 
*/


// JUSTIN
const FetchInventoryData: React.FC = () => {
  const [inventory, setInventory] = useState([]);
  //const [lowStockItems, setLowStockItems] = useState([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    //https://flask.palletsprojects.com/en/3.0.x/patterns/javascript/
    fetch("http://127.0.0.1:5000/fetch_inventory")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        //Fetch returns a promise that we are using then() on
        return res.json();
      })
      .then((data) => {
        //If the response contains JSON, it can be used with a then() callback chain
        console.log(data);
        setInventory(data);
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []); //This empty array is so that it only first this function once on the initial render and avoid an infinity loop




  return (
    <div className="fetchinventory">
      <div className="fetchinventory">
        <div className="fetchinventory section"></div>
        <h2>Inventory Items</h2>
        <div className="fetchinventory-section-content">
          <Inventory inventory={inventory}></Inventory>
        </div>
      </div>
    </div>
  );

};

export default FetchInventoryData;




