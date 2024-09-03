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
    <html>
    <head>
      <title>Welcome to AI Chat Bot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #333;
        }
        h2 {
          color: #555;
        }
        p {
          font-size: 16px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <h1>Welcome To AI Chat Bot Created By Shubhradeep Maity</h1>
      <h2>Using Gemini AI API (model: "gemini-1.5-flash")</h2>
      <h2>Integrating Google Gemini to Node js Application [Gemini X Node.js]</h2>
      <p>You can use it as an AI Content Generator or AI Chat Bot.</p>
      <p>For AI Chat Bot, send a POST request to <strong>/api/chat</strong>.</p>
      <p>For Content Generation, send a POST request to <strong>/api/content</strong>.</p>
      <p>Use Postman for a better experience.</p>
      <h2>Thank You!</h2>
    </body>
    </html>
  `);
});

  

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`\n Server is running on port ${port}`);
})