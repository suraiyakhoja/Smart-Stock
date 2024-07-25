//DeleteShipment.tsx Bobby
import React, { useState, useEffect } from "react";
import "./deleteFunction.css";
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Button, Table, Container, Row, Col, Input } from "reactstrap" 
import {ArrowLeft} from 'react-bootstrap-icons'
import NavBar from './NavBar'

// Defining Shipment interface to define structure of the table
interface ShipmentItem {
  shipment_id: number;
  product_id: number;
  store_id: number;
  quantity: number;
  to_from: number;
  status: string;
  time: string;
}

const DeleteShipment: React.FC = () => {
  const [shipment_id, setShipment_id] = useState<string>("");

  const [error, setError] = useState<string>("");

  // Define shipment state to hold shipment data
  const [shipment, setShipment] = useState<ShipmentItem[]>([]);

  //sorting the table based on column name clicked
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate(); //navigation hook for going back to dashboard

  // Fetch shipment data when component mounts
  useEffect(() => {
    fetchShipment();
  }, []);
  // Fetch shipment data
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
      }));
      console.log("Shipment Data:", data); // Log fetched data
      setShipment(shipmentItems); // Update store state with fetched data
    } catch (error) {
      console.error("Error fetching store:", error);
    }
  };

  const handleDeleteShipment = async () => {
    try {
      console.log("shipment Id:", shipment_id);

      if (shipment_id === "") {
        setError("Please complete the required boxes.");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/deleteShipment", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipment_id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        setError(errorMessage.message);
      } else {
        await fetchShipment(); // Refresh shipment data
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

  return (
    <div>
      <NavBar/>
      <Container className='mt-5'>
        <Row>
          <Col className="d-flex flex-column align-items-center">
          <h1>Delete Shipment</h1>
          <Form>
              <FormGroup>
            {/*<input
              type="number"
              value={shipment_id}
              onChange={(e) => setShipment_id(e.target.value)}
              placeholder="Shipment Id"
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
            </FormGroup>
            <FormGroup>
            <Button className='mr-2 button-width' onClick={handleDeleteShipment}>Delete Shipment</Button>
            </FormGroup>
            {error && <div className='text-danger'>{error}</div>}
          </Form>
          </Col>
        {/* Render shipment table */}
        <Col className="d-flex flex-column align-items-center">

            <h1>Shipment Table</h1>
            <Table striped bordered>
              <thead>
                <tr>
                  <th onClick={() => handleSort("shipment_id")}>Shipment ID</th>
                  {/*<th onClick={() => handleSort("product_id")}>Product ID</th>*/}
                  {/*<th onClick={() => handleSort("store_id")}>Store ID</th>*/}  
                  <th onClick={() => handleSort("quantity")}>Quantity</th>
                  <th onClick={() => handleSort("to_from")}>To/From</th>
                  <th onClick={() => handleSort("status")}>Status</th>
                  <th onClick={() => handleSort("time")}>Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedShipment.map((item) => (
                  <tr key={item.shipment_id}>
                    <td>{item.shipment_id}</td>
                    {/*<td>{item.product_id}</td>*/}
                    {/*<td>{item.store_id}</td>*/}
                    <td>{item.quantity}</td>
                    <td>{item.to_from}</td>
                    <td>{item.status}</td>
                    <td>{item.time}</td>
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
export default DeleteShipment;