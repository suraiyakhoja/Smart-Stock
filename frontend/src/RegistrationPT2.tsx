// SURAIYA KHOJA 

// username, pass
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css'
//import { Form, Button } from 'react-bootstrap';
import { Alert, Table, Container } from "reactstrap" 
import { Box, CssBaseline, Grid, TextField, Typography, Button} from "@mui/material";
/*
REGISTRATION PT 2, suraiya
Retrieves registration data (username, password) entered by the user. Sends data to the backend via HTTP requests. Handles the response 
from the backend by displaying the messages. 
*/
const RegistrationPT2: React.FC = () => {
  // Store data into variables as they type. Also stores the error message into a variable to render to user. 
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmedPassword] = useState<string>('');



  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const handleRegistrationPT2 = async () => {
    try {
      // console logging for debugging 

      console.log('Username: ', username);
      console.log('Password: ', password);
      console.log('Confirm Password: ', confirmPassword);
    

      // Verify that password and confirmPassword are the same. If not set the error message to be displayed. 
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return;
      }


      // Verify that all required boxes have been filled. If not set the error message to be displayed.
      if (
        username === "" ||
        password === "" ||
        confirmPassword === "" 
      ) {
        setError("Please complete the required boxes.");
        return;
      }
      
 

          // Send the information to the backend to process. If the registration is successful, navigate to login. If not, display error. 
          const response = await fetch('http://127.0.0.1:5000/register_pt2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, confirmPassword, email }), // Information to send
          });
    
          if (response.ok) { // Navigate to login if backend response is successful
            navigate('/register_pt3');
          } else { // Set error message to be rendered to screen if backend returns unsuccessful
            const errorMessage = await response.json();
            setError(errorMessage.message);
            //console.log(errorMessage) 
          }
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  /*
    Render the following to the screen. Places account information into variables and handles click on registration. If the 
    registration is unsuccessful, renders the error message to the screen. 
  */

  return (
    <>
      <Container maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            mt: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img src="/logo.png" alt="logo" style={{ width: '150px', height: 'auto', marginBottom: '20px' }} />
          <Typography variant="h5">Register PT 2</Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                ></TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="password"
                  required
                  fullWidth
                  id="password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                ></TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="confirm password"
                  required
                  fullWidth
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmedPassword(e.target.value)}
                ></TextField>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleRegistrationPT2}
            >
              Next
            </Button>
            {error && <Alert color="danger">{error}</Alert>}

          </Box>
        </Box>

      </Container>
      
    </>
  )
};


export default RegistrationPT2;