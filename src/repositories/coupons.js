const db = require('../db');

async function findByCode(shopId, code) {
  const res = await db.query(
    'SELECT * FROM coupons WHERE shop_id = $1 AND UPPER(code) = UPPER($2)',
    [shopId, code]
  );
  return res.rows[0] || null;
}

async function findByIdAndShop(couponId, shopId) {
  const res = await db.query(
    'SELECT * FROM coupons WHERE id = $1 AND shop_id = $2',
    [couponId, shopId]
  );
  return res.rows[0] || null;
}

async function createCoupon(data) {
  const res = await db.query(
    `INSERT INTO coupons (shop_id, code, type, value, min_order_amount, max_discount, usage_limit, starts_at, expires_at, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [data.shop_id, data.code.toUpperCase(), data.type || 'percentage', data.value,
     data.min_order_amount || 0, data.max_discount || null, data.usage_limit || null,
     data.starts_at || null, data.expires_at || null, data.is_active !== false]
  );
  return res.rows[0];
}

async function updateCoupon(couponId, shopId, patch) {
  const allowed = ['code', 'type', 'value', 'min_order_amount', 'max_discount', 'usage_limit', 'starts_at', 'expires_at', 'is_active'];
  const sets = [];
  const params = [];
  let idx = 1;
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      sets.push(`${k} = $${idx}`);
      params.push(k === 'code' ? patch[k].toUpperCase() : patch[k]);
      idx++;
    }
  }
  if (sets.length === 0) return findByIdAndShop(couponId, shopId);
  sets.push(`updated_at = now()`);
  params.push(couponId, shopId);
  const res = await db.query(
    `UPDATE coupons SET ${sets.join(', ')} WHERE id = $${idx} AND shop_id = $${idx + 1} RETURNING *`,
    params
  );
  return res.rows[0] || null;
}

async function incrementUsage(couponId, client) {
  const q = client || db;
  await q.query(
    'UPDATE coupons SET usage_count = usage_count + 1, updated_at = now() WHERE id = $1',
    [couponId]
  );
}

async function listByShop(shopId, { page = 1, limit = 50, search, is_active } = {}) {
  const conditions = ['shop_id = $1'];
  const params = [shopId];
  let idx = 2;
  if (search) { conditions.push(`(code ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
  if (is_active !== undefined) { conditions.push(`is_active = $${idx}`); params.push(is_active); idx++; }
  const where = 'WHERE ' + conditions.join(' AND ');
  const countRes = await db.query(`SELECT COUNT(*) FROM coupons ${where}`, params);
  const total = parseInt(countRes.rows[0].count, 10);
  const offset = (page - 1) * limit;
  const res = await db.query(
    `SELECT * FROM coupons ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset]
  );
  return { items: res.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function deleteCoupon(couponId, shopId) {
  await db.query('DELETE FROM coupons WHERE id = $1 AND shop_id = $2', [couponId, shopId]);
}

module.exports = { findByCode, findByIdAndShop, createCoupon, updateCoupon, incrementUsage, listByShop, deleteCoupon };
