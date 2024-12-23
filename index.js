require('dotenv').config();  // Make sure this is at the top of your file

const express = require('express');
const mongoose = require('mongoose');
const { landingRouter } = require('./routes/landingRouter');
const cors = require('cors');

const app = express();

// Middleware to parse JSON
app.use(express.json());

const corsOptions = {
  origin: 'http://192.168.203.1:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/home', landingRouter);
app.options('*', cors(corsOptions)); // This will handle pre-flight requests

async function main() {
  try {
    // Ensure that process.env.MONGO_UR is not undefined
    if (!process.env.MONGO_URL){
      throw new Error('MONGO_UR is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URL,{
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    app.listen(4002, () => {
      console.log('Server running on http://localhost:4002');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

main();
