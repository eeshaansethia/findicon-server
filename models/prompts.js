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
    createdAt: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Prompt', promptSchema);