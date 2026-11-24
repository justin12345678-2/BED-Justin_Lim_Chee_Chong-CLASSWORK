const express = require('express');
const { sql, config } = require('./db');
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Book Category API');
});

app.get('/categories', (req, res) => {
  res.json(['Fiction', 'Science', 'Technology']);
});

app.get('/about', (req, res) => {
  res.send('This is the Book Category API');
});

app.get('/publishers', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query('SELECT * FROM Publisher');

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/publishers/:id', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Publisher WHERE PublisherID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/publishers', async (req, res) => {
  try {
    const { PublisherID, Name } = req.body;

    if (!Number.isInteger(PublisherID) ||
        PublisherID < 1 || PublisherID > 32767 ||
        typeof Name !== 'string' ||
        !Name.trim() || Name.length > 50) {
      return res.status(400).json({
        error: 'Invalid PublisherID or Name'
      });
    }

    const pool = await sql.connect(config);

    await pool.request()
      .input('id', sql.SmallInt, PublisherID)
      .input('name', sql.VarChar(50), Name)
      .query(`INSERT INTO Publisher (PublisherID, Name)
              VALUES (@id, @name)`);

    res.status(201).json({ PublisherID, Name });

  } catch (err) {
    if (err.number === 2627 || err.number === 2601) {
      return res.status(409).json({
        error: 'PublisherID already exists'
      });
    }

    res.status(500).json({
      error: 'Database error'
    });
  }
});

app.put('/publishers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { Name } = req.body;

    if (!Number.isInteger(id) || id < 1 || id > 32767 ||
        typeof Name !== 'string' ||
        !Name.trim() || Name.length > 50) {
      return res.status(400).json({
        error: 'Invalid PublisherID or Name'
      });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('id', sql.SmallInt, id)
      .input('name', sql.VarChar(50), Name)
      .query(`UPDATE Publisher
              SET Name = @name
              WHERE PublisherID = @id`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Publisher not found'
      });
    }

    res.status(200).json({
      PublisherID: id,
      Name
    });

  } catch (err) {
    res.status(500).json({
      error: 'Database error'
    });
  }
});

app.delete('/publishers/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1 || id > 32767) {
      return res.status(400).json({
        error: 'Invalid PublisherID'
      });
    }

    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('id', sql.SmallInt, id)
      .query('DELETE FROM Publisher WHERE PublisherID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'Publisher not found'
      });
    }

    res.status(204).send();

  } catch (err) {
    res.status(500).json({
      error: 'Database error'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});