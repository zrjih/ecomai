const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const dashboardService = require('../services/dashboard');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant);

// Shop dashboard
router.get('/shop', requireTenantContext, asyncHandler(async (req, res) => {
  const data = await dashboardService.getShopDashboard(req.tenantShopId);
  res.json(data);
}));

// Revenue timeline for charts
router.get('/shop/revenue-timeline', requireTenantContext, asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const data = await dashboardService.getRevenueTimeline(req.tenantShopId, { days });
  res.json(data);
}));

// Super admin platform-wide dashboard
router.get('/platform', requireRoles(['super_admin']), asyncHandler(async (req, res) => {
  const data = await dashboardService.getSuperAdminDashboard();
  res.json(data);
}));

module.exports = router;
