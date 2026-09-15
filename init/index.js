require("dotenv").config();

const mongoose = require("mongoose");
const initdata = require("./moredata.js");
const Listing = require("../Models/listing.js");

const dbUrl = process.env.ATLASDB_URL;
console.log(dbUrl);

async function main() {
  await mongoose.connect(dbUrl);
  console.log("connected to MongoDB Atlas");
}

const initdb = async () => {
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "6970d494294c9d0f997a48e1",
  }));
  await Listing.insertMany(initdata.data);
  console.log("data initialized");
  mongoose.connection.close();
};

main()
  .then(initdb)
  .catch((err) => {
    console.log(err);
  });
