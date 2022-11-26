require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const posts = [];

app.get("/posts", auth, b, (req, res) => {
  try {
    const fileteredPosts = posts.filter(
      (post) => post.createdBy === req.user.name
    );
    res.status(200).send(fileteredPosts);
  } catch (e) {
    res.status(500).send("Error");
    console.error("something went wrong /posts GET", e);
  }
});

app.post("/posts", (req, res) => {
  const { created_by, title } = req.body;
  try {
    posts.push({ createdBy: created_by, title });
    res.status(201).send("Success");
  } catch (e) {
    console.error("something went wrong /posts POST", e);
    res.status(500).send("Error");
  }
});

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("Not Authorized");
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (error, user) => {
    console.log(error);
    if (error) return res.status(401).send("Not Authorized");
    req.user = user;
    next();
  });
}
function b(req, res, next) {
  console.log("comes here", req);
  next();
}

app.listen(PORT, () =>
  console.log(`Server runnning on http://localhost:${PORT}`)
);
