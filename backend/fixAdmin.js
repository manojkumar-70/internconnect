const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function fixAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before fixing an admin.');
  }
  try {
    await mongoose.connect("mongodb://localhost:27017/internconnect");
    console.log("Connected to MongoDB");
    
    const deleteResult = await Admin.deleteMany({ email: ADMIN_EMAIL });
    console.log("\nDeleted " + deleteResult.deletedCount + " existing admin(s) with the requested email");
    
    // Create a NEW admin using the Admin model
    // The pre-save hook in the model will automatically hash the password
    const newAdmin = new Admin({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin"
    });
    
    // Save the admin (triggers pre-save hook)
    const savedAdmin = await newAdmin.save();
    
    console.log("\n=== Admin Created Successfully ===");
    console.log("Admin ID: " + savedAdmin._id);
    console.log("Name: " + savedAdmin.name);
    console.log("Email: " + savedAdmin.email);
    console.log("Role: " + savedAdmin.role);
    console.log("Created At: " + savedAdmin.createdAt);
    console.log("\nPassword was hashed by the Mongoose pre-save hook");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

fixAdmin();
