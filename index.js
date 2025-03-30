const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Load aisles data from the JSON file
const aislesFilePath = path.join(__dirname, 'data', 'aisles.json');
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

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

app.put("/api/update-aisle/:aisleNumber", (req, res) => {
    const { aisleNumber } = req.params;
    const updatedAisle = req.body;
  
    // Find the aisle to update
    const aisleIndex = aisles.findIndex((a) => a.aisle === aisleNumber);
    if (aisleIndex === -1) {
      return res.status(404).send("Aisle not found");
    }
  
    // Update the aisle
    aisles[aisleIndex] = updatedAisle;
  
    // Save the updated aisles data to the JSON file
    fs.writeFile(aislesFilePath, JSON.stringify(aisles, null, 2), (err) => {
      if (err) {
        console.error("Error saving aisles.json:", err);
        return res.status(500).send("Failed to save data");
      }
      res.send("Aisle updated successfully");
    });
  });


// API endpoint to delete an aisle
app.delete('/api/delete-aisle/:aisleNumber', (req, res) => {
    const { aisleNumber } = req.params;

    // Find the index of the aisle to delete
    const aisleIndex = aisles.findIndex(a => a.aisle === aisleNumber);
    if (aisleIndex === -1) {
        return res.status(404).send('Aisle not found');
    }

    // Remove the aisle from the list
    aisles.splice(aisleIndex, 1);

    // Save the updated aisles data to the JSON file
    fs.writeFile(aislesFilePath, JSON.stringify(aisles, null, 2), err => {
        if (err) {
            console.error('Error saving aisles.json:', err);
            return res.status(500).send('Failed to save data');
        }
        res.send('Aisle deleted successfully');
    });
});


// API endpoint to add a new aisle
// API endpoint to add a new aisle
app.post('/api/add-aisle', (req, res) => {
    const { aisle, name, area, bays } = req.body;

    // Validate the request body
    if (!aisle || !name || !area || !bays || !Array.isArray(bays)) {
        return res.status(400).send('Invalid request body. Please provide aisle, name, area, and bays.');
    }

    // Check if the aisle already exists
    if (aisles.find(a => a.aisle === aisle)) {
        return res.status(400).send('Aisle already exists');
    }

    // Create the new aisle
    const newAisle = {
        aisle,
        name,
        area,
        bays: bays.map((bay, index) => ({
            location: bay.location || String(index + 1).padStart(3, '0'), // Generate bay location if missing
            topstocks: bay.topstocks.map((topstock, topstockIndex) => ({
                id: topstockIndex + 1, // Assign a unique ID to each topstock
                products: topstock.products.map(product => ({
                    name: product.name || "",
                    barcode: product.barcode || "",
                    quantity: product.quantity || 0,
                    expdate: product.expdate || "",
                    date: product.date || "",
                    department: product.department || "",
                })),
            })),
        })),
    };

    // Add the new aisle to the list
    aisles.push(newAisle);

    // Save the updated aisles data to the JSON file
    fs.writeFile(aislesFilePath, JSON.stringify(aisles, null, 2), err => {
        if (err) {
            console.error('Error saving aisles.json:', err);
            return res.status(500).send('Failed to save data');
        }
        res.send('Aisle added successfully');
    });
});

// ...existing code...

// API endpoint to update a topstock's products
app.post('/api/update-topstock', (req, res) => {
    const { aisleNumber, bayLocation, topstock } = req.body;
  
    // Find the aisle, bay, and topstock to update
    const aisle = aisles.find((a) => a.aisle === aisleNumber);
    if (!aisle) return res.status(404).send('Aisle not found');
  
    const bay = aisle.bays.find((b) => b.location === bayLocation);
    if (!bay) return res.status(404).send('Bay not found');
  
    const topstockToUpdate = bay.topstocks.find((t) => t.id === topstock.id);
    if (!topstockToUpdate) return res.status(404).send('Topstock not found');
  
    // Update the topstock's products
    topstockToUpdate.products = topstock.products;
  
    // Save the updated aisles data to the JSON file
    fs.writeFile(aislesFilePath, JSON.stringify(aisles, null, 2), (err) => {
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
