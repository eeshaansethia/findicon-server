const express = require('express');
const router = express.Router();
const Prompt = require('../models/prompts');

router.get('/icon', async (req, res) => {
    res.send('API Test')
});

module.exports = router;