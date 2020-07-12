const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const database = {
  users: [
    {
      id: 12,
      name: "John",
      email: "john@gmail.com",
      password: "123",
      joined: new Date(),
    },
  ],
};

app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (
    email == database.users[0].email &&
    password == database.users[0].password
  ) {
    res.json("success");
  } else {
    res.status(400).json("failed to sign in");
  }
});

app.post("/register", (req, res) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    posts: 0,
    joined: new Date(),
  };

  res.json(newUser);
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(PORT);
});
