const mongoose = require("mongoose");

async function checkCompanies() {
  try {
    await mongoose.connect("mongodb://localhost:27017/internconnect");
    console.log("Connected to MongoDB");
    
    // Get the companies collection
    const companiesCollection = mongoose.connection.collection("companies");
    
    // Find all companies
    const companies = await companiesCollection.find({}).toArray();
    
    console.log("\n=== Total Companies Count: " + companies.length + " ===\n");
    
    if (companies.length === 0) {
      console.log("No companies found in the database.");
    } else {
      console.log("Email".padEnd(30) + " | " + "Name".padEnd(25) + " | " + "Company Name");
      console.log("-".repeat(80));
      
      companies.forEach((company) => {
        const email = company.email || "N/A";
        const name = company.name || "N/A";
        const companyName = company.companyName || "N/A";
        
        console.log(email.padEnd(30) + " | " + name.padEnd(25) + " | " + companyName);
      });
    }
    
    console.log("\n=== All Companies Listed ===");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkCompanies();
