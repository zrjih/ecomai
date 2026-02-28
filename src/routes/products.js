const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const productService = require('../services/products');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant, requireTenantContext);

router.get('/', asyncHandler(async (req, res) => {
  const isSuperAdmin = req.auth.role === 'super_admin';
  const opts = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 50,
    search: req.query.search,
    category: req.query.category,
    status: req.query.status,
  };
  if (isSuperAdmin && req.query.all === 'true') {
    const result = await productService.listProducts(null, opts);
    return res.json(result);
  }
  const result = await productService.listProducts(req.tenantShopId, opts);
  res.json(result);
}));

router.get('/:productId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const product = await productService.getProduct(shopId, req.params.productId);
  res.json(product);
}));

router.post('/', validateBody({
  name: { required: true, type: 'string', minLength: 1 },
  slug: { required: true, type: 'string', minLength: 1 },
  base_price: { required: true, type: 'number', min: 0 },
}), asyncHandler(async (req, res) => {
  const product = await productService.createProduct({ shopId: req.tenantShopId, ...req.body });
  res.status(201).json(product);
}));

router.patch('/:productId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const product = await productService.updateProduct(shopId, req.params.productId, req.body);
  res.json(product);
}));

router.delete('/:productId', asyncHandler(async (req, res) => {
  const shopId = req.auth.role === 'super_admin' ? null : req.tenantShopId;
  const result = await productService.deleteProduct(shopId, req.params.productId);
  res.json(result);
}));

module.exports = router;