
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    console.log("MongoDB URI loaded:", mongoURI ? "YES" : "NO");
    console.log("MongoDB URI format:", mongoURI?.slice(0, 14));

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
