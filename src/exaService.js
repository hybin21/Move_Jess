import Exa from 'exa-js';


// ✅ Use `import.meta.env` for Vite (Frontend)
console.log("Using EXA API Key:",process.env.EXA_API_KEY);

const exa = new Exa(process.env.EXA_API_KEY);

export async function getSummary(movieTitle) {
    try {
        console.log(`Fetching summary for movie: ${movieTitle}`);

        const result = await exa.answer(
            `What is the summary of the movie "${movieTitle}"?`,
            { text: true }
        );

        // ✅ Log Exa API Response
        console.log("Exa API Response:", result);

        return result.answer || "No summary available.";
    } catch (error) {
        console.error("Error fetching results:", error);
        return "Failed to fetch summary.";
    }
}