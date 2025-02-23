const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Sentiment = require('sentiment');  // Import the Sentiment package

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const placesApiKey = process.env.PLACES_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize Google Cloud Language client
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: `behave as a human therapist. Purpose: It is designed to provide supportive, empathetic, and non-judgmental responses to users seeking guidance, emotional support, and mental well-being advice.`,
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const app = express();
app.use(cors());
app.use(bodyParser.json());


const analyzeSentiment = (text) => {
  try {
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);  

    const sentimentScore = result.score;  

    console.log("Sentiment score:", sentimentScore);
    if (sentimentScore <= -2) return "critical";  
    if (sentimentScore > -2 && sentimentScore < 0) return "negative";  
    return "positive"; 
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "neutral";  
  }
};

// Helper function to query Google Places API
async function findNearbyTherapists(latitude, longitude) {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&type=health&keyword=therapist&key=${placesApiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("Google Places API Response:", data);

    if (data.results && data.results.length > 0) {
      return data.results.map((place) => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating || "No rating available",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching places data:", error);
    return [];
  }
}

const suggestOnlineTherapy = () => [
  { name: "BetterHelp", url: "https://www.betterhelp.com", description: "Online counseling and therapy." },
  { name: "Talkspace", url: "https://www.talkspace.com", description: "Affordable therapy with licensed professionals." },
];

// app.post("/chat", async (req, res) => {
//   try {
//     const { inputText, location } = req.body;

//     if (!inputText) {
//       return res.status(400).json({ error: "Input text is required" });
//     }

//     const criticalKeywords = ["suicide", "self-harm", "depression", "crisis"];
//     const keywordMatch = criticalKeywords.some((keyword) =>
//       inputText.toLowerCase().includes(keyword)
//     );

//     console.log("Input text:", inputText);
//     console.log("Keyword match:", keywordMatch);

//     const sentimentCategory = await analyzeSentiment(inputText);

//     console.log("Sentiment category:", sentimentCategory);

//     const isCritical = keywordMatch || sentimentCategory === "critical";

//     if (isCritical) {
//       console.log("Critical sentiment detected.");

//       if (location && location.latitude && location.longitude) {
//         console.log("Fetching nearby therapists...");
//         const therapists = await findNearbyTherapists(location.latitude, location.longitude);

//         return res.json({
//           response: "It seems like you're going through a tough time. Here are some therapists nearby who might help:",
//           therapists: therapists.length > 0 ? therapists : suggestOnlineTherapy(),
//         });
//       } else {
//         console.log("No location provided. Suggesting online therapy.");
//         return res.json({
//           response: "It seems like you're going through a tough time. I couldn't access your location, but here are some online therapy options:",
//           therapists: suggestOnlineTherapy(),
//         });
//       }
//     }

//     console.log("Non-critical input. Forwarding to generative AI.");
//     const chatSession = model.startChat({
//       generationConfig,
//       history: [
//         {
//           role: "user",
//           parts: [{ text: inputText }],
//         },
//       ],
//     });

//     const result = await chatSession.sendMessage(inputText);
//     const responseText = await result.response.text();

//     return res.json({ response: responseText });
//   } catch (error) {
//     console.error("Error interacting with generative AI:", error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Start server

app.post("/chat", async (req, res) => {
  try {
    const { inputText, location } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const criticalKeywords = ["suicide", "self-harm", "depression", "crisis"];
    const keywordMatch = criticalKeywords.some((keyword) =>
      inputText.toLowerCase().includes(keyword)
    );

    console.log("Input text:", inputText);
    console.log("Keyword match:", keywordMatch);

    const sentimentCategory = analyzeSentiment(inputText);

    console.log("Sentiment category:", sentimentCategory);

    const isCritical = keywordMatch || sentimentCategory === "critical";

    let therapists = [];
    if (isCritical && location && location.latitude && location.longitude) {
      console.log("Fetching nearby therapists...");
      therapists = await findNearbyTherapists(location.latitude, location.longitude);
    }

    const therapySuggestions = therapists.length > 0 ? therapists : suggestOnlineTherapy();

    console.log("Non-critical input. Forwarding to generative AI.");
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: inputText }],
        },
      ],
    });

    const result = await chatSession.sendMessage(inputText);
    const aiResponse = await result.response.text();

    if (isCritical) {
      console.log("Critical sentiment detected.");
      return res.json({
        response: `${aiResponse} It seems like you're going through a tough time. Here are some therapy options that might help:`,
        therapists: therapySuggestions,
      });
    }

    // Non-critical sentiment response
    return res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error interacting with generative AI:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
//reamber to history of user chat and the response of the chatbot for better response

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
