import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css'
import { Alert, Form, FormGroup, Table, Container, Row, Col, Input, Label } from "reactstrap";
import { Box, CssBaseline, Grid, TextField, Typography, Button} from "@mui/material";
import { Link } from "react-router-dom";

/*
REGISTRATION PT 1, suraiya
Retrieves registration data entered by the user (first name, last name, email). Sends data to the backend via HTTP requests. Handles the response 
from the backend by displaying the messages. 
*/
const Registration: React.FC = () => {
  // Store data into variables as they type. Also stores the error message into a variable to render to user. 
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
 


  const [error, setError] = useState<string>('');
  const navigate = useNavigate();




  const handleRegistrationPT1 = async () => {
    try {
      // console logging for debugging 
      console.log('First Name: ', firstName);
      console.log('Last Name: ', lastName);
      console.log('Email: ', email);
    


      // Verify that all required boxes have been filled. If not set the error message to be displayed.
      if (
        firstName === "" ||
        lastName === "" ||
        email === "" 
      ) {
        setError("Please complete the required boxes.");
        return;
      }
      
      /* TRYING TO DO API REQUEST FOR EMAIL VERIFICATION BUT FAILED FOR NOW?
      const emailValidationResponse = await fetch('http://127.0.0.1:5000/email_validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (emailValidationResponse.ok) {
        const validationData = await emailValidationResponse.json();
        console.log(validationData. is_valid_format.value)
        console.log(validationData.is_free_email.value)
        console.log(!validationData.is_disposable_email.value)
        console.log(!validationData.is_role_email.value)
        console.log(validationData.is_mx_found.value)
        console.log(validationData.is_smtp_valid.value)
        if (
          validationData.is_valid_format.value &&
          validationData.is_free_email.value &&
          !validationData.is_disposable_email.value &&
          !validationData.is_role_email.value &&
          validationData.is_mx_found.value &&
          validationData.is_smtp_valid.value
        )  {
          */

          // Send the information to the backend to process. If the registration is successful, navigate to login. If not, display error. 
          const response = await fetch('http://127.0.0.1:5000/register_pt1', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email}), // Information to send
          });
          localStorage.setItem('email', email)
    
          if (response.ok) { // Navigate to login if backend response is successful
            navigate('/register_pt2');
          } else { // Set error message to be rendered to screen if backend returns unsuccessful
            const errorMessage = await response.json();
            setError(errorMessage.message);
            //console.log(errorMessage) 
          }
          /* MORE EMAIL VERIFICATION THAT DIDN'T WORK. 
        } else {
          // Email is invalid
          setError("Invalid email address.");
          return;
        }
      } else {
        setError("Error with email validation.");

      }
      */
      
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
            <Typography variant="h5">Register PT 1</Typography>
            <Box sx = {{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="First Name"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  ></TextField>
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  ></TextField>
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  ></TextField>
                </Grid>
              </Grid>
  
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2}}
                onClick={handleRegistrationPT1}
              >
                Next
              </Button>
              {error && <Alert color="danger">{error}</Alert>}
  
              <Grid container justifyContent="flex-start">
                <Grid item>
                  <p>Already have an account? <Link to="/login">Login &gt;</Link></p>

                  {/*<Link to="/login">Already have an account? Login</Link>*/}
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </>
    )
  };

export default Registration;