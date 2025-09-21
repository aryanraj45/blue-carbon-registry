require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const ee = require('@google/earthengine');

// Initialize Express app
const app = express();

// Connect to aDatabase
connectDB();

// --- GEE AUTHENTICATION ---
try {
    const GEE_PRIVATE_KEY = require('./config/gee-credentials.json');
    ee.data.authenticateViaPrivateKey(GEE_PRIVATE_KEY, 
        () => {
            console.log('GEE Authentication Successful.');
            ee.initialize(null, null, 
                () => console.log('GEE Initialized.'),
                (err) => console.error('GEE Initialization Error:', err)
            );
        },
        (err) => console.error('GEE Authentication Error:', err)
    );
} catch (error)
{
    console.error('Could not load GEE credentials. Make sure config/gee-credentials.json exists.', error);
}
// -------------------------

// Middleware
// --- FIX: Updated the origin to match your frontend port ---
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'https://earth-credits-hub-32-cn42.vercel.app'], 
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public')); 

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/satellite', require('./routes/satelliteRoutes'));
app.use('/api/automation', require('./routes/automationRoutes'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
