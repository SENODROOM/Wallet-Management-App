require("dotenv").config();
const mongoose = require("mongoose");
const Section = require("./models/Section");

const seedData = {
  income: {
    budget: 0,
    items: [
      { name: "Tweezer + Power Wire + OTG + Card Reader", price: 1000 },
      { name: "Tripod", price: 2000 },
      { name: "Memory Card", price: 9000 },
      { name: "Camera + Mic", price: 150000 },
      { name: "Cursor (software)", price: 12000 },
      { name: "Email Domain Hosting", price: 5000 },
      { name: "Claude", price: 5000 },
      { name: "Table Pawai", price: 600 },
      { name: "Portable Box", price: 20000 },
      { name: "Tickets x2", price: 5000 },
      { name: "OLX", price: 2750 },
      { name: "Donated to Poly Learning Initiative", price: 30000 }
    ]
  },
  poly: {
    budget: 190000,
    items: [
      { name: "Laser Printer", price: 43000 },
      { name: "KFC", price: 2000 },
      { name: "Khadija", price: 1000 },
      { name: "Papa Jazzcash", price: 3000 },
      { name: "Eggs", price: 270 },
      { name: "Netflix", price: 300 },
      { name: "Pizza", price: 3000 },
      { name: "Ayesha Cutting", price: 2000 },
      { name: "Bread", price: 130 },
      { name: "Jharo", price: 250 },
      { name: "Chiz", price: 810 },
      { name: "Phalian", price: 150 },
      { name: "Dahin", price: 130 },
      { name: "Dustbin Shoppers", price: 280 },
      { name: "Hafsa Dupata Renew", price: 500 }
    ]
  },
  monthly: {
    budget: 0,
    items: [
      { day: "16 Aug", name: "Nashta", price: 500 },
      { day: "16 Aug", name: "Petrol", price: 11000 },
      { day: "16 Aug", name: "Saad Jazzcash", price: 2000 }
    ]
  }
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const section of Object.keys(seedData)) {
    const existing = await Section.findOne({ section });
    if (existing) {
      console.log(`"${section}" already has data — skipping (delete the document in MongoDB to reseed).`);
      continue;
    }
    await Section.create({ section, ...seedData[section] });
    console.log(`Seeded "${section}".`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
