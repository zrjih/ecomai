const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const deliveryService = require('../services/delivery-requests');

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
    const result = await deliveryService.listDeliveryRequests(null, opts);
    return res.json(result);
  }
  const result = await deliveryService.listDeliveryRequests(req.tenantShopId, opts);
  res.json(result);
}));

// ── Admin: view assignments for a specific driver ──
router.get('/by-driver/:driverUserId', asyncHandler(async (req, res) => {
  const result = await deliveryService.listDriverAssignments(req.params.driverUserId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    status: req.query.status,
  });
  res.json(result);
}));

router.get('/:deliveryRequestId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const request = await deliveryService.getDeliveryRequest(shopId, req.params.deliveryRequestId);
  res.json(request);
}));

router.post('/', validateBody({
  orderId: { required: true, type: 'string' },
  pickup_address: { required: true },
  delivery_address: { required: true },
}), asyncHandler(async (req, res) => {
  const delivery = await deliveryService.createDeliveryRequest({
    shopId: req.tenantShopId,
    orderId: req.body.orderId,
    pickup_address: req.body.pickup_address,
    delivery_address: req.body.delivery_address,
    notes: req.body.notes,
  });
  res.status(201).json(delivery);
}));

router.patch('/:deliveryRequestId/status', validateBody({
  status: { required: true, type: 'string', oneOf: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'] },
}), asyncHandler(async (req, res) => {
  const request = await deliveryService.updateDeliveryStatus({
    shopId: req.tenantShopId, deliveryRequestId: req.params.deliveryRequestId, status: req.body.status,
  });
  res.json(request);
}));

router.patch('/:deliveryRequestId/assign', validateBody({
  driver_user_id: { required: true, type: 'string' },
}), asyncHandler(async (req, res) => {
  const request = await deliveryService.assignDriver({
    shopId: req.tenantShopId, deliveryRequestId: req.params.deliveryRequestId, driverUserId: req.body.driver_user_id,
  });
  res.json(request);
}));

router.delete('/:deliveryRequestId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  await deliveryService.deleteDeliveryRequest(shopId, req.params.deliveryRequestId);
  res.json({ message: 'Delivery request deleted' });
}));

module.exports = router;