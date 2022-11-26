require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserSchema = require("./models/user");
const TokenSchema = require("./models/token");
require("./db");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

app.get("/users", async (req, res) => {
  const users = await UserSchema.find();
  res.status(200).json(
    users.map(({ name: fullName, created_at, id }) => ({
      id,
      name: fullName,
      created_at,
    }))
  );
});

app.post("/users", async (req, res) => {
  const { name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userSchema = new UserSchema({
      name,
      password: hashedPassword,
    });
    const user = await userSchema.save();
    res.status(201).json({ name, id: user.id, created_at: user.created_at });
  } catch (e) {
    console.error("something went wrong /users POST", e);
    res.status(500).send("Error");
  }
});

app.post("/token", async (req, res) => {
  const token = req.body.token;
  if (token == null) return res.status(401).send("Not Authorized 1");
  let refreshToken = await TokenSchema.find({ refresh_token: token });
  console.log(refreshToken);
  refreshToken = refreshToken[0];
  if (refreshToken == null) return res.status(401).send("Not Authorized 1");
  jwt.verify(
    token,
    process.env.JWT_REFRESH_TOKEN,
    async (err, { name, id }) => {
      if (err) return res.status(403).send("Not Authorized 2");
      const accessToken = generateToken({ name, id });
      await TokenSchema.updateOne(
        { user_id: id },
        { access_token: accessToken }
      );
      res.status(201).send({ accessToken });
    }
  );
});

app.post("/users/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    let user = await UserSchema.find({ name });
    user = user[0];
    if (user == null) {
      return res.status(400).send("User not found :(");
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched)
      return res.status(500).send("Email / password did not match -_-");

    user = {
      name,
      id: user.id,
    };
    const accessToken = generateToken(user);
    const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_TOKEN);
    const tokenSchema = new TokenSchema({
      user_id: user.id,
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    await tokenSchema.save();
    res.status(201).send({ accessToken, refreshToken });
  } catch (e) {
    console.error("something went wrong /users/login POST", e.message);
    res.status(500).send("Error");
  }
});

app.delete("/logout", async (req, res) => {
  try {
    const token = req.body.token;
    if (token == null) return res.status(401).send("Not Authorized");
    await TokenSchema.deleteOne({ refresh_token: token });
    res.sendStatus(204);
  } catch (error) {
    console.error("Error while logging out", e);
    res.status(500).send("something went wrong while logging out");
  }
});

function generateToken(user) {
  return jwt.sign(user, process.env.JWT_ACCESS_TOKEN, { expiresIn: "20m" });
}

app.listen(PORT, () =>
  console.log(`Server runnning on http://localhost:${PORT}`)
);
