const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: '*', // Cho phép tất cả các domain, bạn có thể thay đổi thành một mảng các domain cụ thể nếu cần
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/locations_db';

mongoose.connect(MONGO_URI, {
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Mongoose Schema & Model
const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

const Location = mongoose.model('Location', locationSchema);

// Routes

// 1. Get all locations
app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error });
  }
});

// 2. Add a new location
app.post('/locations', async (req, res) => {
  const { name, latitude, longitude } = req.body;

  if (!name || latitude == null || longitude == null) {
    return res.status(400).json({ message: 'All fields (name, latitude, longitude) are required' });
  }

  try {
    const newLocation = new Location({ name, latitude, longitude });
    await newLocation.save();
    res.status(201).json({ message: 'Location added successfully', location: newLocation });
  } catch (error) {
    res.status(500).json({ message: 'Error adding location', error });
  }
});

// 3. Get a single location by ID
app.get('/locations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching location', error });
  }
});

// 4. Update a location by ID
app.put('/locations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude } = req.body;

  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude },
      { new: true, runValidators: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location updated successfully', location: updatedLocation });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error });
  }
});

// 5. Delete a location by ID
app.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location deleted successfully', location: deletedLocation });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting location', error });
  }
});




// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
