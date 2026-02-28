function requireTenantContext(req, res, next) {
  // Super admin can operate without a specific shop (sees all data)
  if (req.isSuperAdmin) return next();

  if (!req.tenantShopId) {
    return res.status(400).json({ message: 'Shop context is required. Please ensure you are assigned to a shop.' });
  }

  return next();
}

module.exports = { requireTenantContext };
