const websiteRepo = require('../repositories/website-settings');

// Dangerous fields that could enable stored XSS
const BLOCKED_FIELDS = ['custom_js', 'custom_javascript'];

async function getWebsiteSettings(shopId) {
  const existing = await websiteRepo.getByShop(shopId);
  if (existing) return existing;
  return websiteRepo.createDefault(shopId);
}

async function updateWebsiteSettings(shopId, patch) {
  // Strip dangerous fields to prevent stored XSS
  const sanitized = { ...patch };
  for (const field of BLOCKED_FIELDS) {
    delete sanitized[field];
  }
  // Ensure defaults exist first
  const existing = await websiteRepo.getByShop(shopId);
  if (!existing) await websiteRepo.createDefault(shopId);
  return websiteRepo.updateForShop(shopId, sanitized);
}

module.exports = { getWebsiteSettings, updateWebsiteSettings };