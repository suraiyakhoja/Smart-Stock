//Delete Product.tsx Nick
/*
DeleteProduct component asks the user to input a product ID.
The related product will be deleted from database.
*/
/*Bobby created formatting css the dashboard navigate button and the display table for live update on user input into mysql database 
  added a ordering function that allows sorting by clicking on column name*/
//https://www.smashingmagazine.com/2020/03/sortable-tables-react/
import React, { useState, useEffect } from "react";
import "./deleteFunction.css";
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Button, Table, Container, Row, Col, Input } from "reactstrap" 
import {ArrowLeft} from 'react-bootstrap-icons'
import NavBar from './NavBar'

// Defining product interface to defone sstructure of the table
interface ProductItem {
  product_id: number;
  barcode: string;
  product_name: string;
  product_description: string;
  product_category: string;
  variant_id: number;
}

const DeleteProduct: React.FC = () => {
  const [product_id, setProduct_id] = useState<string>("");

  const [error, setError] = useState<string>("");

  // Define product state to hold product data
  const [product, setProduct] = useState<ProductItem[]>([]);

  //sorting the table based on column name clicked
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  /* SURAIYA 
    Search feature that finds product user is looking for. 
  */
  const [searchQuery, setSearchQuery] = useState<string>(""); 
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null); 
  
  // Highlights the row containing the product user is looking for. 
  const handleSearch = (query: string) => {
    console.log("In handle search")
    setSearchQuery(query);
    console.log("query"+ query)
    const index = sortedProduct.findIndex(
      (item) => item.product_name.toLowerCase().includes(query.toLowerCase())
    );
    console.log("index" + index)
    if (index !== -1) {
      setHighlightedRow(index);
    } else {
      setHighlightedRow(null);
    }

    console.log("Highlighted Row:", index !== -1 ? index : null);
  };

  // On click, handleSearch is called to find product user is looking for. 
  const handleSearchSubmit = () => {
    console.log("button clicked")
    handleSearch(searchQuery);
  };
  /* SURAIYA^ */

  // Fetch product data when component mounts
  useEffect(() => {
    fetchProduct();
  }, []);

  // Function to fetch product data from MySQL
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
        product_category: item.product_category,
        variant_id: item.variant_id,
      }));

      console.log("Product Data:", data); // Log fetched data
      setProduct(productItems); // Update inventory state with fetched data
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };
  const navigate = useNavigate();
  const handleDeleteProduct = async () => {
    try {
      console.log("product Id:", product_id);

      if (product_id === "") {
        setError("Please complete the required boxes.");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/deleteProduct", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        setError(errorMessage.message);
      } else {
        await fetchProduct(); // Refresh product data
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
  const sortedProduct = [...product].sort((a, b) => {
    if (sortBy) {
      //if sortby has a value
      const aValue = a[sortBy as keyof ProductItem];
      const bValue = b[sortBy as keyof ProductItem];
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
            <h1>Delete Product</h1>
            <Form>
              <FormGroup>
                <Input 
                  className="input-field"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Product by Name"
                ></Input>
                <Button className="ml-2 button-width" color="primary" onClick={handleSearchSubmit}>Search</Button>
              </FormGroup>
              <FormGroup>
                <Input
                  className="input-field"
                  type="number"
                  value={product_id}
                  onChange={(e) => setProduct_id(e.target.value)}
                  placeholder="Please enter product ID"
                ></Input>
                <FormGroup>
                  <Button className="mr-2 button-width" onClick={handleDeleteProduct}>Submit</Button>
                </FormGroup>
                
              </FormGroup>
            </Form>
          </Col>
          {/* Render product table */}
          <Col className="d-flex flex-column align-items-center">
            <h1>Product Table</h1>
            <Table striped bordered>
              <thead>
                <tr>
                  <th onClick={() => handleSort("product_id")}>Product ID</th>
                  <th onClick={() => handleSort("barcode")}>Barcode</th>
                  <th onClick={() => handleSort("product_name")}>Product Name</th>
                  <th onClick={() => handleSort("product_description")}>Description</th>
                  <th onClick={() => handleSort("product_category")}>Category</th>
                  <th onClick={() => handleSort("variant_id")}>Variant ID</th>
                </tr>
              </thead>
              <tbody>
                {sortedProduct.map((item, index) => (
                  <tr key={index} className={highlightedRow === index ? "table-primary" : ""}>
                    <td>{item.product_id}</td>
                    <td>{item.barcode}</td>
                    <td>{item.product_name}</td>
                    <td>{item.product_description}</td>
                    <td>{item.product_category}</td>
                    <td>{item.variant_id}</td>
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

export default DeleteProduct;
