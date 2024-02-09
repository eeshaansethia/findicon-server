const express = require('express');
const router = express.Router();
const Prompt = require('../models/prompts');
const { OpenAI } = require('openai');
require('dotenv').config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.get('/', async (req, res) => {
    const prompts = await Prompt.find({}, { _id: 1, name: 1, icon: 1, products: 1 }, { sort: { createdAt: -1 } });
    res.status(200).json(prompts);
});

router.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    await Prompt.findByIdAndDelete(id);
    res.status(200).json({ message: 'Prompt deleted' });
});


router.get('/icon', async (req, res) => {
    const prompt = req.query.prompt;
    console.log(prompt);
    if (!prompt || prompt === '' || prompt === 'null') {
        res.status(400).json({ error: 'Provide a valid prompt!' });
        return;
    }
    const correction = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: 'system',
                content: `You are a customer service representative helping a user create the icon representing their product. 
                The user has provided the following prompt:  + ${prompt}.
                Just return in a single word or phrase to describe the product. 
                If you feel that the information is insufficient, return 'null'. 
                If the input prompt itself is sufficient, return the prompt itself. `
            }
        ],
        max_tokens: 1000,
        temperature: 0.3,
    });

    function capitalizeWords(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    const name = capitalizeWords(correction.choices[0].message.content);

    if (correction.choices[0].message.content === 'null') {
        res.status(400).json({ error: 'Insufficient information to generate icon' });
        return;
    }

    const response = await openai.images.generate({
        model: "dall-e-2",
        prompt: `Create a minimalist, black and white flat icon that visually represents the concept of "${correction.choices[0].message.content}" in SVG style. 
        No text should be included in the icon, nor in the background. 
        The icon should be designed with simplicity in mind, focusing on clean lines and basic shapes to convey the essence of the product category without relying on detailed illustrations or color. 
        The background of the icon must be pure white, ensuring high contrast against the black silhouette of the design. 
        This design should be easily recognizable, scalable, and suitable for use in various digital and print applications where a clear, immediate understanding of the product category is necessary.`,
        n: 1,
        size: "256x256",
        quality: 'standard'
    });

    const products = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: 'system',
                content: `Generate a JSON-formatted array exclusively listing products related to the specified category '${prompt}'. 
                            Each product should be represented as an object within the array, including exactly two keys: 'name', for the product's name, and 'features', an array containing precisely three features of the product. 
                            Do not include any additional information, commentary, or data outside of this structure. 
                            The output must strictly follow this format: [
                                {
                                    "name": "<product name>",
                                    "features": ["<feature1>", "<feature2>", "<feature3>"]
                                },
                                {
                                    "name": "<product name2>",
                                    "features": ["<feature1>", "<feature2>", "<feature3>"]
                                }
                            ]
                            Ensure each product's features are directly related to its functionality or design, providing clear and concise insights into what makes each product notable within its category.`,
            }
        ],
        max_tokens: 1000,
        temperature: 0.3,
    });

    const productArray = JSON.parse(products.choices[0].message.content);
    await Prompt.create({ prompt: prompt, icon: response.data[0].url, products: productArray, name: name });

    res.status(200).json({ icon: response, products: productArray });
});

module.exports = router;