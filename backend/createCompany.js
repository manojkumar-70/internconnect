const mongoose = require("mongoose");
const Company = require("./models/Company");

async function createCompany() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/internconnect");
    console.log("Connected to MongoDB");
    
    // Create a new company using the Company model
    const newCompany = new Company({
      name: "Recruiter",
      email: "recruiter@example.com",
      password: "Password123",
      companyName: "Tech Corp",
      industry: "Technology",
      location: "New York",
      website: "https://techcorp.com"
    });
    
    // Save the company (this will trigger the pre-save hook for password hashing)
    const savedCompany = await newCompany.save();
    
    console.log("\n=== Company Created Successfully ===");
    console.log("Company ID: " + savedCompany._id);
    console.log("Name: " + savedCompany.name);
    console.log("Email: " + savedCompany.email);
    console.log("Company Name: " + savedCompany.companyName);
    console.log("Industry: " + savedCompany.industry);
    console.log("Location: " + savedCompany.location);
    console.log("Website: " + savedCompany.website);
    console.log("Password (hashed): " + savedCompany.password.substring(0, 20) + "...");
    console.log("===================================\n");
    
  } catch (err) {
    console.error("Error:", err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await mongoose.connection.close();
  }
}

createCompany();
