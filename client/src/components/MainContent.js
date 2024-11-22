import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import './MainContent.css';
import { Button, Alert, Spinner } from 'react-bootstrap';

const MainContent = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchInputRef = useRef(null);
  const printButtonRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/items');
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        printButtonRef.current?.click();
      } else if (e.key === ' ') {
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const filteredProducts = useMemo(() => products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    products.indexOf(product) + 1 === parseInt(searchQuery)
  ), [products, searchQuery]);

  const handleProductClick = useCallback((product) => {
    if (!selectedProducts.some(p => p._id === product._id)) {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  }, [selectedProducts]);

  const handleRemoveClick = useCallback((productId) => {
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  }, []);

  const handleQuantityChange = useCallback((productId, newQuantity) => {
    setSelectedProducts(prev => prev.map(p =>
      p._id === productId ? { ...p, quantity: Math.max(newQuantity, 1) } : p
    ));
  }, []);

  const totalAmount = useMemo(() => selectedProducts.reduce((sum, product) =>
    sum + (product.total * product.quantity), 0
  ).toFixed(2), [selectedProducts]);

  const formatDateTime = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format
  hours = hours.toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};


  const handleCreateBill = async () => {
    const customerName = 'Default Customer';
    const contactNumber = '1234567890';
    const createdAt = new Date();
    const createdAtAbuDhabi = new Date(createdAt.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
  
    const billData = {
      customerName,
      contactNumber,
      selectedProducts,
      totalAmount,
      createdAt: createdAtAbuDhabi.toISOString(),
      printDetails: generatePrintContent({
        customerName,
        contactNumber,
        selectedProducts,
        totalAmount,
        createdAt: createdAtAbuDhabi
      })
    };
  
    try {
      await axios.post('http://localhost:5000/bills', billData);
      handlePrint(billData);
  
      // Clear selected products after successful print and store
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error storing bill:', error.response ? error.response.data : error.message);
    }
  };
  
  const generatePrintContent = (billData) => {
    const dateTime = formatDateTime(new Date(billData.createdAt));

    return `<!DOCTYPE html>
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
      font-weight: bold;
      background-color: #f4f4f4;
      border-bottom: 1px dotted #000;
    }
    .total-row td {
      border-top: 1px dotted #000;
      font-weight: bold;
      border-bottom: 1px dotted #000;
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
    <p class="date">Date & Time: ${dateTime}</p>
    <div class="header">
      <h1>குமரன் பவன்</h1>
      <h6>15/15, தாழையாத்தம் பஜார்,<br>(சௌத் இண்டியன் பேங்க் எதிரில்) குடியாத்தம். Ph:9894470116.</h6>
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
          ${billData.selectedProducts.map((product, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>${product.quantity}</td>
              <td>${(product.total * product.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="4">Total:</td>
            <td>${billData.totalAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>
<div>
<h3> இங்கு பிரெஷ் ஜூஸ் கிடைக்கும் </h3>
</div>
    <div class="footer">
      <p>Billing Partner CORPWINGS IT SERVICE 6380341944</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handlePrint = (billData) => {
    const printContent = generatePrintContent(billData);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';

    document.body.appendChild(iframe);

    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(printContent);
    iframe.contentWindow.print();
  };

  return (
    <div className="main p-3">
      <div className="container">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            {error}
          </Alert>
        ) : (
          <>
            <div className="search-bar-container mb-3">
              <div className="input-group mt-5">
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Search for a product by name or S.No..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  ref={searchInputRef}
                />
              </div>
            </div>

            <div className="product-list mb-3">
              {filteredProducts.length > 0 ? (
                <ul className="list-group">
                  {filteredProducts.map((product, index) => (
                    <li
                      key={product._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleProductClick(product)}
                    >
                      {`${index + 1}. ${product.name}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No products found. Please try a different search.</p>
              )}
            </div>

            <div className="selected-products">
              <h5>Selected Products</h5>
              {selectedProducts.length > 0 ? (
                <>
                  <table className="table table-striped mb-3">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>GST Amount</th>
                        <th>Total (per unit)</th>
                        <th>Quantity</th>
                        <th>Total for this Product</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map(product => (
                        <tr key={product._id}>
                          <td>{product.name}</td>
                          <td>₹{product.price.toFixed(2)}</td>
                          <td>₹{product.gst.toFixed(2)}</td>
                          <td>₹{product.total.toFixed(2)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleQuantityChange(product._id, product.quantity - 1)}
                                disabled={product.quantity <= 1}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={product.quantity}
                                min="1"
                                onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                              />
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleQuantityChange(product._id, product.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>₹{(product.total * product.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveClick(product._id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="6" className="text-end fw-bold">Total Amount:</td>
                        <td>₹{totalAmount}</td>
                      </tr>
                    </tbody>
                  </table>
                  <Button
                    variant="primary"
                    onClick={handleCreateBill}
                    ref={printButtonRef}
                  >
                    Create Bill & Print
                  </Button>
                </>
              ) : (
                <p>No products selected yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainContent;
