const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function fixAdmin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/internconnect");
    console.log("Connected to MongoDB");
    
    // Delete any existing admin with email admin@example.com
    const deleteResult = await Admin.deleteMany({ email: "admin@example.com" });
    console.log("\nDeleted " + deleteResult.deletedCount + " existing admin(s) with email admin@example.com");
    
    // Create a NEW admin using the Admin model
    // The pre-save hook in the model will automatically hash the password
    const newAdmin = new Admin({
      name: "Admin",
      email: "admin@example.com",
      password: "Admin123456",  // Plain text password - will be hashed by pre-save hook
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
