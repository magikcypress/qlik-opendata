// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/qlik-opendata', { useNewUrlParser: true, useUnifiedTopology: true });

const sheetSchema = new mongoose.Schema({
    qId: String,
    title: String
});

const Sheet = mongoose.model('Sheet', sheetSchema);

app.post('/api/sheets', async (req, res) => {
    const { qId, title } = req.body;
    const newSheet = new Sheet({ qId, title });
    try {
        await newSheet.save();
        res.status(201).send(newSheet);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});