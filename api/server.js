// ---- helpers ---------------------------------------------------------------
function toNumber(v) {
  if (v == null) return null;
  if (typeof v === 'string') v = v.replace(',', '.');
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---- deps ------------------------------------------------------------------
const express = require('express');
const cors = require('cors');
const ibmdb = require('ibm_db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const connStr = process.env.DB2_CONNSTR;

// ---- root ping -------------------------------------------------------------
app.get('/', (_req, res) => {
  res.send('API is running. Try /api/products');
});

// ---- GET all ---------------------------------------------------------------
app.get('/api/products', async (_req, res) => {
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

// ---- CREATE ---------------------------------------------------------------
app.post('/api/products', async (req, res) => {
  const { name, category, price, description, imageUrl, stock = 0, active = 1 } = req.body;
  const numPrice  = toNumber(price);
  const numStock  = toNumber(stock)  ?? 0;
  const numActive = toNumber(active) ?? 1;

  if (!name || numPrice == null) {
    return res.status(400).json({ error: 'name and a valid price are required' });
  }

  let conn;
  try {
    conn = await ibmdb.open(connStr);

    const insertSql = `
      INSERT INTO PRODUCTS (NAME, CATEGORY, PRICE, DESCRIPTION, IMAGE_URL, STOCK, ACTIVE)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const insertParams = [name, category || null, numPrice, description || null, imageUrl || null, numStock, numActive];

    const insertStmt = await conn.prepareAsync(insertSql);
    await insertStmt.executeAsync(insertParams);
    insertStmt.closeSync();

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
  } finally { if (conn) conn.closeSync(); }
});


// ---- UPDATE ---------------------------------------------------------------
app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, category, price, description, imageUrl, stock = 0, active = 1 } = req.body;

  const numPrice  = toNumber(price);
  const numStock  = toNumber(stock)  ?? 0;
  const numActive = toNumber(active) ?? 1;

  if (!id) return res.status(400).json({ error: 'invalid id' });
  if (!name || numPrice == null) {
    return res.status(400).json({ error: 'name and a valid price are required' });
  }

  let conn;
  try {
    conn = await ibmdb.open(connStr);

    const updateSql = `
      UPDATE PRODUCTS
         SET NAME=?, CATEGORY=?, PRICE=?, DESCRIPTION=?, IMAGE_URL=?, STOCK=?, ACTIVE=?
       WHERE ID=?
    `;
    const updateParams = [name, category || null, numPrice, description || null, imageUrl || null, numStock, numActive, id];

    await conn.query(updateSql, updateParams);   // <-- brez prepareAsync

    const [row] = await conn.query(
      `SELECT ID AS id, NAME AS name, CATEGORY AS category, PRICE AS price, 
              DESCRIPTION AS description, IMAGE_URL AS imageUrl, STOCK AS stock, 
              ACTIVE AS active, CREATED_AT AS createdAt
         FROM PRODUCTS WHERE ID=?`,
      [id]
    );

    res.json(row || { ok: true });
  } catch (e) {
    console.error('PUT /api/products/:id error:', e);
    res.status(500).json({ error: e.message });
  } finally { if (conn) conn.closeSync(); }
});


// ---- DELETE ---------------------------------------------------------------
app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });

  let conn;
  try {
    conn = await ibmdb.open(connStr);
    await conn.query('DELETE FROM PRODUCTS WHERE ID=?', [id]);  
    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/products/:id error:', e);
    res.status(500).json({ error: e.message });
  } finally { if (conn) conn.closeSync(); }
});

// ---- start ---------------------------------------------------------------
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Failed to start server on port', port, err);
  process.exit(1);
});
