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
        const id = result.insertId;
        const createMovie ={ id, title, director, year, color, duration }
        res.status(201).json(createMovie);
      }
    }
  );
});

app.put('/api/movies/:id', (req, res) => {
  const movieId = req.params.id;
  const db = connection.promise();
  let existingMovie = null;
  db.query('SELECT * FROM movies WHERE id = ?', [movieId])
    .then(([results]) => {
      existingMovie= results[0];
      if (!existingMovie) return Promise.reject('RECORD_NOT_FOUND');
      return db.query('UPDATE movies SET ? WHERE id = ?', [req.body, movieId]);
    })
    .then(() => {
      res.status(200).json({ ...existingMovie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`User with id ${movieId} not found.`);
      else res.status(500).send('Error updating a user');
    });
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

app.post('/api/users', (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query(
    'INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)',
    [firstname, lastname, email],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error saving the user');
      } else {
        const id = result.insertId;
        const createdUser = { id, firstname, lastname, email };
        res.status(201).json(createdUser);
      }
    }
  );
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const db = connection.promise();
  let existingUser = null;
  db.query('SELECT * FROM users WHERE id = ?', [userId])
    .then(([results]) => {
      existingUser = results[0];
      if (!existingUser) return Promise.reject('RECORD_NOT_FOUND');
      return db.query('UPDATE users SET ? WHERE id = ?', [req.body, userId]);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === 'RECORD_NOT_FOUND')
        res.status(404).send(`User with id ${userId} not found.`);
      else res.status(500).send('Error updating a user');
    });
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
