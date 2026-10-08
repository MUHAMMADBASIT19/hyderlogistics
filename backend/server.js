const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint test
app.get('/', (req, res) => {
    res.send("Hyder Logistics Backend is Running!");
});

// Quote API Endpoint
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

// Export for Vercel Serverless
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}