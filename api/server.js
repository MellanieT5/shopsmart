const express = require('express');
const cors = require('cors');
const ibmdb = require('ibm_db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const connStr = process.env.DB2_CONNSTR;

// ping na root — to si že videla
// root ping (to že imaš)
app.get('/', (req, res) => {
  res.send('API is running. Try /api/products');
});

// GET all (camelCase keys)
app.get('/api/products', async (req, res) => {
  let conn;
  try {
    conn = await ibmdb.open(connStr);
    const rows = await conn.query(`
      SELECT 
        ID          AS id,
        NAME        AS name,
        CATEGORY    AS category,
        PRICE       AS price,
        DESCRIPTION AS description,
        IMAGE_URL   AS imageUrl,
        STOCK       AS stock,
        ACTIVE      AS active,
        CREATED_AT  AS createdAt
      FROM PRODUCTS
      ORDER BY ID
    `);
    res.json(rows);
  } catch (e) {
    console.error('GET /api/products error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.closeSync();
  }
});


// CREATE
app.post('/api/products', async (req, res) => {
  const { name, category, price, description, imageUrl, stock = 0, active = 1 } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name and price are required' });

  let conn;
  try {
    conn = await ibmdb.open(connStr);
    const sql = `
      INSERT INTO PRODUCTS (NAME, CATEGORY, PRICE, DESCRIPTION, IMAGE_URL, STOCK, ACTIVE)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [name, category || null, +price, description || null, imageUrl || null, +stock, +active];

    const stmt = await conn.prepareAsync(sql);
    await stmt.executeAsync(params);
    stmt.closeSync();

    const [row] = await conn.query(`
      SELECT ID AS id, NAME AS name, CATEGORY AS category, PRICE AS price, 
             DESCRIPTION AS description, IMAGE_URL AS imageUrl, STOCK AS stock, 
             ACTIVE AS active, CREATED_AT AS createdAt
      FROM PRODUCTS
      ORDER BY ID DESC
      FETCH FIRST 1 ROW ONLY
    `);
    res.status(201).json(row);
  } catch (e) {
    console.error('POST /api/products error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.closeSync();
  }
});

// UPDATE
app.put('/api/products/:id', async (req, res) => {
  const id = +req.params.id;
  const { name, category, price, description, imageUrl, stock = 0, active = 1 } = req.body;

  let conn;
  try {
    conn = await ibmdb.open(connStr);
    const sql = `
      UPDATE PRODUCTS
      SET NAME=?, CATEGORY=?, PRICE=?, DESCRIPTION=?, IMAGE_URL=?, STOCK=?, ACTIVE=?
      WHERE ID=?
    `;
    const params = [name, category, +price, description, imageUrl, +stock, +active, id];

    const stmt = await conn.prepareAsync(sql);
    await stmt.executeAsync(params);
    stmt.closeSync();

    const [row] = await conn.query(`
      SELECT ID AS id, NAME AS name, CATEGORY AS category, PRICE AS price, 
             DESCRIPTION AS description, IMAGE_URL AS imageUrl, STOCK AS stock, 
             ACTIVE AS active, CREATED_AT AS createdAt
      FROM PRODUCTS WHERE ID=${id}
    `);
    res.json(row || { ok: true });
  } catch (e) {
    console.error('PUT /api/products/:id error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.closeSync();
  }
});

// DELETE
app.delete('/api/products/:id', async (req, res) => {
  const id = +req.params.id;
  let conn;
  try {
    conn = await ibmdb.open(connStr);
    await conn.query(`DELETE FROM PRODUCTS WHERE ID=${id}`);
    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/products/:id error:', e);
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.closeSync();
  }
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`API running at http://localhost:${process.env.PORT || 3000}`);
});
