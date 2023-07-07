const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(bodyParser.json());

// Function to create a database connection
async function createConn() {
  const connection = await mysql.createConnection({
    host: "mydbinstance-instance-1.cupfsuz96vpt.us-east-1.rds.amazonaws.com",
    user: "admin",
    password: "admin123",
    database: "assignmentA3",  
  });

  return connection;
}

async function createProductsTable(connection) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      availability BOOLEAN NOT NULL
    )
  `;

  await connection.query(createTableQuery);
}

app.post('/store-products', async (req, res) => {
  try {
    const connection = await createConn();
    await createProductsTable(connection);

    const products = req.body.products;
    const queryText =
      'INSERT INTO products (name, price, availability) VALUES (?, ?, ?)';

    await Promise.all(
      products.map(product => {
        return connection.query(queryText, [
          product.name,
          product.price,
          product.availability,
        ]);
      })
    );

    await connection.end();
    res.status(200).json({ message: 'Success.' });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Endpoint to retrieve all products from the "products" table
app.get('/list-products', async (req, res) => {
    try {
      const connection = await createConn();
      await createProductsTable(connection);
  
      const [rows] = await connection.query('SELECT * FROM products');
  
      await connection.end();
  
      const products = rows.map(row => ({
        name: row.name,
        price: parseFloat(row.price).toFixed(0), // Remove decimal and convert to string
        availability: Boolean(row.availability),
      }));
  
      res.status(200).json({ products });
    } catch (err) {
      res.status(400).send(err.message);
    }
  });
  

app.listen(80, () => console.log('Listening on port 80'));
