const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
const knex = require("knex");
const { json } = require("express");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "junlee",
    password: "",
    database: "post-whatever",
  },
});

app.use(express.json());
app.use(cors());

app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  db.select("*")
    .from("login")
    .where("email", email)
    .then((data) => {
      console.log(data);
      const user = data[0];
      const isValid = bcrypt.compareSync(password, user.hash);
      if (isValid) {
        db.select("*")
          .from("users")
          .where("email", user.email)
          .then((data) => {
            res.json(data[0]);
          })
          .catch((err) => res.json("Error"));
      } else {
        res.json("Incorrect password!");
      }
    })
    .catch((err) => res.json("Incorrect email!"));
});

app.post("/register", (req, res) => {
  const { name, password, email } = req.body;
  const hash = bcrypt.hashSync(password);

  db.transaction((trx) => {
    trx
      .insert({
        email: email,
        hash: hash,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((data) => {
            res.json(data[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) =>
    res.status(400).json("Register failed. Try using anoter email.")
  );
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
});

// const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(3000);
});
