const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    },
});

module.exports = mongoose.model('Prompt', promptSchema);