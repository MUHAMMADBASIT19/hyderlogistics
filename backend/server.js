const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Main Root Endpoint
app.get('/', (req, res) => {
    res.status(200).send("Hyder Logistics Backend is Running!");
});

// Quote Endpoints
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

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}