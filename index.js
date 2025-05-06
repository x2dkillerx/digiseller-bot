
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { OpenAI } = require('openai');
const app = express();
const path = require('path');

app.use(bodyParser.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const products = [
    { id: 1, name: "Ebook: AI for Beginners", price: 19.99, link: "https://yourlink.com/ebook-ai" },
    { id: 2, name: "Course: Mastering Prompt Engineering", price: 49.99, link: "https://yourlink.com/prompt-course" },
    { id: 3, name: "Template Pack: Social Media Growth", price: 14.99, link: "https://yourlink.com/templates" }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/products', (req, res) => {
    res.json(products);
});

app.post('/purchase', async (req, res) => {
    const { productId, paymentMethodId } = req.body;
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).send("Product not found");

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(product.price * 100),
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
        });

        res.send({ success: true, downloadLink: product.link });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a friendly assistant helping users choose digital products." },
                { role: "user", content: message }
            ],
            model: "gpt-4o"
        });

        const reply = completion.choices[0].message.content;
        res.send({ reply });
    } catch (error) {
        res.status(500).send({ reply: "AI error. Try again later." });
    }
});

app.listen(3000, () => {
    console.log('DigiSeller Bot running on http://localhost:3000');
});
