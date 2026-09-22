const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before creating an admin.');
  }
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('internconnect');
    const adminsCollection = db.collection('admins');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Create admin document
    const adminDoc = {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };
    
    // Insert the admin document
    const result = await adminsCollection.insertOne(adminDoc);
    
    console.log('\n=== Admin Created Successfully ===');
    console.log('Admin ID: ' + result.insertedId);
    console.log('Email: ' + ADMIN_EMAIL);
    console.log('Role: admin');
    console.log('Created At: ' + adminDoc.createdAt);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

createAdmin();
