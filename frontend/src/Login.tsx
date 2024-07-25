// SURAIYA KHOJA 
import React, {  FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert, Form, FormGroup, Button, Container, Row, Col, Input, Label } from "reactstrap" 



/*
  LOGIN, suraiya 
  https://www.youtube.com/watch?v=sBw0O5YTT4Q
  https://www.youtube.com/watch?v=jwEbw0zJqiY
  Retrieves login data entered by the user. Sends data to the backend via HTTP requests. Handles the response 
  from the backend by displaying the messages. 
*/
const Login: React.FC = () => {
  // Store username and password into variables as they type. Also stores the error message into a variable to render to user. 
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /*
    Receives username and password from user and sends it to the backend to handle. 
    Given the response from the backend, renders the appropriate message to the screen. 
  */
  //const handleLogin = async () => {
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log('Sending login request:', { username, password });
      console.log('Username: ', username);
      console.log('Password: ', password);
      const response = await fetch('http://127.0.0.1:5000/login', { // request to backend with specific parameters 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      console.log('Received login response:', response);
      if (response.ok) { // handle successful response by navigating to the dashboard 
        // Successful login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username)
        console.log('Login successful');
        navigate('/dashboard');
      } else { // handle unsuccessful response by setting error message to be rendered
        // Failed login
        console.log('Login failed');

        const errorMessage = await response.json();
        setError(errorMessage.message);
        //setErrora('Invalid username or password');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };



  /*
    Render the following to the screen. Places username and password into variables and handles click on login. If the login is
    unsuccessful, renders the error message to the screen.
    Button to register if user does not have an account navigates to the registration page. 
  */
    return (
      <Container className='mt-6'>
        <Row className='justify-content-center'>
          <Col xs={12} md={6} style={{paddingLeft: '120px'}}>
            <h1 className="display-4 text-start mb-4 font-weight-bold" style={{ fontSize: '2rem' }}>Sign In</h1>
            <Form onSubmit={handleLogin}>
              <FormGroup>
                <Label htmlFor='username'>Username</Label>
                <Input
                  type='text'
                  className='form-control'
                  id='username'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                ></Input>
              </FormGroup>
  
              <FormGroup>
                <Label htmlFor='password'>Password</Label>
                <Input
                  type='password'
                  className='form-control'
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                ></Input>
              </FormGroup>
              {error && <Alert color="danger" style= {{ width: '95%' }}>{error}</Alert>}
  
              <FormGroup>
                <Button color="primary" className="btn btn-primary btn-block rounded-pill" type='submit'>Sign In</Button>
              </FormGroup>
  
              <FormGroup className='mt-3 text-start'>
                <p>Don't have an account? <Link to="/register_pt1">Sign up for SmartStock &gt;</Link></p>
                <p><Link to="/account_recovery">Forgot your password? &gt;</Link></p>
              </FormGroup>
            </Form>
          </Col>
          {windowWidth >= 768 && ( 
            <Col md={6}>
              <div className="image-container">
                <img src="/login.png" alt="pic" />
              </div>
            </Col>
          )}
        </Row>
      </Container>
    );
  };
  
  export default Login;