const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
const knex = require("knex");
const { response } = require("express");

const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json("connected to home");
});
app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  db.select("*")
    .from("login")
    .where("email", email)
    .then((data) => {
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

app.post("/forum/post", (req, res) => {
  const { poster_id, poster_name, title, text } = req.body;
  db.insert({
    poster_id: poster_id,
    poster_name: poster_name,
    title: title,
    text: text,
  })
    .into("posts")
    .then(() => res.json(req.body))
    .catch((err) => res.status(400).json(err));
});

app.get("/forum", (req, res) => {
  db.select("*")
    .from("posts")
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json("failed fetching data");
    });
});

app.get("/forum/posts/:id", (req, res) => {
  db.select("text", "title", "poster_id", "poster_name")
    .from("posts")
    .where("id", req.params.id)
    .then((data) => {
      res.json(data[0]);
    })
    .catch((err) => res.status(400).json("failed fetching data"));
});

app.delete("/forum/posts/:id", (req, res) => {
  db("posts")
    .where("id", req.body.id)
    .del()
    .then(() => res.json("delete success"))
    .catch((err) => console.log("Couldn't find a matching post"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(PORT);
});
