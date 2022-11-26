require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;
const users = [];
let refreshTokens = [];

app.get("/users", (req, res) => {
  res.status(200).send(users);
});

app.post("/users", async (req, res) => {
  const { name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ name, password: hashedPassword });
    res.status(201).send("Success");
  } catch (e) {
    console.error("something went wrong /users POST", e);
    res.status(500).send("Error");
  }
});

app.post("/token", (req, res) => {
  const token = req.body.token;
  if (token == null || !refreshTokens.includes(token))
    return res.status(401).send("Not Authorized");
  jwt.verify(token, process.env.JWT_REFRESH_TOKEN, (err, { name, id }) => {
    if (err) return res.status(403).send("Not Authorized");
    const accessToken = generateToken({ name, id });
    res.status(201).send({ accessToken });
  });
});

app.post("/users/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    let user = users.find((user) => user.name === name);
    if (user == null) {
      return res.status(400).send("User not found :(");
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched)
      return res.status(500).send("Password did not match -_-");

    user = { name, id: crypto.randomUUID() };
    const accessToken = generateToken(user);
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_TOKEN);
    refreshTokens.push(refreshToken);
    res.status(201).send({ accessToken, refreshToken });
  } catch (e) {
    console.error("something went wrong /users/login POST", e);
    res.status(500).send("Error");
  }
});

app.delete("/logout", (req, res) => {
  const token = req.body.token;
  if (token == null || !refreshTokens.includes(token))
    return res.status(401).send("Not Authorized");
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.sendStatus(204);
});

function generateToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_TOKEN, { expiresIn: "20s" });
}

app.listen(PORT, () =>
  console.log(`Server runnning on http://localhost:${PORT}`)
);
