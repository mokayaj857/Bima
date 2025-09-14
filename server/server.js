require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const WebSocket = require('ws');

const sensorRoutes = require('./routes/sensorRoutes');
const waterFlowRoutes = require('./routes/waterFlowRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Passport Google OAuth Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
      }

      // Check if user exists with same email
      existingUser = await User.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = profile.id;
        existingUser.provider = 'google';
        await existingUser.save();
        return done(null, existingUser);
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName || profile.emails[0].value.split('@')[0],
        provider: 'google',
        confirmed: true
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Routes
app.use('/api', sensorRoutes);
app.use('/api', waterFlowRoutes);
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  console.log('Continuing without MongoDB for testing purposes...');
});

// Start server regardless of MongoDB connection
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket server for real-time data
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Generate mock sensor data for real-time updates
function generateMockSensorData() {
  const sensors = [];
  for (let i = 1; i <= 24; i++) {
    sensors.push({
      id: i,
      lat: -6.2 + Math.random() * 0.4, // Jakarta area coordinates
      lng: 106.8 + Math.random() * 0.4,
      name: `Sensor ${i}`,
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      flowRate: Math.random() * 5 + 0.5, // 0.5-5.5 L/s
      timestamp: new Date().toISOString()
    });
  }
  return sensors;
}

// Broadcast data to all connected clients
function broadcastSensorData() {
  const sensorData = generateMockSensorData();
  const message = JSON.stringify(sensorData);

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  clients.add(ws);

  // Send initial data
  const initialData = generateMockSensorData();
  ws.send(JSON.stringify(initialData));

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Start broadcasting real-time data every 5 seconds
setInterval(broadcastSensorData, 5000);
