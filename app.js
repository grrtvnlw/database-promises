const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const config = {
  host: 'localhost',
  port: '5432',
  database: 'restaurant',
  user: 'postgres',
};
const db = pgp(config);

// Get full list of restaurants
app.get('/api/restaurants', (req, res) => {
  db.query('SELECT * FROM restaurant ORDER BY id ASC').then((results) => {
    res.json(results);
  });
}); 

// Get specific restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
  db.oneOrNone('SELECT * FROM restaurant WHERE restaurant.id = $1', req.params.id)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({});
      }
    })
    .catch((e) => {
      res.status(500).json({
        error: 'Database Error',
      });
    });
});

// Add a new restaurant
app.post('/api/restaurants', (req, res) => {
  db.one('INSERT INTO restaurant VALUES (DEFAULT, ${name}, ${distance}, ${stars}, ${category}, ${fav}, ${takeout}, ${visited}) RETURNING *', req.body)
  .then((result) => {
    res.status(201).json(result);
  })
});

// Update a restaurant 
app.put('/api/restaurants/:id&:distance', (req, res) => {
  console.log(req.body);
  db.result('update restaurant set distance = ${distance} WHERE id = ${id} returning *', req.params)
      .then((result) => {
          res.status(201).json(result);
      })
      .catch((e) => {
        res.status(500).json({
          error: 'Database Error',
        });
      });
})

// Delete a restaurant 
app.delete('/api/restaurants/:restaurant_name', (req, res) => {
  console.log(req)
  db.oneOrNone('SELECT * FROM restaurant WHERE restaurant_name = $1', req.params.restaurant_name)
  .then((result) => {
    console.log(result)
    if (result) {
      res.status(200).json(result);
      db.oneOrNone('DELETE FROM restaurant WHERE restaurant.restaurant_name = $1', req.params.restaurant_name)
    } else {
      res.status(404).json({});
    } 
  })
  .catch((e) => {
    res.status(500).json({
      error: 'Database Error',
    });
  });
})

app.listen(PORT, () => console.log(`Running: http://localhost:${PORT}`));
