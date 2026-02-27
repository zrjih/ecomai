const express = require('express');
const { authRequired, requireRoles, resolveTenant } = require('../middleware/auth');
const { requireTenantContext } = require('../middleware/tenant');
const productService = require('../services/products');
const { DomainError } = require('../errors/domain-error');

const router = express.Router();

router.use(authRequired, requireRoles(['super_admin', 'shop_admin', 'shop_user']), resolveTenant, requireTenantContext);

router.get('/', (req, res) => {
  const items = productService.listProducts(req.tenantShopId);
  return res.json({ items, count: items.length });
});

router.post('/', (req, res) => {
  try {
    const product = productService.createProduct({
      shopId: req.tenantShopId,
      ...req.body,
    });

    return res.status(201).json(product);
  } catch (err) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ code: err.code, message: err.message });
    }

    return res.status(500).json({ message: 'Failed to create product' });
  }
});

module.exports = router;
