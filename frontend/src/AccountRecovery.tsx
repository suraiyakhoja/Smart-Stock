import React, {  FormEvent, useState } from 'react';
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import {  Alert, Button, Label, Form, Input, Container, Col } from 'reactstrap';


/*
ACCOUNT RECOVERY, suraiya 
If user forgets password, they are directed to this page, where they can enter the email they used 
when registering. Call to backend makes sure there is an account associated with the given email. 
If successful, user is redirected to the page to enter the verification code they receive by email. 
*/
const AccountRecovery: React.FC = () => {

  // Set data entered by users into variables. 
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const navigate = useNavigate();

  // After user submits email, backend call is made to confirm an account associated with email exists. 
  const handleAccountRecovery = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      try {
        // Sends backend request with email 
        const response = await fetch('http://127.0.0.1:5000/account_recovery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
            body: JSON.stringify({ email })
        });

        // If email exists in database, stores email in local storage and navigates to verify_code 
        if (response.ok) {
          localStorage.setItem('emailForRecovery', email);
          // https://stackoverflow.com/questions/72017435/how-can-i-pass-parameters-to-route-with-navigate-function-in-react
          navigate('/verify_code');

        } else { 
          // If email does not exist, error 
          if (response.status === 404) {
            setEmailError('Email not found.');
          }
            console.log('Account recovery failed');

            const errorMessage = await response.json();
            setError(errorMessage.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }

  };

  return (
    <Container>
      <Col className='text-left'>
        <div className="container d-flex justify-content-center align-items-center vh-100">
          <div className="card p-4" style={{ border: 'none' }}>
            <h1 className="display-4 text-left mb-4 font-weight-bold" style={{ fontSize: '2rem' }}>Account Recovery</h1>
            <Form onSubmit={handleAccountRecovery}>
              <div className="form-row mb-3">
                <div className="col">
                  <Label htmlFor="email">Enter email</Label>
                  <Input
                    type="text"
                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {emailError && <div className="invalid-feedback">{emailError}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="col">
                  {error && <Alert color="danger" style= {{ width: '100%', marginTop: '10px' }}>{error}</Alert>}
                  <Button type="submit" className="btn btn-primary btn-block rounded-pill" color='primary'>Submit</Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Col>
    </Container>
  );
};

export default AccountRecovery;      