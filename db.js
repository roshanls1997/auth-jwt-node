const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URI);
const db = mongoose.connection;
db.on("error", (error) => console.error("something went wrong in DB", error));
db.once("open", () => console.log("connected to database", db.name));
