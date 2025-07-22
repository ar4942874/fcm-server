import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';

// Load service account key from file
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Notification server is running.');
});

// POST endpoint to send a message
app.post('/sendNotification', async (req, res) => {
  const { topic, title, body } = req.body;

  // Validate request
  if (!topic || !title || !body) {
    return res.status(400).json({ error: 'Missing topic, title, or body' });
  }

  const message = {
    notification: {
      title,
      body,
    },
    topic, // FCM topic
  };

  try {
    await admin.messaging().send(message);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Start server (on Render, use process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
