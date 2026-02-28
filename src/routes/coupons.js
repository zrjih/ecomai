const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const couponService = require('../services/coupons');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant, requireTenantContext);

router.get('/', asyncHandler(async (req, res) => {
  const isSuperAdmin = req.auth.role === 'super_admin';
  const opts = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    search: req.query.search,
  };
  if (isSuperAdmin && req.query.all === 'true') {
    const result = await couponService.listCoupons(null, opts);
    return res.json(result);
  }
  const result = await couponService.listCoupons(req.tenantShopId, opts);
  res.json(result);
}));

router.get('/:couponId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const coupon = await couponService.getCoupon(shopId, req.params.couponId);
  res.json(coupon);
}));

router.post('/', validateBody({
  code: { required: true, type: 'string', minLength: 2 },
  value: { required: true, type: 'number', min: 0.01 },
  type: { type: 'string', oneOf: ['percentage', 'fixed'] },
}), asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon({ shopId: req.tenantShopId, ...req.body });
  res.status(201).json(coupon);
}));

router.patch('/:couponId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const coupon = await couponService.updateCoupon(shopId, req.params.couponId, req.body);
  res.json(coupon);
}));

router.delete('/:couponId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const result = await couponService.deleteCoupon(shopId, req.params.couponId);
  res.json(result);
}));

module.exports = router;
