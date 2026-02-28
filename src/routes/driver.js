const express = require('express');
const authService = require('../services/auth');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const deliveryService = require('../services/delivery-requests');

const router = express.Router();

router.post('/auth/login', validateBody({
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 1 },
}), asyncHandler(async (req, res) => {
  const tokens = await authService.login(req.body.email, req.body.password);
  res.json(tokens);
}));

router.use(authRequired, requireRoles(['delivery_agent']));

router.get('/assignments', asyncHandler(async (req, res) => {
  const result = await deliveryService.listDriverAssignments(req.auth.sub, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
  });
  res.json(result);
}));

router.post('/assignments/:id/location', validateBody({
  lat: { required: true, type: 'number' },
  lng: { required: true, type: 'number' },
}), asyncHandler(async (req, res) => {
  const request = await deliveryService.driverPostLocation({
    driverUserId: req.auth.sub, deliveryRequestId: req.params.id,
    lat: req.body.lat, lng: req.body.lng,
  });
  res.json(request);
}));

router.patch('/assignments/:id/status', validateBody({
  status: { required: true, type: 'string', oneOf: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'] },
}), asyncHandler(async (req, res) => {
  const request = await deliveryService.driverUpdateStatus({
    driverUserId: req.auth.sub, deliveryRequestId: req.params.id, status: req.body.status,
  });
  res.json(request);
}));

module.exports = router;