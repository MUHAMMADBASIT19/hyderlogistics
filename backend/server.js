const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// API Endpoints
app.post('/api/quote', (req, res) => {
    console.log("Quote Request Received:", req.body);
    res.status(200).json({ 
        success: true, 
        message: "Quote request received successfully!" 
    });
});

app.get('/api/quote', (req, res) => {
    res.status(200).json({ 
        message: "Quote endpoint is active. Use POST to submit data." 
    });
});

// Serve static frontend files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Fallback to index.html for root requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}