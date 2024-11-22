import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Form } from 'react-bootstrap';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BillPage.css';
import logo from './logoUrl.png'; // Import the logo image

const BillPage = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Set to today's date
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get('http://localhost:5000/bills');
        console.log('Fetched bills:', response.data);
        setBills(response.data);
        filterBills(selectedDate, searchTerm); // Filter bills with initial date
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };

    fetchBills();
  }, []); // Empty dependency array to run once on component mount

  useEffect(() => {
    filterBills(selectedDate, searchTerm); // Filter bills whenever selectedDate or searchTerm changes
  }, [selectedDate, searchTerm, bills]); // Add bills to dependencies to filter when data is fetched

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  const handlePrint = (bill) => {
    const logoUrl = logo;
    const createdAt = new Date(bill.createdAt).toLocaleString();

    const printWindow = window.open('', '', 'height=600,width=800');
    const printContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print Bill</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
    }
    
    .header h3, .header h6, .header h1 {
      margin: 0;
      padding: 0;
    }
    .header hr {
      border: none;
      border-top: 1px dotted #000;
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
   
    th {
      border-bottom: 1px dotted #000;
      font-weight: bold;
      background-color: #f4f4f4;
    }
    .total-row td {
      border-top: 1px dotted #000;
      border-bottom: 1px dotted #000;
      font-weight: bold;
    }
    .footer p {
      margin: 0;
      font-size: 9px;
      color: #000;
      font-weight: 600;
      margin-left:0px;
    }
  </style>
</head>
<body>
  <div class="container">
  <div class="section">
      <p class="date">${createdAt}</p>
    </div>
    <div class="header">
      <h1>குமரன் பவன்</h1>
      <h6>15/15, தாழையாத்தம் பஜார்,<br>(சௌத் இண்டியன் பேங்க் எதிரில்) குடியாத்தம். Ph:9894470116</h6>
      <hr>
      <h3>Cash Bill</h3>
      <hr>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Name</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${bill.selectedProducts.map((product, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${product.name}</td>
              <td>₹${product.price.toFixed(2)}</td>
              <td>${product.quantity}</td>
              <td>₹${(product.total * product.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4">Total:</td>
            <td><b>₹${bill.totalAmount.toFixed(2)}</b></td>
          </tr>
          
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Billing Partner CORPWINGS IT SERVICE 6380341944</p>
    </div>
  </div>
</body>
</html>

    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.print();
  };

  const handlePrintFilteredBills = () => {
    if (filteredBills.length === 0) {
      alert('No bills found for the selected date.');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print Filtered Bills</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
    }
    .header h1, .header h6, .header h3 {
      margin: 0;
      padding: 0;
    }
    .header hr {
      border: none;
      border-top: 1px dotted #000;
      margin: 5px 0;
    }
    .section {
      margin-top: 10px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      border-bottom: 1px dotted #000;
      font-weight: bold;
      background-color: #f4f4f4;
    }
    .footer p {
      margin: 0;
      font-size: 11px;
      color: #000;
      font-weight: 600; /* Set font weight to normal */
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>குமரன் பவன்</h2>
      <h6>15/15, தாழையாத்தம் பஜார்,<br>(சௌத் இண்டியன் பேங்க் எதிரில்) குடியாத்தம். Ph:9894470116.</h6>
      <hr>
      <h3>Bills for ${new Date(selectedDate).toLocaleDateString()}</h3>
      <hr>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Total Amount</th>
            <th>Date and Time</th>
          </tr>
        </thead>
        <tbody>
          ${filteredBills.map((bill, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>₹${bill.totalAmount.toFixed(2)}</td>
              <td>${formatDate(bill.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h4>Total Amount: ₹${totalAmount}</h4>
      <hr style="border: none; border-top: 1px dotted #000;">
    </div>

    <div class="footer">
      <p>Billing Partner CORPWINGS IT SERVICE 6380341944</p>
    </div>
  </div>
</body>
</html>

    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
  };

  const filterBills = (date, term) => {
    const filtered = bills.filter(bill => {
      const formattedDate = new Date(bill.createdAt).toLocaleDateString();
      const includesDate = date ? formattedDate === new Date(date).toLocaleDateString() : true;
      const includesTerm = new Date(bill.createdAt).toLocaleString().toLowerCase().includes(term);
      return includesDate && includesTerm;
    });
    setFilteredBills(filtered);

    const total = filtered.reduce((total, bill) => total + bill.totalAmount, 0);
    setTotalAmount(total.toFixed(2));
  };

  const handleReverseOrder = () => {
    setFilteredBills([...filteredBills].reverse());
    setIsReversed(!isReversed);
  };

  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="d-flex">
      <Sidebar showSidebar={showSidebar} />
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: showSidebar ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
        {/* <Navbar toggleSidebar={toggleSidebar} /> */}
        <div className="flex-grow-1 billdetails">
          <Container className="mt-4 ">
            <h2 className='billTitle'>
              Billing Statements
            </h2>

            <Form.Group controlId="search" className="mb-4">
            </Form.Group>
            <Form.Group controlId="date" className="mb-4" style={{ marginTop: "70px" }}>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </Form.Group>
            <Button variant="secondary" onClick={handleReverseOrder} className="mb-4">
              {isReversed ? 'Show Normal Order' : 'Reverse Order'}
            </Button>
            <Button variant="info" onClick={handlePrintFilteredBills} className="mb-4 PrintFilteredBtn">
              Print Filtered Bills
            </Button>
            {filteredBills.length > 0 ? (
              <>
                <Table striped bordered hover variant="">
                  <thead>
                    <tr>
                      <th>Serial No.</th>
                      <th>Total Amount</th>
                      <th>Date and Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill, index) => (
                      <tr key={bill._id}>
                        <td>{isReversed ? filteredBills.length - index : index + 1}</td>
                        <td>₹{bill.totalAmount.toFixed(2)}</td>
                        <td>{formatDate(bill.createdAt)}</td>
                        <td>
                          <Button
                            variant="info"
                            onClick={() => handlePrint(bill, index)}
                            className="btn-sm"
                          >
                            <i className="bi bi-eye"></i> View & Print
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div style={{ color: 'black', fontWeight: 'bold' }}>
                  <h4>Total Amount for Selected Date: ₹{totalAmount}</h4>
                </div>
              </>
            ) : (
              <p>No bills found.</p>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default BillPage;