const express = require('express');
const mtg = require('mtgsdk');
const app = express();
const port = 3000;

app.use(express.static('.')); // Serve static files from the current directory

app.get('/card/:name', async (req, res) => {
    try {
        const cards = await mtg.card.where({ name: req.params.name });
        res.json(cards);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});