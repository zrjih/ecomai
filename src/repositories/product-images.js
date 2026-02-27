const db = require('../db');

async function listByProduct(productId, shopId) {
  const { rows } = await db.query(
    `SELECT * FROM product_images
     WHERE product_id = $1 AND shop_id = $2
     ORDER BY sort_order ASC, created_at ASC`,
    [productId, shopId]
  );
  return rows;
}

async function create(shopId, productId, { url, alt_text = null, sort_order = 0, is_primary = false }) {
  // If setting as primary, unset other primaries first
  if (is_primary) {
    await db.query(
      `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1 AND shop_id = $2`,
      [productId, shopId]
    );
  }
  const { rows } = await db.query(
    `INSERT INTO product_images (shop_id, product_id, url, alt_text, sort_order, is_primary)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [shopId, productId, url, alt_text, sort_order, is_primary]
  );
  return rows[0];
}

async function setPrimary(imageId, productId, shopId) {
  await db.query(
    `UPDATE product_images SET is_primary = FALSE WHERE product_id = $1 AND shop_id = $2`,
    [productId, shopId]
  );
  const { rows } = await db.query(
    `UPDATE product_images SET is_primary = TRUE WHERE id = $1 AND shop_id = $2 RETURNING *`,
    [imageId, shopId]
  );
  return rows[0];
}

async function remove(imageId, shopId) {
  const { rows } = await db.query(
    `DELETE FROM product_images WHERE id = $1 AND shop_id = $2 RETURNING *`,
    [imageId, shopId]
  );
  return rows[0];
}

async function updateSortOrder(imageId, shopId, sortOrder) {
  const { rows } = await db.query(
    `UPDATE product_images SET sort_order = $1 WHERE id = $2 AND shop_id = $3 RETURNING *`,
    [sortOrder, imageId, shopId]
  );
  return rows[0];
}

/** Fetch images for multiple products at once (for listing pages) */
async function listByProducts(productIds, shopId) {
  if (!productIds.length) return {};
  const { rows } = await db.query(
    `SELECT * FROM product_images
     WHERE product_id = ANY($1) AND shop_id = $2
     ORDER BY sort_order ASC, created_at ASC`,
    [productIds, shopId]
  );
  const map = {};
  for (const r of rows) {
    (map[r.product_id] ||= []).push(r);
  }
  return map;
}

module.exports = { listByProduct, listByProducts, create, setPrimary, remove, updateSortOrder };
