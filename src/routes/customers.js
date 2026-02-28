const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const customerService = require('../services/customers');

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
    const result = await customerService.listCustomers(null, opts);
    return res.json(result);
  }
  const result = await customerService.listCustomers(req.tenantShopId, opts);
  res.json(result);
}));

router.get('/:customerId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const customer = await customerService.getCustomerAdmin(shopId, req.params.customerId);
  res.json(customer);
}));

router.post('/', validateBody({
  email: { required: true, type: 'email' },
}), asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer({
    shopId: req.tenantShopId, ...req.body,
  });
  res.status(201).json(customer);
}));

router.patch('/:customerId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const customer = await customerService.updateCustomerAdmin(shopId, req.params.customerId, req.body);
  res.json(customer);
}));

router.delete('/:customerId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const result = await customerService.deleteCustomer(shopId, req.params.customerId);
  res.json(result);
}));

module.exports = router;