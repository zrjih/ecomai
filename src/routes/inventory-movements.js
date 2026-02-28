const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const inventoryService = require('../services/inventory-movements');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant, requireTenantContext);

router.get('/', asyncHandler(async (req, res) => {
  const result = await inventoryService.listMovements(req.tenantShopId, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    type: req.query.type,
  });
  res.json(result);
}));

router.post('/', validateBody({
  product_id: { required: true, type: 'string' },
  type: { required: true, type: 'string', oneOf: ['in', 'out', 'adjustment', 'return'] },
  quantity: { required: true, type: 'number', min: 1 },
}), asyncHandler(async (req, res) => {
  const movement = await inventoryService.createMovement({
    shop_id: req.tenantShopId, ...req.body,
  });
  res.status(201).json(movement);
}));

module.exports = router;