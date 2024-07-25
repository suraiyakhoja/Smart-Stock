//updateInventory.tsx Bobby
// Importing necessary modules and components
//https://www.smashingmagazine.com/2020/03/sortable-tables-react/
import React, { useState, useEffect } from "react";
import "./updateFunction.css"; // Importing CSS file for styling
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Button, Table, Container, Row, Col, Input } from "reactstrap" 
import {ArrowLeft} from 'react-bootstrap-icons'
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
  update_date: string;
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

// Defining updateshipment function
const UpdateShipment: React.FC = () => {
  //Stating variables for inputs (shipment_id, product_id, store_id, quantity, to_from, status, time)
  const [shipment_id, setShipment_id] = useState<string>("");
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
  const [error1, setError1] = useState<string>("");
  const [error2, setError2] = useState<string>("");
  const [error3, setError3] = useState<string>("");
  const [error4, setError4] = useState<string>("");
  const [error5, setError5] = useState<string>("");

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
        update_date: item.update_date,
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
  //function to handle poruct_id update
  const handleProduct_id = async () => {
    try {
      //logging inputs to console
      console.log("Product Id: ", product_id);
      console.log("Shipment Id: ", shipment_id);
      //making sure inputs are not empty
      if (shipment_id === "" || product_id === "") {
        setError("Shpment and Product Id needed.");
        return;
      }
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id,
          shipment_id,
          update_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };

  //function to handle store_id update
  const handleStore_id = async () => {
    try {
      //logging inputs to console
      console.log("Store Id: ", store_id);
      console.log("Shipment Id: ", shipment_id);
      //making sure inputs are not empty
      if (shipment_id === "" || store_id === "") {
        setError1("Shpment and Store Id needed.");
        return;
      }
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id,
          shipment_id,
          update_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError1(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };
  //function to handle quantity update
  const handleQuantity = async () => {
    try {
      //logging inputs to console
      console.log("Quantity: ", quantity);
      console.log("Shipment Id: ", shipment_id);
      //making sure inputs are not empty
      if (shipment_id === "" || quantity === "") {
        setError2("Shpment and Quantity needed.");
        return;
      }
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
          shipment_id,
          update_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError2(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };
  //function to handle to_from update
  const handleTo_from = async () => {
    try {
      //logging inputs to console
      console.log("To From: ", to_from);
      console.log("Shipment Id: ", shipment_id);
      //making sure inputs are not empty
      if (shipment_id === "" || to_from === "") {
        setError3("Shpment and To From needed.");
        return;
      }
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to_from,
          shipment_id,
          update_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError3(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };
  //function to handle status update
  const handleStatus = async () => {
    try {
      //logging inputs to console
      console.log("Status: ", status);
      console.log("Shipment Id: ", shipment_id);
      //making sure inputs are not empty
      if (shipment_id === "" || status === "") {
        setError4("Shipment and Status needed.");
        return;
      }
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          shipment_id,
          update_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError4(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };
  //function to handle time update
  const handleTime = async () => {
    try {
      const timeString = `${days} days and ${hours} hours`;
      //logging inputs to console
      console.log("Time: ", time);
      console.log("Shipment Id: ", shipment_id);
      //making sure inputs are not empty
      if (shipment_id === "" ||
              //time === ""
              days === "" ||
              hours === ""
            ) {
        setError5("Shpment and Time needed.");
        return;
      }
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      const currentTime = new Date(currentDate).toISOString().slice(0, 19).replace("T", " ");
      //sending form data to backend server
      const response = await fetch("http://127.0.0.1:5000/updateShipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: timeString,
          shipment_id,
          update_date: currentTime,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError5(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh inventory data
      }
    } catch (error) {
      //logging error to console
      console.error("Error:", error);
    }
  };
  //navigating back to dashboard
  const goBackToDashboard = () => {
    navigate("/dashboard");
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
  //JSX for updating a shipment
  return (
    <Container className='mt-5'>
      <Row>
        <Col className="d-flex flex-column align-items-center">
        <h1>Update Shipment</h1>
        <Form>
          <FormGroup>
          <h3>Shipment ID</h3>
          {/*<input
            type="number"
            value={shipment_id}
            onChange={(e) => setShipment_id(e.target.value)}
            placeholder="Shipment ID"
          />*/}
          <select
            value={shipment_id}
            onChange={(e) => setShipment_id(e.target.value)}
          >
            <option value="">Select Shipment</option>
            {shipment.map((shipment) => (
              <option key={shipment.shipment_id} value={shipment.shipment_id}>
                {shipment.shipment_id}
              </option>
            ))}
          </select>
          <h3>Product Id</h3>
          {/*<input
            type="number"
            value={product_id}
            onChange={(e) => setProduct_id(e.target.value)}
            placeholder="Product ID"
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
          <Button className="mr-2, button-width" onClick={handleProduct_id}>Update Product</Button>
          {error && <div className='text-danger'>{error}</div>}
          <h3>Store Id</h3>
          {/*<input
            type="number"
            value={store_id}
            onChange={(e) => setStore_id(e.target.value)}
            placeholder="Store ID"
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
          <Button className="mr-2 button-width" onClick={handleStore_id}>Update Store</Button>
          {error1 && <div className='text-danger'>{error1}</div>}
          <h3>Quantity</h3>
          <Input
            className="input-field"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
          />
          <Button className="mr-2 button-width" onClick={handleQuantity}>Update Quantity</Button>
          {error2 && <div className='text-danger'>{error2}</div>}
          <h3>To From</h3>
          <select
            id="text"
            value={to_from}
            onChange={(e) => setTo_from(e.target.value)}
          >
            <option value=""> Select To or From </option>
            <option value="To Store"> To Store</option>
            <option value="From Store"> From Store</option>
          </select>
          <Button className="mr-2 button-width" onClick={handleTo_from}>Update To From</Button>
            {error3 && <div className='text-danger'>{error3}</div>}
          <h3>Status</h3>
          <select
            id="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value=""> Select Status </option>
            <option value="Order placed"> Order placed </option>
            <option value="Pending"> Pending </option>
            <option value="Onhold"> Onhold </option>
            <option value="Shipped"> Shipped </option>
            <option value="Delivered"> Delivered </option>
            <option value="Cancelled"> Cancelled </option>
          </select>
          <Button className="mr-2 button-width" onClick={handleStatus}>Update Status</Button>
          {error4 && <div className='text-danger'>{error4}</div>}
          <h3>Time</h3>
          {/*<input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Time"
          />*/}
          <Input
            id="days"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="# of days"
            />
          <Input
            id="hours"
          type="number"
          value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="# of hours"
          />
          <Button className="mr-2 button-width" onClick={handleTime}>Update Delivery Time</Button>
          {error5 && <div className='text-danger'>{error5}</div>}

          <Button color="white" onClick={goBackToDashboard} className="position-absolute"  style={{ top: '60px', left: '60px' }}>
            <ArrowLeft className="mr-2" /></Button>            
          {/* Toggle buttons for product and store tables */}
          {/*<div>
            <button onClick={() => setShowProductTable(!showProductTable)}>
              {showProductTable ? "Hide product Table" : "Show Product Table"}
            </button>
            <button onClick={() => setShowStoreTable(!showStoreTable)}>
              {showStoreTable ? "Hide Store Table" : "Show Store Table"}
            </button>
          </div>*/}
          </FormGroup>
        </Form>
      </Col>
      {/* Render shipment table */}
      <Col className="d-flex flex-column align-items-center">
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
                <th onClick={() => handleSort("time")}>Time</th>
                <th onClick={() => handleSort("order_date")}>Order Date</th>
                <th onClick={() => handleSort("update_date")}>Update Date</th>
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
                  <td>{item.update_date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      {/* Render product table */}
      {showProductTable && (
        <Col className="d-flex flex-column align-items-center">
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
      )}
      {/* Render category table if showCategoryTable is true */}
      {showStoreTable && (
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
      )}
    </Row>
    </Container>
  );
};
export default UpdateShipment;
//exporting Addshipment function