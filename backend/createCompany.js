const mongoose = require("mongoose");
const Company = require("./models/Company");

async function createCompany() {
  const requiredFields = ['COMPANY_NAME', 'COMPANY_EMAIL', 'COMPANY_PASSWORD', 'COMPANY_LEGAL_NAME', 'COMPANY_INDUSTRY', 'COMPANY_LOCATION', 'COMPANY_WEBSITE'];
  const missingFields = requiredFields.filter((field) => !process.env[field]);
  if (missingFields.length) {
    throw new Error(`Set ${missingFields.join(', ')} before creating a company.`);
  }
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/internconnect");
    console.log("Connected to MongoDB");
    
    // Create a new company using the Company model
    const newCompany = new Company({
      name: process.env.COMPANY_NAME,
      email: process.env.COMPANY_EMAIL,
      password: process.env.COMPANY_PASSWORD,
      companyName: process.env.COMPANY_LEGAL_NAME,
      industry: process.env.COMPANY_INDUSTRY,
      location: process.env.COMPANY_LOCATION,
      website: process.env.COMPANY_WEBSITE
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
