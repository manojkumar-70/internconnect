const { MongoClient } = require('mongodb');

async function viewDatabases() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get admin database for listing databases
    const admin = client.db('admin');
    const databases = await admin.admin().listDatabases();
    
    console.log('\n=== Available Databases ===');
    for (const db of databases.databases) {
      console.log('Database: ' + db.name);
      
      // Get collections for each database
      const database = client.db(db.name);
      const collections = await database.listCollections().toArray();
      
      if (collections.length === 0) {
        console.log('  No collections');
      } else {
        console.log('  Collections:');
        for (const collection of collections) {
          console.log('    - ' + collection.name);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

viewDatabases();
