const { describe, it, beforeAll, afterAll } = require('bun:test');
const assert = require('node:assert/strict');
const { setup, teardown, shopId } = require('./helpers/setup');
const productService = require('../src/services/products');
const variantService = require('../src/services/product-variants');
const orderService = require('../src/services/orders');
const deliveryService = require('../src/services/delivery-requests');

describe('delivery driver service', () => {
  beforeAll(setup);
  afterAll(teardown);

  let orderId, deliveryId;

  it('creates delivery request for order', async () => {
    const product = await productService.createProduct({
      shopId, name: 'Night Roast', slug: `night-roast-${Date.now()}`, base_price: 14,
    });
    const variant = await variantService.createVariant({
      shopId, productId: product.id,
      sku: `NR-${Date.now()}`, title: 'Default', price: 14, inventory_qty: 50,
    });
    const order = await orderService.createOrder({
      shopId, customer_email: 'driver@example.com',
      items: [{ product_id: product.id, variant_id: variant.id, quantity: 1 }],
    });
    orderId = order.id;

    const request = await deliveryService.createDeliveryRequest({
      shopId, orderId,
      pickup_address: { city: 'Dhaka' }, delivery_address: { city: 'Chittagong' },
    });
    assert.ok(request.id);
    assert.equal(request.status, 'pending');
    deliveryId = request.id;
  });

  it('assigns driver to delivery', async () => {
    const crypto = require('crypto');
    const driverUUID = crypto.randomUUID();
    // Create a user to act as driver
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await require('../src/db').query(
      `INSERT INTO users (id, shop_id, email, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [driverUUID, shopId, `driver-${Date.now()}@test.dev`, hash, 'delivery_agent', 'Test Driver']
    );
    const assigned = await deliveryService.assignDriver({
      shopId, deliveryRequestId: deliveryId, driverUserId: driverUUID,
    });
    assert.equal(assigned.status, 'assigned');
  });

  it('lists driver assignments', async () => {
    // Use a UUID for driver lookup
    const crypto = require('crypto');
    const driverUUID = crypto.randomUUID();
    const assignments = await deliveryService.listDriverAssignments(driverUUID);
    assert.ok(Array.isArray(assignments.items));
  });
});