const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// Product list
const products = [
    { id: 1, name: "Ebook: AI for Beginners", price: 19.99, link: "https://yourlink.com/ebook-ai" },
    { id: 2, name: "Course: Mastering Prompt Engineering", price: 49.99, link: "https://yourlink.com/prompt-course" },
    { id: 3, name: "Template Pack: Social Media Growth", price: 14.99, link: "https://yourlink.com/templates" }
];

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Product listing
app.get('/products', (req, res) => {
    res.json(products);
});

// Chat endpoint using OpenRouter (free AI)
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "mistralai/mixtral-8x7b-instruct",  // Free good model
            messages: [
                { role: "system", content: "You are a friendly assistant helping users choose digital products." },
                { role: "user", content: message }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const reply = response.data.choices[0].message.content;
        res.send({ reply });
    } catch (error) {
        res.status(500).send({ reply: "AI error (OpenRouter) → Try again later." });
    }
});

// Start server
app.listen(3000, () => {
    console.log('DigiSeller Bot (FREE AI version) running on http://localhost:3000');
});

