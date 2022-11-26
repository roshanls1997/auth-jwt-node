require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
require("./db");
const PostSchema = require("./models/post");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/posts", auth, async (req, res) => {
  try {
    const posts = await PostSchema.find();

    res.status(200).send(posts);
  } catch (e) {
    res.status(500).send("Error");
    console.error("something went wrong /posts GET", e);
  }
});
app.get("/posts/:id", auth, async (req, res) => {
  try {
    const posts = await PostSchema.find({ _id: req.params.id });

    res.status(200).send(posts);
  } catch (e) {
    res.status(500).send("Error");
    console.error("something went wrong /posts GET", e);
  }
});

app.post("/posts", auth, async (req, res) => {
  const { title, desc } = req.body;
  const { id, name } = req.user;
  try {
    const postSchema = new PostSchema({
      title,
      desc,
      created_by: name,
      created_by_id: id,
    });
    const post = await postSchema.save();
    res.status(201).json(post);
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
    if (error) return res.status(401).send("Not Authorized");
    req.user = user;
    next();
  });
}

app.listen(PORT, () =>
  console.log(`Server runnning on http://localhost:${PORT}`)
);
