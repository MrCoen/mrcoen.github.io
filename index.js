const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Load aisles data from the JSON file
const aislesFilePath = path.join('data/aisles.json');
let aisles = [];

// Read the JSON file and parse it
try {
    const data = fs.readFileSync(aislesFilePath, 'utf8');
    aisles = JSON.parse(data);
} catch (err) {
    console.error('Error reading aisles.json:', err);
}

app.use(express.static('public'));
app.use(express.json()); // Middleware to parse JSON request bodies

// API endpoint to get aisle data
app.get('/api/aisles', (req, res) => {
    res.json(aisles);
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API endpoint to update a topstock
app.post('/api/update-topstock', (req, res) => {
    const { aisleNumber, bayLocation, topstock } = req.body;

    // Find the aisle, bay, and topstock to update
    const aisle = aisles.find(a => a.aisle === aisleNumber);
    if (!aisle) return res.status(404).send('Aisle not found');

    const bay = aisle.bays.find(b => b.location === bayLocation);
    if (!bay) return res.status(404).send('Bay not found');

    const topstockToUpdate = bay.topstocks.find(t => t.id === topstock.id);
    if (!topstockToUpdate) return res.status(404).send('Topstock not found');

    // Update the topstock
    topstockToUpdate.products = topstock.products;
    topstockToUpdate.date = topstock.date;

    // Save the updated aisles data to the JSON file
    fs.writeFile(aislesFilePath, JSON.stringify(aisles, null, 2), err => {
        if (err) {
            console.error('Error saving aisles.json:', err);
            return res.status(500).send('Failed to save data');
        }
        res.send('Topstock updated successfully');
    });
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
