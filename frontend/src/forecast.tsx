//forecast.tsx Nick
/**
 * This forecast page will help users track KPI goals for different products
 * Users may set a target profit for a product and obtain a recommended retail price
 * on a monthly or quarterly basis.
 * Print button allows users to save a record of the KPI goals
 */
import { useState, useEffect, useRef } from "react";
import "./forecast.css";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import NavBar from './NavBar'

// Define product forecast interface
interface ForecastItem {
  product_id: number;
  barcode: string;
  product_name: string;
  fprofit: number;
  funit: number;
  fcost: number;
}

const ForecastTable: React.FC = () => {
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
  //define forecast item list
  const [forecast, setForecast] = useState<ForecastItem[]>([]);

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

      // Map fetched data to ForecastItem interface
      // set initial values of profit, unit and cost to be 0
      const ForecastItems: ForecastItem[] = data.product.map((item: any) => ({
        product_id: item.product_id,
        barcode: item.barcode,
        product_name: item.product_name,
        fprofit: 0,
        funit: 0,
        fcost: 0,
      }));

      console.log("Product Data:", data); // Log fetched data
      setForecast(ForecastItems); // Update inventory state with fetched data
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  //https://www.codevertiser.com/editable-text-field-in-table-using-reactjs/
  //Edit forecast table function
  const handleEditInput = (e: any, product_id: any) => {
    //decompose event target into name and value
    const { name, value } = e.target;

    //map the previous value from forecast product list
    //match the product id and update the associated value to be the new input value
    const editData = forecast.map((prevValue) =>
      prevValue.product_id === product_id && name
        ? { ...prevValue, [name]: value }
        : prevValue
    );

    //update the information on the table
    setForecast(editData);
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
  //create a sorted list of forecast items
  const sortedForecast = [...forecast].sort((stockA, stockB) => {
    if (sortBy) {
      //if sortby has a value
      const aValue = stockA[sortBy as keyof ForecastItem];
      const bValue = stockB[sortBy as keyof ForecastItem];
      //compare the values of stock A & B, return -1 for ascending or 1 for descending
      //otherwise return 0
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  return (
    <div>
      <NavBar/>
      <div ref={printRef} className="forecast-container">
        <style>{pageStyle}</style>

        <button onClick={handlePrint}>Print Me Out</button>
        <h1 className="title">🚀🚀🚀 Set Your KPIs 💪💪💪</h1>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("barcode")}>Product Barcode</th>
              <th onClick={() => handleSort("product_name")}>Product Name</th>
              <th>Target Profit</th>
              <th>Forecast Units</th>
              <th>Unit Cost</th>
              <th>Suggested Price</th>
            </tr>
          </thead>
          <tbody>
            {sortedForecast.map(
              ({ product_id, barcode, product_name, fprofit, funit, fcost }) => (
                <tr key={product_id}>
                  <td>{barcode}</td>
                  <td>{product_name}</td>
                  <td>
                    <input
                      name="fprofit"
                      value={fprofit}
                      type="number"
                      onChange={(e) => handleEditInput(e, product_id)}
                      placeholder="Estimated Profit"
                    />
                  </td>
                  <td>
                    <input
                      name="funit"
                      value={funit}
                      type="number"
                      onChange={(e) => handleEditInput(e, product_id)}
                      placeholder="Estimated Units"
                    />
                  </td>
                  <td>
                    <input
                      name="fcost"
                      value={fcost}
                      type="number"
                      onChange={(e) => handleEditInput(e, product_id)}
                      placeholder="Estimated Cost"
                    />
                  </td>
                  <td>{(fprofit / funit - -fcost).toFixed(2)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForecastTable;