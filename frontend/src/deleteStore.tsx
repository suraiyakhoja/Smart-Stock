//DeleteStore.tsx Bobby
import React, { useState, useEffect } from "react";
import "./deleteFunction.css";
import { useNavigate } from "react-router-dom";
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
const DeleteStore: React.FC = () => {
  const [store_id, setStore_id] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreItem[]>([]);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch store data when component mounts
  useEffect(() => {
    fetchStore();
  }, []);
  // Function to fetch store data from MySQL
  const fetchStore = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/store");
      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }
      const data = await response.json();
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
  const handleDeleteStore = async () => {
    try {
      console.log("store Id:", store_id);

      if (store_id === "") {
        setError("Please complete the required boxes.");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/deleteStore", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        setError(errorMessage.message);
      } else {
        await fetchStore(); // Refresh store data
      }
    } catch (error) {
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
  //JSX for deleting a new store
  return (
    <div>
      <NavBar/>
      <Container className='mt-5'>
        <Row>
          <Col className="d-flex flex-column align-items-center">
          <h1>Delete Store</h1>
          <Form>
              <FormGroup>
            {/* 
            <input
              type="number"
              placeholder="Store ID"
              value={store_id}
              onChange={(e) => setStore_id(e.target.value)}
            />
            */}
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
            </FormGroup>
            <FormGroup>
              <Button className='mr-2 button-width' onClick={handleDeleteStore}>Delete Store</Button>
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
export default DeleteStore;