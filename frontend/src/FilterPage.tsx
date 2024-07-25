// Suraiya 
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Category, Variant, Product } from './Interface'
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Button, Table, Container, Row, Col, Input, Label } from "reactstrap" 
import {ArrowLeft} from 'react-bootstrap-icons'
import NavBar from './NavBar'



/*
  Displays filtering options to the user. User can filter by categories and variants. Products with the selected 
  categories and/or variants are displayed to user. 
*/
const FilterPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Stores selected category 
  const handleCategoryChange = (categoryID: number) => {
    setSelectedCategory(selectedCategory === categoryID ? null : categoryID);
  };
  
  // Stores selected variant 
  const handleVariantChange = (variantID: number) => {
    setSelectedVariant(selectedVariant === variantID ? null : variantID);
  };
  
  // Fetches data 
  useEffect(() => {
    fetchCategoriesAndVariants();
  }, []);

  /*
    Calls filter_page route in the backend to retrieve the categories and variants stored in the database.
    Once retrieved, renders to the screen. 
  */
    const fetchCategoriesAndVariants = () => {
      fetch("http://127.0.0.1:5000/filter_page", { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
          const parsedCategories: Category[] = data.categories.map(
            (category: any) => ({
              categoryID: category[0],
              categoryName: category[1],
              categoryDescription: category[2],
            })
          );
          setCategories(parsedCategories);
  
          const parsedVariants: Variant[] = data.variants.map((variant: any) => ({
            variantID: variant[0],
            variantName: variant[1],
            variantDescription: variant[2],
          }));
          setVariants(parsedVariants);
        })
        .catch((error) => {
          console.error("Error fetching categories and variants:", error);
        });
    };

  /*
    Retrieves filtered products with the given category and variant as parameters. Calls filter_products route
    to find the products with corresponding category/variant in the database. Stores it for rendering. 
  */
  const fetchProducts = () => {
    let url = 'http://127.0.0.1:5000/filter_products';

    if (selectedCategory !== null) {
      url += `?category=${selectedCategory}`;
    }
    if (selectedVariant !== null) {
      url += `${selectedCategory ? '&' : '?'}variant=${selectedVariant}`;
    }
  
    fetch(url, { method: 'GET' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        return response.json() as Promise<any[]>;
      })
      .then(data => {
        console.log('Fetched products:', data); 
        const products: Product[] = data.map(item => ({
          productID: item[0],
          barcode: item[1],
          productName: item[2],
          productDescription: item[3],
          productCategory: item[4],
          variantID: item[5],
        }));
        console.log("Mapped products:", products);
        setProducts(products);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedVariant]);


  return (
    <div>
      <NavBar/>
      <Container className="py-5">
        <h1 className="text-center mb-4">Filter Products</h1>
        <Row>
          <Col xs={12} md={4}>
            <div className="d-flex flex-column align-items-center mb-3">
              <h2>Categories</h2>
              <Form>
                <FormGroup>
                  {categories.map((category) => (
                    <FormGroup check key={category.categoryID}>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={selectedCategory === category.categoryID}
                          onChange={() => handleCategoryChange(category.categoryID)}
                        />
                        {category.categoryName}
                      </Label>
                    </FormGroup>
                  ))}
                </FormGroup>
              </Form>
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="d-flex flex-column align-items-center mb-3">
              <h2>Variants</h2>
              <Form>
                <FormGroup>
                  {variants.map((variant) => (
                    <FormGroup check key={variant.variantID}>
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={selectedVariant === variant.variantID}
                          onChange={() => handleVariantChange(variant.variantID)}
                        />
                        {variant.variantDescription}
                      </Label>
                    </FormGroup>
                  ))}
                </FormGroup>
              </Form>
            </div>
          </Col>
          <Col xs={12} md={4}>
            <div className="d-flex flex-column align-items-center mb-3">
              <h2>Products</h2>
              <ul className="list-unstyled">
                {products.map((product) => (
                  <li key={product.productID}>{product.productName}</li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FilterPage;