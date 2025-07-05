import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI 
//|| 'mongodb://localhost:27017/aieera-digital';

// Middleware
app.use(cors());
app.use(express.json());

let db;

// MongoDB connection
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper function to convert MongoDB _id to id
const transformDocument = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
};

// Routes

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await db.collection('clients').find({}).toArray();
    res.json(clients.map(transformDocument));
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Add new client
app.post('/api/clients', async (req, res) => {
  try {
    const { id, name } = req.body;
    const clientData = {
      _id: id,
      name,
      createdAt: new Date().toISOString()
    };
    
    // Check if client already exists
    const existingClient = await db.collection('clients').findOne({ _id: id });
    if (existingClient) {
      return res.json(transformDocument(existingClient));
    }
    
    await db.collection('clients').insertOne(clientData);
    res.status(201).json(transformDocument(clientData));
  } catch (error) {
    console.error('Error adding client:', error);
    res.status(500).json({ error: 'Failed to add client' });
  }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete client and all associated services
    await db.collection('clients').deleteOne({ _id: id });
    await db.collection('services').deleteMany({ clientId: id });
    
    res.json({ message: 'Client and associated services deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.collection('services').find({}).toArray();
    res.json(services.map(transformDocument));
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Add new service
app.post('/api/services', async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      _id: new ObjectId().toString(),
      createdAt: new Date().toISOString()
    };
    
    await db.collection('services').insertOne(serviceData);
    res.status(201).json(transformDocument(serviceData));
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Failed to add service' });
  }
});

// Update service
app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    await db.collection('services').updateOne(
      { _id: id },
      { $set: updates }
    );
    
    const updatedService = await db.collection('services').findOne({ _id: id });
    res.json(transformDocument(updatedService));
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('services').deleteOne({ _id: id });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);