/**
 * Test setup helper — connects to PostgreSQL, runs schema, provides cleanup.
 * 
 * Usage:
 *   const { setup, teardown, shopId, adminUserId } = require('./helpers/setup');
 *   beforeAll(setup);
 *   afterAll(teardown);
 * 
 * NOTE: Bun runs all test files in a single process, sharing a single module cache.
 * Setup always ensures the shop+user exist (idempotent), and teardown only cleans
 * entity data — leaving the shop and user intact for subsequent test suites.
 */
const db = require('../../src/db');
const crypto = require('crypto');

const SHOP_ID = crypto.randomUUID();
const ADMIN_USER_ID = crypto.randomUUID();
const SLUG = 'test-shop-' + SHOP_ID.slice(0, 8);
const EMAIL = `admin-${ADMIN_USER_ID.slice(0, 8)}@test.dev`;

async function setup() {
  // Always upsert — idempotent so it works even if already exists
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('password123', 10);

  await db.query(`
    INSERT INTO shops (id, name, slug, industry, subscription_plan, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [SHOP_ID, 'Test Shop', SLUG, 'general', 'free', 'active']);

  await db.query(`
    INSERT INTO users (id, shop_id, email, password_hash, role, full_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
  `, [ADMIN_USER_ID, SHOP_ID, EMAIL, hash, 'shop_admin', 'Test Admin']);
}

async function teardown() {
  // Clean up entity data but keep the shop and user for subsequent test suites
  try {
    await db.query('DELETE FROM inventory_movements WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE shop_id = $1)', [SHOP_ID]);
    await db.query('DELETE FROM refunds WHERE payment_id IN (SELECT id FROM payments WHERE shop_id = $1)', [SHOP_ID]);
    await db.query('DELETE FROM payments WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM delivery_requests WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM orders WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE shop_id = $1)', [SHOP_ID]);
    await db.query('DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE shop_id = $1)', [SHOP_ID]);
    await db.query('DELETE FROM products WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM category_requests WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM categories WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM marketing_campaigns WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM website_settings WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM customers WHERE shop_id = $1', [SHOP_ID]);
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [ADMIN_USER_ID]);
  } catch (e) {
    console.error('Teardown error:', e.message);
  }
}

module.exports = { setup, teardown, shopId: SHOP_ID, adminUserId: ADMIN_USER_ID };
