import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";
import './LandingPage.css';
import {  Button, Container } from 'reactstrap';


/*
LANDING PAGE, suraiya
User can go to login or to register. 
*/
const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    
    const handleLogin = () => {
        navigate("/login");
    };

    const handleSignUp = () => {
        navigate("/register_pt1");
    }

    return (
      <Container className="mt-5">
        <div className="jumbotron text-center">
          <h1 className="display-4">smart-stock</h1>
          <p className="lead">Inventory management for businesses.</p>
          <hr className="my-4" />
          <p>Click the buttons below to navigate.</p>
          <div className="d-flex justify-content-center">
            <Button className='lp-button-stuff' color='primary' onClick={handleLogin}>Login</Button>
            <Button className='lp-button-stuff' color='primary' onClick={handleSignUp}>Sign up</Button>
          </div>
        </div>
      </Container>
    );
};
  
  export default LandingPage;
  