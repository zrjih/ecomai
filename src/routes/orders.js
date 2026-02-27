const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const orderService = require('../services/orders');
const deliveryService = require('../services/delivery-requests');
const paymentService = require('../services/payments');
const { DomainError } = require('../errors/domain-error');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant, requireTenantContext);

router.get('/', (req, res) => {
  const items = orderService.listOrdersByShop(req.tenantShopId);
  return res.json({ items, count: items.length });
});

router.get('/:orderId', (req, res) => {
  try {
    const order = orderService.getOrder(req.tenantShopId, req.params.orderId);
    return res.json(order);
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
});

router.post('/', (req, res) => {
  const { customer_email, items } = req.body;
  if (!customer_email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'customer_email and non-empty items are required' });
  }

  try {
    const order = orderService.createOrder({
      shopId: req.tenantShopId,
      customer_email,
      items,
    });

    return res.status(201).json(order);
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

router.patch('/:orderId/status', (req, res) => {
  try {
    const order = orderService.updateOrderStatus(req.tenantShopId, req.params.orderId, req.body.status);
    return res.json(order);
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    return res.status(500).json({ message: 'Failed to update order status' });
  }
});

router.post('/:orderId/delivery-requests', (req, res) => {
  try {
    const delivery = deliveryService.createDeliveryRequest({
      shopId: req.tenantShopId,
      orderId: req.params.orderId,
      provider: req.body.provider,
      pickup_address: req.body.pickup_address,
      dropoff_address: req.body.dropoff_address,
    });
    return res.status(201).json(delivery);
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    return res.status(500).json({ message: 'Failed to create delivery request' });
  }
});

router.post('/:orderId/payments', (req, res) => {
  try {
    const payment = paymentService.createPayment({
      shopId: req.tenantShopId,
      orderId: req.params.orderId,
      amount: req.body.amount,
      currency: req.body.currency,
      provider: req.body.provider,
    });
    return res.status(201).json(payment);
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }
    return res.status(500).json({ message: 'Failed to create payment' });
  }
});

module.exports = router;
