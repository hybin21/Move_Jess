import express from "express";
import 'dotenv/config';
import cors from "cors";
import Exa from "exa-js";
import { getSummary } from "./src/exaService.js";  // ✅ Corrected Import Path

const app = express();
const PORT = 5001;

// ✅ Ensure API Key is being read correctly
console.log("Backend EXA API Key:", process.env.EXA_API_KEY);

const exa = new Exa(process.env.EXA_API_KEY);

// ✅ Enable CORS for frontend (localhost:5173)
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/api/movie-summary", async (req, res) => {
    const { movieTitle } = req.body;

    if (!movieTitle) {
        return res.status(400).json({ error: "Movie title is required" });
    }

    try {
        const summary = await getSummary(movieTitle);  // ✅ Call function from exaService.js
        res.json({ summary });
    } catch (error) {
        console.error("Error fetching movie summary:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});