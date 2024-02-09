const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const promptRoutes = require('./routes/prompts');

const app = express();
const port = 3001;

require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors());

const uri = 'mongodb://localhost:27017/findicon';

mongoose.set('strictQuery', false)
mongoose.connect(uri).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});

app.use('/prompts', promptRoutes);

app.listen(port);