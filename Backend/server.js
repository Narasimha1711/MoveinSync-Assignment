import app from './src/app.js';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();


connectDB();



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});