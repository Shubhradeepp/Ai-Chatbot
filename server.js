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




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`\n Server is running on port ${port}`);
})