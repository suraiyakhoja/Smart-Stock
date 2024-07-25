import React, { useState } from 'react';

/*
ADDRESS MODAL, suraiya 
Modal to display address options. 
*/
interface AddressModalProps {
  addresses: string[];
  onAddAddress: (newAddress: string) => void;
  onDeleteAddress: (index: number) => void;
  onClose: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ addresses, onAddAddress, onDeleteAddress, onClose }) => {
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = () => {
    if (newAddress.trim() !== '') {
      onAddAddress(newAddress);
      setNewAddress('');
    }
  };
  
  const modalStyle : React.CSSProperties = {
    display: 'block',
    position: 'fixed',
    zIndex: 1000, 
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    backgroundColor: '#fefefe',
    padding: '20px',
    border: '1px solid #888'
  };
  
  const modalContentStyle = {
    backgroundColor: '#fefefe',
    margin: 'auto',
    padding: '20px',
    border: '1px solid #888',
    width: '80%',
    maxWidth: '600px'
  };

  const closeStyle = {
    color: '#aaa',
    fontSize: '28px',
    fontWeight: 'bold'
  };
 

  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <span className="close" style={closeStyle} onClick={onClose}>&times;</span>
        <h3>Manage Addresses</h3>
        <ul>
          {addresses.map((address, index) => (
            <li key={index}>
              {address}
              <button onClick={() => onDeleteAddress(index)}>Delete</button>
            </li>
          ))}
        </ul>
        <div>
          <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
          <button onClick={handleAddAddress}>Add Address</button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
