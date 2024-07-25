import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css'
//import { Form, Button } from 'react-bootstrap';
import { Alert, Table, Container } from "reactstrap" 
import { Box, CssBaseline, Grid, TextField, Typography, Button, FormControl, InputLabel} from "@mui/material";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

/*
REGISTRATION PT 3, suraiya 
Retrieves registration data entered by the user (company, address, role). Sends data to the backend via HTTP requests. Handles the response 
from the backend by displaying the messages. 
*/
const RegistrationPT3: React.FC = () => {
  // Store data into variables as they type. Also stores the error message into a variable to render to user. 
  const [company, setCompany] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [role, setRole] = useState<string>('');


  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');


  const handleRegistrationPT3 = async () => {
    try {
        // console logging for debugging 
        console.log('company', company)
        console.log('Address:', address);
        console.log('Role:', role);


      // Verify that all required boxes have been filled. If not set the error message to be displayed.
      if (
        company === "" ||
        address === "" ||
        role === ""
      ) {
        setError("Please complete the required boxes.");
        return;
      }
    
          // Send the information to the backend to process. If the registration is successful, navigate to login. If not, display error. 
          const response = await fetch('http://127.0.0.1:5000/register_pt3', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company, address, role, email }), // Information to send
          });
    
          if (response.ok) { // Navigate to login if backend response is successful
            localStorage.removeItem('email');
            navigate('/');
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
          <Typography variant="h5">Register PT 3</Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="company"
                  required
                  fullWidth
                  id="company"
                  label="Company"
                  autoFocus
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                ></TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="address"
                  required
                  fullWidth
                  id="address"
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                ></TextField>
              </Grid>

              <Grid item xs={12} sx={{ marginBottom: '16px' }}>
                <FormControl fullWidth sx={{ width: '100%', marginBottm: '16px' }}>
                  <InputLabel id="role">Role</InputLabel>
                  <Select
                    labelId="role"
                    id="role"
                    value={role}
                    label="Role"
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <MenuItem value={""}>Select Role</MenuItem>
                    <MenuItem value="Boss">Boss</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Worker">Worker</MenuItem>
                  </Select>

                </FormControl>
              </Grid>

           
            </Grid>
            
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleRegistrationPT3}
            >
              Register!
            </Button>
            {error && <Alert color="danger">{error}</Alert>}

          </Box>
        </Box>
      </Container>
    </>
  )
};

export default RegistrationPT3;