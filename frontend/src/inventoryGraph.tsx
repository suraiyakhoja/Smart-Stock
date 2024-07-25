//bobby
//https://recharts.org/en-US/examples
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Button, Table, Container, Row, Col, Input } from "reactstrap" 
import {ArrowLeft} from 'react-bootstrap-icons'
import "./graph.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
//import { Chart, Line } from "react-chartjs-2";
import NavBar from './NavBar'

interface GraphItem {
  graph_id: number;
  product_id: number;
  quantity: number;
  time: string;
  product_name: string;
}

interface ProductItem {
  product_id: number;
  product_name: string;
}

const InventoryGraph: React.FC = () => {
  const [product_id, setProduct_id] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const navigate = useNavigate();
  const [graph, setGraph] = useState<GraphItem[]>([]);
  const [product, setProduct] = useState<ProductItem[]>([]);
  const [recentTimeDate, setrecentTimeDate] = useState<string>("");
  const [xAxisLabel, setXAxisLabel] = useState<string>(""); 

  const [showInventoryTable, setShowInventoryTable] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    fetchGraph();
  }, [recentTimeDate, selectedMonth]);

  const fetchGraph = async () => {
    try {
      let apiUrl = `http://127.0.0.1:5000/inventoryGraph?granularity=${recentTimeDate}`;
      if (selectedMonth) {
        apiUrl += `&selectedMonth=${selectedMonth}`;
      }
      const response = await fetch(apiUrl); 
      if (!response.ok) {
        throw new Error("Failed to fetch graph data");
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      setGraph(data.inventory_graph);
      const productIdsInGraph = data.inventory_graph.map(
        (item: GraphItem) => item.product_id
      );
      const filteredProducts = data.products.filter((product: ProductItem) =>
        productIdsInGraph.includes(product.product_id)
      );
      setProduct(filteredProducts);
      // console.log("Graph data:", data.inventory_graph);
      if (recentTimeDate != ""){
        updateXAxisLabel(recentTimeDate);
      }
    } catch (error) {
      console.error("Error fetching graph:", error);
      setError("Error fetching graph data");
    }
  };

  const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProductId = event.target.value;
    setProduct_id(selectedProductId);

    if (selectedProductId === "all") {
      setSelectedProductName("All Products");
    } else{
      const selectedProduct = product.find(
        (product) => product.product_id === parseInt(selectedProductId)
      );
    if (selectedProduct) {
      setSelectedProductName(selectedProduct.product_name);
    }
    }
  };
  const handlerecentTimeDateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedrecentTimeDate = event.target.value;
    setrecentTimeDate(selectedrecentTimeDate); // Update time type
    updateXAxisLabel(selectedrecentTimeDate);
  };
  const handleselectedMonthChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedMonthValue = event.target.value;
    setSelectedMonth(selectedMonthValue);
  };
  
  const updateXAxisLabel = (selectedrecentTimeDate: string) => {
    switch (selectedrecentTimeDate) {
      case "day":
        setXAxisLabel("Hour of Day");
        break;
      case "week":
        setXAxisLabel("Day of Week");
        break;
      case "month":
        setXAxisLabel("Week of Month");
        break;
      case "year":
        setXAxisLabel("Month of Year");
        break;
      default:
        setXAxisLabel("Time");
        break;
    }
  };



  return (
    <div>
      <NavBar/>
      <Container className='mt-5'>
        <Row>
          <Col className="d-flex flex-column align-items-center">
            <h1>Inventory Graph</h1>
              <Form>
                <FormGroup>
                  <select value={product_id} onChange={handleProductChange}>
                    <option key="default" value="">
                      Select Product
                    </option>
                    <option key="all" value="all">
                      All Products
                    </option>
                    {product.map((product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.product_name}
                      </option>
                    ))}
                  </select>
                <select value={recentTimeDate} onChange={handlerecentTimeDateChange}> 
                  <option key="default" value="">
                    Select Time range
                  </option>
                  <option value="day">By Day</option>
                  <option value="week">By Week</option>
                  <option value="month">By Month</option>
                  <option value="year">By Year</option>
                </select>

                <select value={selectedMonth} onChange={handleselectedMonthChange}> 
                  <option key="default" value="">
                    Select Month
                  </option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>

            </FormGroup>
      
            <FormGroup>
            <Button color="white"  onClick={() => setShowInventoryTable(!showInventoryTable)} className="position-absolute"  style={{ top: '100px', left: '60px' }}>
              {showInventoryTable
                ? "Hide Inventory Table"
                : "Show Inventory Table"}
            </Button>
            </FormGroup>
            {error && <div className='text-danger'>{error}</div>}
          </Form>
          </Col>
        </Row>
          {/* Render graph */}
          <Col className="d-flex flex-column align-items-center">
            <h1>Graph for {recentTimeDate || selectedMonth} of {selectedProductName}</h1>
            <LineChart
              width={800}
              height={400}
              data={product_id === "all" ? graph : graph.filter((item) => item.product_id === parseInt(product_id))}
            >
              <CartesianGrid stroke="#ccc" />
              <XAxis
                dataKey="time"
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -8}}
                tickFormatter={(time) => {
                  const date = new Date(time);
                  if (recentTimeDate === "day") {
                    const Time = new Date(date.getTime() + (4 * 60 * 60000));
                    const hours = Time.getHours();
                    return `${hours < 10 ? '0' : ''}${hours}:${"00"}`; //if less then 10 add 0 in front like 07:00
                  } else if (recentTimeDate === "week") {
                    // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
                    const dayOfWeek = date.getDay();
                    // Define an array of day names
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    // Return the corresponding day name
                    return daysOfWeek[dayOfWeek];
                  } else if (recentTimeDate === "month") {
                    const weekOfMonth = Math.ceil(date.getDate() / 7); // Calculate week number of the month
                    return `Week ${weekOfMonth}`;
                  } else if (recentTimeDate === "year") {
                    // Get the month of the year (0 for January, 1 for February, etc.)
                    const month = date.getMonth();
                    // Define an array of month names
                    const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nove', 'Dec'];
                    // Return the corresponding month name
                    return monthsOfYear[month];
                  } 
                  // Default case, return the time as is
                  return time;
                }}
              />
              <YAxis label={{ value: "Quantity", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              {product_id === "all" && Array.from(new Set(graph.map(item => item.product_id))).map((productId) => (
                <Line
                  key={productId}
                  type="monotone"
                  dataKey="quantity"
                  data={graph.filter((item) => item.product_id === productId)}
                  stroke={`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`}
                  fill={`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.2)`}
                  name={`Product ${productId}`}
                />
                ))
              }
              {product_id !== "all" && (
                <Line
                  type="monotone"
                  dataKey="quantity"
                  stroke="rgba(75, 192, 192, 1)"
                  fill="rgba(75, 192, 192, 0.2)"
                />
              )}
            </LineChart>

            </Col>
          {/* Render graph table */}
          {showInventoryTable &&(
          <Row>
            <Col className="text-center">
            <h1>Table for {recentTimeDate} of {selectedProductName}</h1>
            <Table striped bordered>
              <thead>
                  <tr>
                    <th>Graph Id</th>
                    <th>Product Id</th>
                    <th>Quantity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {product_id === "all" ? (graph.map((item, index) => (
                    <tr key={index}>
                      <td>{item.graph_id}</td>
                      <td>{item.product_id}</td>
                      <td>{item.quantity}</td>
                      <td>{item.time}</td>
                    </tr>
                  ))
                  ) : (
                    graph
                    .filter(
                      (item: GraphItem) => item.product_id === parseInt(product_id)
                    )
                    .map((item, index) => (
                      <tr key={index}>
                        <td>{item.graph_id}</td>
                        <td>{item.product_id}</td>
                        <td>{item.quantity}</td>
                        <td>{item.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
          </Col>
        </Row>
      )}
      </Container>
    </div>
  );
};

export default InventoryGraph;