import React, {  FormEvent, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Form, Input, Container, Col } from 'reactstrap';

/*
VERIFY CODE, suraiya
https://stackoverflow.com/questions/72017435/how-can-i-pass-parameters-to-route-with-navigate-function-in-react
User receives code in email and enters it on this page. Request made to backend to confirm verification
code entered by user matches code in database. 
*/
const VerifyCode: React.FC = () => {
  // Set data entered in variables 
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  /*
  CODE SUBMITTED
  User enters code and request is made to backend to confirm code matches with code in database
  */
  const handleCodeSubmission = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const email = localStorage.getItem('emailForRecovery')

      console.log('Email:', email);
      console.log('Verification Code:', code);

      try {
        // Request to backend to verify codes match. 
        const response = await fetch('http://127.0.0.1:5000/verify_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            /*body: JSON.stringify({ 
              email: localStorage.getItem('emailForRecovery'),
              verification_code: code*/
              body: JSON.stringify({ email, code })
        });

        // Navigate to reset password page if successful
        if (response.ok) {
          localStorage.removeItem('emailForRecovery')
          navigate('/reset_password');
        } else { 
            
            console.log('verify code failed failed');

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
            <h1 className="display-4 text-left mb-4 font-weight-bold" style={{ fontSize: '2rem' }}>Verify Code</h1>
            <Form onSubmit={handleCodeSubmission}>
              <div className="form-row mb-3">
                <div className='col'>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>
              <div className='form-row'>
                {error && <Alert color="danger" style={{ width: '100%', marginTop: '10px' }}>{error}</Alert>}
                <Button type="submit" className="btn btn-primary btn-block rounded-pill" color='primary'>Submit</Button>
              </div>
            </Form>
          </div>
        </div>
      </Col>
    </Container>
  );
}

export default VerifyCode;