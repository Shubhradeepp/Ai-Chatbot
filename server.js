const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(express.json());

const gemini_api_key = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});


// Initialize chat model
let chat;
let chatHistory = []; // Custom chat history array


async function initializeChat() {
  try {
    const model = await googleAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    chat = await model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 50,
      },
    });

    console.log('\n Chat initialized');
  } catch (error) {
    console.error('Error initializing chat:', error);
    process.exit(1); // Exit the process if initialization fails
  }
}

// POST endpoint to handle AI queries (chat)



app.post('/api/chat', async (req, res) => {
  const message = req.body.Me;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    if (!chat) {
      await initializeChat();  // Initialize chat if not already initialized
    }

    console.log('\n Received POST request at /api/chat');
    const result = await chat.sendMessage(message);
    const responseText = await result.response.text();

    // Update your custom chat history array
    chatHistory.push({ role: 'You', content: message });
    chatHistory.push({ role: 'Ai', content: responseText });

    console.log('\n Response Generated...');
    console.log(responseText);
    res.json({
      Ai: responseText,
      history: chatHistory,
    });
  } catch (error) {
    console.error('Error during chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Function to generate content based on a question
const generateContent = async (Me) => {
  try {
    const result = await geminiModel.generateContent(Me);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error('Content generation failed');
  }
};


// POST endpoint to generate content
app.post('/api/content', async (req, res) => {
  console.log('\n Received POST request at /api/content');
  const message = req.body.Me;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await generateContent(message);
    console.log('\n Response Generated...');
    console.log(result);
    res.json({ Ai: result });

  } catch (error) {
    console.error('Error :', error);
    res.status(500).json({ error: 'Internal Server Error' });

  }
});


app.get('/', (req, res) => {
  console.log('\n Response Generated...');
  res.send(`
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Chat Bot</title>
  <style>
    :root {
      --primary-color: rgb(	208,0,0);
      --secondary-color: white;
      --body-color: crimson;
      --accent-color: #FF8C00;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: var(--primary-color);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      overflow: hidden;
    }

    .container {
      background-color: rgb(0, 0, 33);
      padding: 40px;
      border-radius: 15px;
      text-align: center;
      width: 60%; /* Increased width */
      max-width: 800px;
      height: auto; /* Adjusted height */
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }

    h1, h2 {
      color: var(--body-color);
    }

    p {
      color: var(--secondary-color);
      font-size: 18px;
    }

    .bold-text {
      font-weight: bold;
    }

    strong {
      color: var(--accent-color);
    }

    .postman-button {
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 16px;
      background-color: var(--accent-color);
      color: var(--primary-color);
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }

    .postman-button:hover {
      background-color: darkorange;
    }

    footer {
      margin-top: 20px;
      color: var(--body-color);
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to AI Chat Bot Created By Shubhradeep</h1>
    <h2>Google Gemini Integration with Node.js [Gemini X Node.js]</h2>
    <h2>Using Gemini AI API (model: "gemini-1.5-flash")</h2>
    <p>You can use this service as an AI Content Generator or AI Chat Bot.</p>
    <p>For AI Chat Bot, send a POST request to <strong>/api/chat</strong>.</p>
    <p>For Content Generation, send a POST request to <strong>/api/content</strong>.</p>
    <p class="bold-text">Send a POST request with a JSON body containing { "Me": "Your Prompt" }</p>
    <p>Use Postman or another API testing tool for the best experience.</p>
    <a href="https://www.postman.com/" class="postman-button">Postman</a>
    <footer>Thank you for using our service!</footer>
  </div>
</body>
</html>

  `);
});








const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`\n Server is running on port ${port}`);
})
