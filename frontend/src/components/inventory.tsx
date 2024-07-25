
// JUSTIN
//import React from 'react';
//import { ListFormat } from 'typescript';
import { Form, FormGroup, Button, Table, Container, Row, Col, Input } from "reactstrap" 
import "./inventory.css";

export const Inventory = (props: { inventory: any[] }) => {

  const getQuantityColor = (quantity: number) => {
    if (quantity < 100) {
      return { backgroundColor: '#Ff0003', borderRadius: '20px', padding: '6px 10px' };
    } else if (quantity > 1000) {
      return { backgroundColor: '#1fec2f', borderRadius: '20px', padding: '6px 10px' };
    } else {
      return {};
    }
  }
   


  return (
    <Container className = "lowstock-container">
      <Col>
        <Table borderless>
          <thead>
            <tr>
              <th>Product</th>
              <th>Description</th>
              <th>Quantity</th>
            </tr>
          </thead>     
          <tbody>
            {props.inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.productDescription}</td>
                <td style={getQuantityColor(item.quantity)}>{item.quantity}</td> 
              </tr>
            ))}
          </tbody>
        </Table>
      </Col>
    </Container>
  );
};





