const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const orderService = require('../services/orders');
const deliveryService = require('../services/delivery-requests');
const paymentService = require('../services/payments');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant, requireTenantContext);

router.get('/', asyncHandler(async (req, res) => {
  const isSuperAdmin = req.auth.role === 'super_admin';
  const opts = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    status: req.query.status,
    search: req.query.search,
  };
  if (isSuperAdmin && req.query.all === 'true') {
    const result = await orderService.listOrdersByShop(null, opts);
    return res.json(result);
  }
  const result = await orderService.listOrdersByShop(req.tenantShopId, opts);
  res.json(result);
}));

router.get('/:orderId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const order = await orderService.getOrder(shopId, req.params.orderId);
  res.json(order);
}));

router.post('/', validateBody({
  customer_email: { required: true, type: 'email' },
  items: { required: true, type: 'array' },
}), asyncHandler(async (req, res) => {
  const order = await orderService.createOrder({
    shopId: req.tenantShopId,
    customer_email: req.body.customer_email,
    customer_id: req.body.customer_id,
    items: req.body.items,
    shipping_address: req.body.shipping_address,
  });
  res.status(201).json(order);
}));

router.patch('/:orderId/status', validateBody({
  status: { required: true, type: 'string', oneOf: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] },
}), asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.tenantShopId, req.params.orderId, req.body.status);
  res.json(order);
}));

// General order update (notes, shipping_address, etc.)
router.patch('/:orderId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const order = await orderService.updateOrder(shopId, req.params.orderId, req.body);
  res.json(order);
}));

// Delete order (only pending/cancelled)
router.delete('/:orderId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  await orderService.deleteOrder(shopId, req.params.orderId);
  res.json({ message: 'Order deleted' });
}));

router.post('/:orderId/delivery-requests', asyncHandler(async (req, res) => {
  const delivery = await deliveryService.createDeliveryRequest({
    shopId: req.tenantShopId, orderId: req.params.orderId,
    pickup_address: req.body.pickup_address, delivery_address: req.body.delivery_address,
    notes: req.body.notes,
  });
  res.status(201).json(delivery);
}));

router.post('/:orderId/payments', asyncHandler(async (req, res) => {
  const payment = await paymentService.createManualPayment({
    shopId: req.tenantShopId, orderId: req.params.orderId,
    amount: req.body.amount, currency: req.body.currency, method: req.body.method,
  });
  res.status(201).json(payment);
}));

module.exports = router;