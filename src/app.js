import "dotenv/config"
import express from "express";
// import dotenv from "dotenv";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

// Allow Express to parse JSON data
app.use(express.json())

//A basic route
app.get('/', (req, res) => {
    res.json({status: "sucess"}, {message: "Welcome to Sieger Marketplace"});
});


//Start listening for requests
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})

export default app