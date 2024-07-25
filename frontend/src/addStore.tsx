// addStore.tsx Bobby
// Importing necessary modules and components
import React, { useState, useEffect } from "react";
import "./addFunction.css"; // Importing CSS file for styling
import { useNavigate } from "react-router-dom";
// Importing useNavigate hook for navigation back to dashboard
import { Form, FormGroup, Button, Table, Container, Row, Col, Input } from "reactstrap" 
import {ArrowLeft} from 'react-bootstrap-icons'
import NavBar from './NavBar'

// Defining Store interface to define structure of the table

interface StoreItem {
  store_id: number;
  store_name: string;
  address: string;
  city: string;
  zipcode: number;
}
//extras for maybe
//state: string;
//country: string;
//phone: string;
//email: string;
//website: string;

// Defining AddStore function
const AddStore: React.FC = () => {
  //Stating variables for inputs (store_name, address, city, zipcode)
  const [store_name, setStore_name] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");
  //navigation hook for going back to dashboard
  const navigate = useNavigate();
  //error state for displaying validation errors
  const [error, setError] = useState<string>("");

  // Defining store state to hold store data
  const [store, setStore] = useState<StoreItem[]>([]);

  //sorting the table

  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  //fetch store data when component mount
  useEffect(() => {
    fetchStore();
  }, []);

  //Function to fetch store data from MySQL
  const fetchStore = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/store");
      if (!response.ok) {
        throw new Error("Failed to fetch store data");
      }
      const data = await response.json()  ;

      // Map fetched data to StoreItem interface
      const storeItems: StoreItem[] = data.store.map((item: any) => ({
        store_id: item.store_id,
        store_name: item.store_name,
        address: item.address,
        city: item.city,
        zipcode: item.zipcode,
      }));

      console.log("Store Data:", data); // Log fetched data
      setStore(storeItems); // Update store state with fetched data
    } catch (error) {
      console.error("Error fetching store:", error);
    }
  };

  //function to handle submission of store
  const handleStore = async () => {
    try {
      //logging inputs to console
      console.log("Store Name: ", store_name);
      console.log("Address: ", address);
      console.log("City: ", city);
      console.log("Zipcode: ", zipcode);
      //making sure inputs not empty
      if (
        store_name === "" ||
        address === "" ||
        city === "" ||
        zipcode === ""
      ) {
        //displaying error message if empty inputs
        setError("Please complete the required boxes.");
        return;
      }
      //sending data to backend
      const response = await fetch("http://127.0.0.1:5000/addStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_name,
          address,
          city,
          zipcode,
        }),
      });
      //handling server response
      if (!response.ok) {
        const errorMessage = await response.json();
        //set error message if server response is not ok
        setError(errorMessage.message);
      } else {
        await fetchStore(); // Refresh store data
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
  const sortedStore = [...store].sort((a, b) => {
    if (sortBy) {
      //if sortby has a value
      const aValue = a[sortBy as keyof StoreItem];
      const bValue = b[sortBy as keyof StoreItem];
      //compares a and b items anr return -1  ascendingd or 1 descendingd
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  //JSX for adding a new store
  return (
    <div>
      <NavBar/>
      <Container className='mt-5'>
        <Row>
          <Col className="d-flex flex-column align-items-center">
            <h1>ADD New Store</h1>
          <Form>
              <FormGroup>
                <Input
                  className="input-field"
              type="text"
              value={store_name}
              onChange={(e) => setStore_name(e.target.value)}
              placeholder="Store Name"
            ></Input>
                <Input
                  className="input-field"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            ></Input>
                <Input
                  className="input-field"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            ></Input>
                <Input
                  className="input-field"
              type="number"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="Zipcode"
            ></Input>
                </FormGroup>
                <FormGroup>
                  <Button className='mr-2 button-width' onClick={handleStore}>Add Store</Button>
                </FormGroup>
              
                {error && <div className='text-danger'>{error}</div>}
          </Form>
          </Col>
        {/* Render store table */}
          <Col className="d-flex flex-column align-items-center">

            <h1>Store Table</h1>
            <Table striped bordered>
              <thead>
                <tr>
                  <th onClick={() => handleSort("store_id")}>Store ID</th>
                  <th onClick={() => handleSort("store_name")}>Store Name</th>
                  <th onClick={() => handleSort("address")}>Address</th>
                  <th onClick={() => handleSort("city")}>City</th>
                  <th onClick={() => handleSort("zipcode")}>Zipcode</th>
                </tr>
              </thead>
              <tbody>
                {sortedStore.map((item) => (
                  <tr key={item.store_id}>
                    <td>{item.store_id}</td>
                    <td>{item.store_name}</td>
                    <td>{item.address}</td>
                    <td>{item.city}</td>
                    <td>{item.zipcode}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>

      </Container>
    </div>
  );
};
export default AddStore;
//exporting AddStore function