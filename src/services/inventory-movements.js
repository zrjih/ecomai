const movementRepo = require('../repositories/inventory-movements');
const { DomainError } = require('../errors/domain-error');

async function listMovements(shopId, opts) {
  return movementRepo.listByShop(shopId, opts);
}

async function getMovement(movementId) {
  const movement = await movementRepo.findById(movementId);
  if (!movement) throw new DomainError('MOVEMENT_NOT_FOUND', 'Inventory movement not found', 404);
  return movement;
}

async function listByVariant(variantId, opts) {
  return movementRepo.listByVariant(variantId, opts);
}

async function listByProduct(productId, opts) {
  return movementRepo.listByProduct(productId, opts);
}

async function createMovement(data) {
  return movementRepo.createMovement(data);
}

module.exports = { listMovements, getMovement, listByVariant, listByProduct, createMovement };