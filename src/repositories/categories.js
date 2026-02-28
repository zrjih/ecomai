const db = require('../db');

async function listByShop(shopId, { status, parentId, search, page = 1, limit = 50 } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;
  if (shopId) { conditions.push(`shop_id = $${idx}`); params.push(shopId); idx++; }
  if (status) { conditions.push(`status = $${idx}`); params.push(status); idx++; }
  if (parentId === null) { conditions.push('parent_id IS NULL'); }
  else if (parentId) { conditions.push(`parent_id = $${idx}`); params.push(parentId); idx++; }
  if (search) { conditions.push(`name ILIKE $${idx}`); params.push(`%${search}%`); idx++; }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const countRes = await db.query(`SELECT COUNT(*) FROM categories ${where}`, params);
  const total = parseInt(countRes.rows[0].count, 10);
  const offset = (page - 1) * limit;
  const res = await db.query(
    `SELECT * FROM categories ${where} ORDER BY sort_order ASC, name ASC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );
  return { items: res.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function findById(id, shopId) {
  if (shopId) {
    const res = await db.query('SELECT * FROM categories WHERE id = $1 AND shop_id = $2', [id, shopId]);
    return res.rows[0] || null;
  }
  const res = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
  return res.rows[0] || null;
}

async function findBySlug(slug, shopId) {
  if (shopId) {
    const res = await db.query('SELECT * FROM categories WHERE slug = $1 AND shop_id = $2', [slug, shopId]);
    return res.rows[0] || null;
  }
  const res = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
  return res.rows[0] || null;
}

async function create({ shop_id, name, slug, description, image_url, parent_id, sort_order, status }) {
  const res = await db.query(
    `INSERT INTO categories (shop_id, name, slug, description, image_url, parent_id, sort_order, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [shop_id, name, slug, description || null, image_url || null, parent_id || null, sort_order || 0, status || 'active']
  );
  return res.rows[0];
}

async function update(id, shopId, patch) {
  const allowed = ['name', 'slug', 'description', 'image_url', 'parent_id', 'sort_order', 'status'];
  const sets = [];
  const params = [];
  let idx = 1;
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      sets.push(`${k} = $${idx}`);
      params.push(patch[k]);
      idx++;
    }
  }
  if (sets.length === 0) return findById(id, shopId);
  sets.push(`updated_at = now()`);
  params.push(id, shopId);
  const res = await db.query(
    `UPDATE categories SET ${sets.join(', ')} WHERE id = $${idx} AND shop_id = $${idx + 1} RETURNING *`,
    params
  );
  return res.rows[0] || null;
}

async function remove(id, shopId) {
  const res = await db.query('DELETE FROM categories WHERE id = $1 AND shop_id = $2 RETURNING id', [id, shopId]);
  return res.rowCount > 0;
}

async function countByShop(shopId) {
  const q = shopId ? 'SELECT COUNT(*) FROM categories WHERE shop_id = $1' : 'SELECT COUNT(*) FROM categories';
  const res = await db.query(q, shopId ? [shopId] : []);
  return parseInt(res.rows[0].count, 10);
}

async function getProductCounts(shopId) {
  const where = shopId
    ? `WHERE c.shop_id = $1 AND c.status = 'active'`
    : `WHERE c.status = 'active'`;
  const res = await db.query(
    `SELECT c.id, c.name, c.slug, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.shop_id = c.shop_id
     ${where}
     GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC`,
    shopId ? [shopId] : []
  );
  return res.rows;
}

module.exports = { listByShop, findById, findBySlug, create, update, remove, countByShop, getProductCounts };
