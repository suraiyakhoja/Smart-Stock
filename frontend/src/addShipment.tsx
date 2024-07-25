// addShipment.tsx Bobby
// Importing necessary modules and components
import React, { useState, useEffect } from "react";
import "./addFunction.css"; // Importing CSS file for styling
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Table, Row, Col, Input, Container, Button } from "reactstrap" 
import NavBar from './NavBar'


// Importing useNavigate hook for navigation back to dashboard

// Defining Shipment interface to defone sstructure of the table

interface ShipmentItem {
  shipment_id: number;
  product_id: number;
  product_name: string;
  store_id: number;
  store_name: string;
  quantity: number;
  to_from: string;
  status: string;
  time: string;
  order_date: string;
}

interface ProductItem {
  product_id: number;
  barcode: string;
  product_name: string;
  product_description: string;
}
interface StoreItem {
  store_id: number;
  store_name: string;
  address: string;
}

// Defining AddShipment function
const AddShipment: React.FC = () => {
  //Stating variables for inputs (product_id, store_id, quantity, to_from, status, time)
  const [product_id, setProduct_id] = useState<string>("");
  const [store_id, setStore_id] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [to_from, setTo_from] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [days, setDays] = useState<string>("");

  const navigate = useNavigate(); //navigation hook for going back to dashboard
  //error state for displaying validation errors
  const [error, setError] = useState<string>("");

  // Defining shipment state to hold shipment data
  const [shipment, setShipment] = useState<ShipmentItem[]>([]);
  const [product, setProduct] = useState<ProductItem[]>([]);
  const [store, setStore] = useState<StoreItem[]>([]);

  const [showProductTable, setShowProductTable] = useState(false);
  const [showStoreTable, setShowStoreTable] = useState(false);

  //sorting table
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [sortBy1, setSortBy1] = useState<string | null>(null);
  const [sortDirection1, setSortDirection1] = useState<"asc" | "desc">("asc");
  const [sortBy2, setSortBy2] = useState<string | null>(null);
  const [sortDirection2, setSortDirection2] = useState<"asc" | "desc">("asc");


  
    
  // Fetch shipment data when component mounts
  useEffect(() => {
    fetchShipment();
  }, []);

  // Function to fetch shipment data from MySQL
  const fetchShipment = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/shipment");
      if (!response.ok) {
        throw new Error("Failed to fetch shipment data");
      }
      const data = await response.json();
      // Map fetched data to ShipmentItem interface
      const shipmentItems: ShipmentItem[] = data.shipment.map((item: any) => ({
        shipment_id: item.shipment_id,
        product_id: item.product_id,
        store_id: item.store_id,
        quantity: item.quantity,
        to_from: item.to_from,
        status: item.status,
        time: item.time,
        product_name: item.product_name,
        store_name: item.store_name,
        order_date: item.order_date,
      }));
      console.log("Shipment Data:", data); // Log fetched data
      setShipment(shipmentItems); // Update store state with fetched data
    } catch (error) {
      console.error("Error fetching store:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/product");
      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }
      const data = await response.json();

      // Map fetched data to ProductItem interface
      const productItems: ProductItem[] = data.product.map((item: any) => ({
        product_id: item.product_id,
        barcode: item.barcode,
        product_name: item.product_name,
        product_description: item.product_description,
      }));

      console.log("Product Data:", data); // Log fetched data
      setProduct(productItems); // Update inventory state with fetched data
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/store");
      if (!response.ok) {
        throw new Error("Failed to fetch store data");
      }
      const data = await response.json();

      // Map fetched data to ProductItem interface
      const storeItems: StoreItem[] = data.store.map((item: any) => ({
        store_id: item.store_id,
        store_name: item.store_name,
        address: item.address,
      }));

      console.log("Store Data:", data); // Log fetched data
      setStore(storeItems); // Update store state with fetched data
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  //function to handle submission of shipment
  const handleShipment = async () => {
    try {
      const timeString = `${days} days and ${hours} hours`;
      //logging inputs to console
      console.log("Product Id: ", product_id);
      console.log("Store Id: ", store_id);
      console.log("Quantity: ", quantity);
      console.log("To From: ", to_from);
      console.log("Status: ", status);
      console.log("Time: ", time);
      //making sure inputs are not empty
      if (
        product_id === "" ||
        store_id === "" ||
        quantity === "" ||
        to_from === "" ||
        //status === "" ||
        //time === ""
        days === "" ||
        hours === ""
      ) {
        setError("Please complete the required boxes.");
        setStatus("");
        return;
      }

      
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //i set the mysql wrkbench time datatype as DATAETIME this is the fomrat that it accepts
      // Define a variable to store the updated quantity
      let updatedQuantity = 0;

      // Calculate updated quantity based on whether it's going to store or from store
      if (to_from === "To Store") {
        // If it's going to store, subtract the quantity
        updatedQuantity = -parseInt(quantity);
      } else if (to_from === "From Store") {
        // If it's from store, add the quantity
       updatedQuantity = parseInt(quantity);
      }
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/addShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id,
          store_id,
          quantity,
          to_from,
          status: "Order Placed",
          time: timeString,
          order_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        console.error("Error adding shipment");
      }
      else{
        // Add data to inventorygraph table
        const addInventoryGraph = await fetch(
          "http://127.0.0.1:5000/addInventoryGraph",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product_id,
              quantity: updatedQuantity,
              time: currentTime,
            }),
          }
        );
        if (!addInventoryGraph.ok) {
          console.error("Error adding data to inventorygraph table");
        }
        await fetchShipment(); // Refresh inventory data
      }

    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };

  //the toggles  if ascending or descending
  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnName);
      setSortDirection("asc");
    }
  };
  //if not toggled the table will first appear as it is from the mysql database
  //copying original table and sorting from largest to smallest or smallet to largest
  const sortedShipment = [...shipment].sort((a, b) => {
    if (sortBy) {
      //if sortby has a value
      const aValue = a[sortBy as keyof ShipmentItem];
      const bValue = b[sortBy as keyof ShipmentItem];
      //compares a and b items anr return -1  ascendingd or 1 descendingd
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  const handleSort1 = (columnName1: string) => {
    if (sortBy1 === columnName1) {
      setSortDirection1(sortDirection1 === "asc" ? "desc" : "asc");
    } else {
      setSortBy1(columnName1);
      setSortDirection1("asc");
    }
  };
  //table 2
  const sortedProduct = [...product].sort((a, b) => {
    if (sortBy1) {
      //if sortby has a value
      const aValue = a[sortBy1 as keyof ProductItem];
      const bValue = b[sortBy1 as keyof ProductItem];
      //compares a and b items anr return -1  ascendingd or 1 descendingd
      if (aValue < bValue) return sortDirection1 === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection1 === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  //the toggles  if ascending or descending
  const handleSort2 = (columnName2: string) => {
    if (sortBy2 === columnName2) {
      setSortDirection2(sortDirection2 === "asc" ? "desc" : "asc");
    } else {
      setSortBy2(columnName2);
      setSortDirection2("asc");
    }
  };
  //table 3
  const sortedStore = [...store].sort((a, b) => {
    if (sortBy2) {
      //if sortby has a value
      const aValue = a[sortBy2 as keyof StoreItem];
      const bValue = b[sortBy2 as keyof StoreItem];
      //compares a and b items anr return -1  ascendingd or 1 descendingd
      if (aValue < bValue) return sortDirection2 === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection2 === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  //JSX for adding a new shipment
  return (
    <div>
      <NavBar/>
      <Container className='mt-5'>
        <Row>
          <Col className="d-flex flex-column align-items-center">
          <h1>ADD New Shipment</h1>
          <Form>
            <FormGroup>
            {/*<input
              type="number"
              value={product_id}
              onChange={(e) => setProduct_id(e.target.value)}
              placeholder="Product Id"
            />*/}
            
            <select
              value={product_id}
              onChange={(e) => setProduct_id(e.target.value)}
            >
              <option value="">Select Product</option>
              {product.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
            {/*<input
              type="number"
              value={store_id}
              onChange={(e) => setStore_id(e.target.value)}
              placeholder="Store Id"
            />*/}
            <select
              value={store_id}
              onChange={(e) => setStore_id(e.target.value)}
            >
              <option value="">Select Store</option>
              {store.map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.store_name}
                </option>
              ))}
            </select>
            <Input 
              className="input-field" 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
            />
            <select
              id="text"
              value={to_from}
              onChange={(e) => setTo_from(e.target.value)}
            >
              <option value=""> Select To or From </option>
              <option value="To Store"> To Store</option>
              <option value="From Store"> From Store</option>
            </select>
            {/*<input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Delivery Time"
            />*/}
            <div>
            <h3>Delivary Time</h3>
            <Input
              className="input-field" 
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="# of days"
            />
            <Input
              className="input-field" 
              id="hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="# of hours"
            />
            </div>
                <Button className="mr-2, button-width" onClick={handleShipment}>Add Shipment</Button>
                <Button className="mr-2, button-width" onClick={() => setShowProductTable(!showProductTable)}>{showProductTable ? "Hide product Table" : "Show product Table"}</Button>
                <Button className="mr-2, button-width" onClick={() => setShowStoreTable(!showStoreTable)}>{showStoreTable ? "Hide Store Table" : "Show Store Table"}</Button>
            

              {error && <div className="text-danger">{error}</div>}
            </FormGroup>

            </Form>
          </Col>
        </Row>
        {/* Render shipment table */}
        <Row>
          <Col className="text-center">
            <h1>Shipment Table</h1>
            <Table striped bordered>
              <thead>
                <tr>
                  <th onClick={() => handleSort("shipment_id")}>Shipment Id</th>
                  {/*<th onClick={() => handleSort("product_id")}>Product Id</th>*/}
                  <th onClick={() => handleSort("product_name")}>Product</th>
                  {/*<th onClick={() => handleSort("store_id")}>Store Id</th>*/}
                  <th onClick={() => handleSort("store_name")}>Store</th>
                  <th onClick={() => handleSort("quantity")}>Quantity</th>
                  <th onClick={() => handleSort("to_from")}>To From</th>
                  <th onClick={() => handleSort("status")}>Status</th>
                  <th onClick={() => handleSort("time")}>Delivery Time</th>
                  <th onClick={() => handleSort("order_date")}>Order Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedShipment.map((item) => (
                  <tr key={item.shipment_id}>
                    <td>{item.shipment_id}</td>
                    {/*<td>{item.product_id}</td>*/}
                    <td>{item.product_name}</td>
                    {/*<td>{item.store_id}</td>*/}
                    <td>{item.store_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.to_from}</td>
                    <td>{item.status}</td>
                    <td>{item.time}</td>
                    <td>{item.order_date}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
        {/* Render product table */}
        {showProductTable && (
        <Row>
          <Col className="text-center">
            <h1>Product Table</h1>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th onClick={() => handleSort1("product_id")}>Product Id</th>
                    <th onClick={() => handleSort1("product_name")}>Product</th>
                    <th onClick={() => handleSort1("barcode")}>Barcode</th>
                    <th onClick={() => handleSort1("product_description")}>
                      DEscription
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProduct.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_id}</td>
                      <td>{item.product_name}</td>
                      <td>{item.barcode}</td>
                      <td>{item.product_description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        )}
        {/* Render category table if showCategoryTable is true */}
        {showStoreTable && (
        <Row>
          <Col className="d-flex flex-column align-items-center">
              <h1>Store Table</h1>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th onClick={() => handleSort2("store_id")}>Store Id</th>
                    <th onClick={() => handleSort2("store_name")}>Store Name</th>
                    <th onClick={() => handleSort2("address")}> Address</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStore.map((item, index) => (
                    <tr key={index}>
                      <td>{item.store_id}</td>
                      <td>{item.store_name}</td>
                      <td>{item.address}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
          </Col>
        </Row>
        )}
      </Container>
    </div>
  );
};
export default AddShipment;
//exporting Addshipment function