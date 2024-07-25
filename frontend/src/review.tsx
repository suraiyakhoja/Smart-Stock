//review.tsx Nick
/**
 * This review page will help users review different products based on various aspects.
 * Profit margin is the product sales price less cost, which measures how profitable a product is.
 * Volume measures sales volume of a product over a period(a week, a month or a quarter).
 * Return rate measures the quality of product. High return rate indicates poor quality.
 * Competition measures current competition of similar product in the market.
 * Decision indicates proposed action: promote, keep or drop.
 * Remark allows any additional comments on a product.
 * Print button allows users to save a record of the product review.
 */
import { useState, useEffect, useRef } from "react";
import "./review.css";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import NavBar from './NavBar'

// Define product review interface
interface ReviewItem {
  product_id: number;
  barcode: string;
  product_name: string;
  remark: string;
}

const ReviewTable: React.FC = () => {
  //https://www.npmjs.com/package/react-to-print
  //define print reference
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  //https://developer.mozilla.org/en-US/docs/Web/CSS/@page
  //define print page style
  const pageStyle = `
  @media print {
    @page { 
      size: landscape; 
      margin: 5%;
    }
    button {
      display: none;
    }
  }
  `;
  //define review item list
  const [review, setReview] = useState<ReviewItem[]>([]);

  //define sorting for table columns
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const navigate = useNavigate();


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

      // Map fetched data to ReviewItem interface
      // set initial values of profit, unit and cost to be 0
      const ReviewItems: ReviewItem[] = data.product.map((item: any) => ({
        product_id: item.product_id,
        barcode: item.barcode,
        product_name: item.product_name,
        remark: " ",
      }));

      console.log("Product Data:", data); // Log fetched data
      setReview(ReviewItems); // Update inventory state with fetched data
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  //https://www.codevertiser.com/editable-text-field-in-table-using-reactjs/
  //Edit review table function
  const handleEditInput = (e: any, product_id: any) => {
    //decompose event target into name and value
    const { name, value } = e.target;

    //map the previous value from review product list
    //match the product id and update the associated value to be the new input value
    const editData = review.map((prevValue) =>
      prevValue.product_id === product_id && name
        ? { ...prevValue, [name]: value }
        : prevValue
    );

    //update the information on the table
    setReview(editData);
  };

  //When an user clicks on the decision box and selects an option,
  //an alert box with the option and product ID will pop up
  const handleDecision = (e: any, product_id: any) => {
    //decompose event target into name and value
    const { name, value } = e.target;

    //map the previous value from review product list
    const decisionData = review.map((prevValue) =>
      prevValue.product_id === product_id && name
        ? { ...prevValue, [name]: value }
        : prevValue
    );
    //update the information on the table
    setReview(decisionData);

    //Switch case that outputs different alerts based on user's decision
    switch (value) {
      case "promote":
        alert(
          `Your Current Decision Is To \n\nPROMOTE Product ID#${product_id}`
        );
        break;
      case "keep":
        alert(`Your Current Decision Is To \n\nKEEP Product ID#${product_id}`);
        break;
      case "drop":
        alert(`Your Current Decision Is To \n\nDROP Product ID#${product_id}`);
        break;
      default:
        alert(`Decision Time!\n\nPromote, Keep or Drop this product?`);
    }
  };

  //for product barcode and product name
  //once table head is toggled, the column is sorted in ascending or descending order
  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnName);
      setSortDirection("asc");
    }
  };

  //https://www.smashingmagazine.com/2020/03/sortable-tables-react/
  //create a sorted list of review items
  const sortedReview = [...review].sort((stockA, stockB) => {
    if (sortBy) {
      //if sortby has a value
      const aValue = stockA[sortBy as keyof ReviewItem];
      const bValue = stockB[sortBy as keyof ReviewItem];
      //compare the values of stock A & B, return -1 for ascending or 1 for descending
      //otherwise return 0
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  //review table displays categories that help measure a product's performance
  //user will get an alert box when they make decision for a product
  return (
    <div>
      <NavBar/>
      <div ref={printRef} className="review-container">
        <style>{pageStyle}</style>
        <button onClick={handlePrint}>Print Me Out</button>
        <h1 className="title"> 🖊🖊🖊 Product Review ✂✂✂</h1>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("barcode")}>Product Barcode</th>
              <th onClick={() => handleSort("product_name")}>Product Name</th>
              <th>Profit Margin</th>
              <th> Volume </th>
              <th> Return Rate</th>
              <th> Competition</th>
              <th> Decision </th>
              <th> Remark </th>
            </tr>
          </thead>
          <tbody>
            {sortedReview.map(({ product_id, barcode, product_name, remark }) => (
              <tr key={product_id}>
                <td>{barcode}</td>
                <td>{product_name}</td>
                <td>
                  <select>
                    <option> </option>
                    <option> Very High </option>
                    <option> High </option>
                    <option>Moderate</option>
                    <option> Low </option>
                    <option> Very Low </option>
                  </select>
                </td>
                <td>
                  <select>
                    <option> </option>
                    <option> Very High </option>
                    <option> High </option>
                    <option>Moderate</option>
                    <option> Low </option>
                    <option> Very Low </option>
                  </select>
                </td>
                <td>
                  <select>
                    <option> </option>
                    <option> Very High </option>
                    <option> High </option>
                    <option>Moderate</option>
                    <option> Low </option>
                    <option> Very Low </option>
                  </select>
                </td>
                <td>
                  <select>
                    <option> </option>
                    <option> Very High </option>
                    <option> High </option>
                    <option>Moderate</option>
                    <option> Low </option>
                    <option> Very Low </option>
                  </select>
                </td>
                <td>
                  <div>
                    <select
                      name="decision"
                      onChange={(e) => handleDecision(e, product_id)}
                    >
                      <option> </option>
                      <option value="promote"> Promote </option>
                      <option value="keep"> Keep </option>
                      <option value="drop"> Drop </option>
                    </select>
                  </div>
                </td>

                <td>
                  <input
                    name="remark"
                    value={remark}
                    type="string"
                    onChange={(e) => handleEditInput(e, product_id)}
                    placeholder="Keep or Drop"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;