const connection = require("./db-config");

// We import expres
const express = require("express");

// We store all express methods in a variable called app
const app = express();

// We store the port we want to use in a variable
const port = process.env.PORT || 3000;

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log(
      "connected to database with threadId :  " + connection.threadId
    );
  }
});

app.use(express.json());

app.get("/api/movies", (req, res) => {
  let sql = 'SELECT * FROM movies';
  const sqlValues = [];
  if (req.query.color) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
  }
  if(req.query.max_duration){
    if(req.query.color) sql += ' AND duration <= ?';
    else sql +=' WHERE duration <= ?';
    sqlValues.push(req.query.max_duration);
  }
  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/api/users", (req, res) => {
  let sql = 'SELECT * FROM users';
  const sqlValues = [];
  if (req.query.language) {
    sql += ' WHERE language = ?';
    sqlValues.push(req.query.language);
  }
  connection.query(sql, sqlValues, (err, results) =>{
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  connection.query(
    "SELECT * FROM movies WHERE id = ?",
    [movieId],
    (err, results) => {
      if (err) {
        res.status(200).send("Error retrieving movies from database");
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send("movie not found");
      }
    }
  );
});

app.post("/api/movies", (req, res) => {
  const { title, director, year, color, duration } = req.body;
  connection.query(
    "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
    [title, director, year, color, duration],
    (err, result) => {
      if (err) {
        res.status(500).send("Error saving the movie");
      } else {
        res.status(201).send("Movie successfully saved");
      }
    }
  );
});

app.put("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  const moviePropsToUpdate = req.body;
  connection.query(
    "UPDATE movies SET ? WHERE id = ?",
    [moviePropsToUpdate, movieId],
    (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating a movie");
      } else {
        res.status(200).send("Movie updated successfully 🎉");
      }
    }
  );
});

app.delete("/api/movies/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "DELETE FROM movies WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("😱 Error deleting an movie");
      } else {
        res.status(200).send("🎉 Movie deleted!");
      }
    }
  );
});

app.get("/api/users", (req, res) => {
  let sql = 'SELECT * FROM users';
  const sqlValues = [];
  if (req.query.language) {
    sql += ' WHERE language = ?';
    sqlValues.push(req.query.language);
  }
  connection.query(sql, sqlValues, (err, results) =>{
    if (err) {
      res.status(500).send("Error retrieving data from database");
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        res.status(500).send("Error retrieving users from database");
      } else {
        if (results.length) res.json(results[0]);
        else res.status(404).send("user not found");
      }
    }
  );
});

app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query(
    "INSERT INTO users(firstname, lastname, email) VALUES (?, ?, ?)",
    [firstname, lastname, email],
    (err, result) => {
      if (err) {
        res.status(500).send("Error saving the user");
      } else {
        res.status(201).send("User successfully saved");
      }
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  // We get the ID from the url path :
  const userId = req.params.id;
  // We get the new attribute values for the user from req.body
  const userPropsToUpdate = req.body;
  // We send a UPDATE query to the DB
  connection.query(
    "UPDATE users SET ? WHERE id = ?",
    [userPropsToUpdate, userId],
    (err) => {
      // Once the DB operation is over, we can respond to the HTTP request
      if (err) {
        console.log(err);
        res.status(500).send("Error updating a user");
      } else {
        res.status(200).send("User updated successfully 🎉");
      }
    }
  );
});

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "DELETE FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("😱 Error deleting an user");
      } else {
        res.status(200).send("🎉 User deleted!");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is runing on ${port}`);
});
