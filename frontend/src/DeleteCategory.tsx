/*Nick
DeleteCategory component asks the user to input a category ID.
The related category will be deleted from database.
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

// Defining CategoryItem interface to defone sstructure of the table
interface CategoryItem {
  category_id: number;
  category_name: string;
  category_description: string;
}
const DeleteCategory: React.FC = () => {
  const [category_id, setCategory_id] = useState<string>("");

  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // Define category state to hold inventory data
  const [category, setCategory] = useState<CategoryItem[]>([]);

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
      const index = sortedCategory.findIndex(
        (item) => item.category_name.toLowerCase().includes(query.toLowerCase())
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
  // Fetch category data when component mounts
  useEffect(() => {
    fetchCategory();
  }, []);

  // Function to fetch Category data from MySQL
  const fetchCategory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/category");
      if (!response.ok) {
        throw new Error("Failed to fetch category data");
      }
      const data = await response.json();

      // Map fetched data to CategoryItem interface
      const categoryItems: CategoryItem[] = data.category.map((item: any) => ({
        category_id: item.category_id,
        category_name: item.category_name,
        category_description: item.category_description,
      }));

      console.log("Category Data:", data); // Log fetched data
      setCategory(categoryItems); // Update category state with fetched data
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      console.log("category Id:", category_id);

      if (category_id === "") {
        setError("Please complete the required boxes.");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/deleteCategory", {
        method: "Delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        setError(errorMessage.message);
      } else {
        await fetchCategory(); // Refresh category data
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
  const sortedCategory = [...category].sort((a, b) => {
    if (sortBy) {
      //if sortby has a value
      const aValue = a[sortBy as keyof CategoryItem];
      const bValue = b[sortBy as keyof CategoryItem];
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
      <Container className="mt-5">
        <Row>
          <Col className="d-flex flex-column align-items-center">
            <h1>Delete Category</h1>
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
                  value={category_id}
                  onChange={(e) => setCategory_id(e.target.value)}
                  placeholder="Please enter your category ID"
                ></Input>
                <FormGroup>
                  <Button className="mr-2 button-width" onClick={handleDeleteCategory}>Delete</Button>
                </FormGroup>
               
                {error && <div className="text-danger">{error}</div>}
              </FormGroup>
            </Form>
          </Col>

          {/*Render category table*/}
          <Col className="d-flex flex-column align-items-center">
            <h1>Category Table</h1>
            <Table striped bordered>
              <thead>
                <tr>
                  <th onClick={() => handleSort("category_id")}>Category Id</th>
                  <th onClick={() => handleSort("category_name")}>Category Name</th>
                  <th onClick={() => handleSort("category_description")}>Category Description</th>
                </tr>
              </thead>
              <tbody>
                {sortedCategory.map((item, index) => (
                  <tr key={index} className={highlightedRow === index ? "table-primary" : ""}>
                    <td>{item.category_id}</td>
                    <td>{item.category_name}</td>
                    <td>{item.category_description}</td>
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

export default DeleteCategory;
