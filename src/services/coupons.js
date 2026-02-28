const couponRepo = require('../repositories/coupons');
const { DomainError } = require('../errors/domain-error');

async function createCoupon({ shopId, code, type, value, min_order_amount, max_discount, usage_limit, starts_at, expires_at }) {
  if (!code || !value) {
    throw new DomainError('VALIDATION_ERROR', 'code and value are required', 400);
  }
  if (!['percentage', 'fixed'].includes(type || 'percentage')) {
    throw new DomainError('VALIDATION_ERROR', 'type must be percentage or fixed', 400);
  }
  if (type === 'percentage' && (Number(value) <= 0 || Number(value) > 100)) {
    throw new DomainError('VALIDATION_ERROR', 'percentage value must be between 1 and 100', 400);
  }
  const existing = await couponRepo.findByCode(shopId, code);
  if (existing) {
    throw new DomainError('DUPLICATE_CODE', 'A coupon with this code already exists', 409);
  }
  return couponRepo.createCoupon({
    shop_id: shopId, code, type: type || 'percentage', value: Number(value),
    min_order_amount, max_discount, usage_limit, starts_at, expires_at,
  });
}

async function validateCoupon(shopId, code, orderAmount) {
  const coupon = await couponRepo.findByCode(shopId, code);
  if (!coupon) throw new DomainError('COUPON_NOT_FOUND', 'Invalid coupon code', 404);
  if (!coupon.is_active) throw new DomainError('COUPON_INACTIVE', 'This coupon is no longer active', 400);

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    throw new DomainError('COUPON_NOT_STARTED', 'This coupon is not yet valid', 400);
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    throw new DomainError('COUPON_EXPIRED', 'This coupon has expired', 400);
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    throw new DomainError('COUPON_EXHAUSTED', 'This coupon has reached its usage limit', 400);
  }
  if (coupon.min_order_amount && Number(orderAmount) < Number(coupon.min_order_amount)) {
    throw new DomainError('COUPON_MIN_ORDER', `Minimum order amount is ${coupon.min_order_amount}`, 400);
  }

  let discount;
  if (coupon.type === 'percentage') {
    discount = Number((Number(orderAmount) * Number(coupon.value) / 100).toFixed(2));
    if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
  } else {
    discount = Math.min(Number(coupon.value), Number(orderAmount));
  }

  return { coupon, discount };
}

async function applyCoupon(couponId, client) {
  return couponRepo.incrementUsage(couponId, client);
}

async function listCoupons(shopId, opts) {
  return couponRepo.listByShop(shopId, opts);
}

async function getCoupon(shopId, couponId) {
  const coupon = await couponRepo.findByIdAndShop(couponId, shopId);
  if (!coupon) throw new DomainError('COUPON_NOT_FOUND', 'Coupon not found', 404);
  return coupon;
}

async function updateCoupon(shopId, couponId, patch) {
  await getCoupon(shopId, couponId);
  if (patch.code) {
    const existing = await couponRepo.findByCode(shopId, patch.code);
    if (existing && existing.id !== couponId) {
      throw new DomainError('DUPLICATE_CODE', 'A coupon with this code already exists', 409);
    }
  }
  return couponRepo.updateCoupon(couponId, shopId, patch);
}

async function deleteCoupon(shopId, couponId) {
  await getCoupon(shopId, couponId);
  await couponRepo.deleteCoupon(couponId, shopId);
  return { deleted: true };
}

module.exports = { createCoupon, validateCoupon, applyCoupon, listCoupons, getCoupon, updateCoupon, deleteCoupon };
