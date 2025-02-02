const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/authRoutes");
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const cors=require('cors');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health Check API
app.use("/health", (req, res) =>{
    res.json({message:"Hello Sir! I am alive"});
});

// Use Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/trains", trainRoutes);
app.use("/api/v1/bookings", bookingRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});