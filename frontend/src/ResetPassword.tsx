import React, {  FormEvent, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import {  Alert, Label, Form, Input, Container, Col } from 'reactstrap';
import { Box, CssBaseline, Grid, TextField, Typography, Button} from "@mui/material";

/*
RESET PASSWORD, suraiya
Users can reset password if they forget it. 
*/
const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmedPassword] = useState<string>('');    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    
    const handleReset = async () => {
    //const handleReset = async (e: FormEvent<HTMLFormElement>) => {
       // e.preventDefault();

        // Verify that password and confirmPassword are the same. If not set the error message to be displayed. 
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return;
        }

        // Verify that all required boxes have been filled. If not set the error message to be displayed.
        if (
            password === "" ||
            confirmPassword === "" 
        ) {
            setError("Please complete the required boxes.");
            return;
        }

        

        try {
          // Request to backend to update password
          const response = await fetch('http://127.0.0.1:5000/reset_password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                  password, confirmPassword,
                  //email: localStorage.getItem('emailForRecovery'),
                  email: localStorage.getItem('emailForRecovery'),


              }), // Information to send
            });

            if (response.ok) { // Navigate to login if backend response is successful
              localStorage.removeItem('emailForRecovery')
              navigate('/');
            } else { // Set error message to be rendered to screen if backend returns unsuccessful
              const errorMessage = await response.json();
              setError(errorMessage.message);
              //console.log(errorMessage) 
            }
          } catch (error) {
              console.error('Error:', error);
          }

      };

      return (
        <>
          <Container maxWidth="xs">
            <CssBaseline>
              <Box
                sx={{
                  mt: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">Reset Password</Typography>
                <Box sx= {{ mt: 3 }}>
                  <Grid container spacing={2}>
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
                  {error && <Alert color="danger" style={{ marginTop: '16px' }}>{error}</Alert>}


                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleReset}
                  >
                    Reset Password
                  </Button>


                </Box>
              </Box>
            </CssBaseline>
          </Container>
        </>
      )
    };
  
  export default ResetPassword;














