const productRepo = require('../repositories/products');
const { DomainError } = require('../errors/domain-error');

function listProducts(shopId) {
  return productRepo.listByShop(shopId);
}

function getProduct(shopId, productId) {
  const product = productRepo.findByIdAndShop(productId, shopId);
  if (!product) {
    throw new DomainError('PRODUCT_NOT_FOUND', 'Product not found', 404);
  }
  return product;
}

function createProduct({ shopId, name, slug, base_price, description, category }) {
  if (!name || !slug || base_price == null) {
    throw new DomainError('VALIDATION_ERROR', 'name, slug, base_price are required', 400);
  }

  if (Number(base_price) < 0) {
    throw new DomainError('VALIDATION_ERROR', 'base_price must be greater than or equal to 0', 400);
  }

  const existing = productRepo.findBySlugAndShop(slug, shopId);
  if (existing) {
    throw new DomainError('DUPLICATE_SLUG', 'slug must be unique per shop', 409);
  }

  return productRepo.createProduct({
    shop_id: shopId,
    name,
    slug,
    base_price: Number(base_price),
    description: description || null,
    category: category || null,
  });
}

function updateProduct(shopId, productId, patch) {
  const product = getProduct(shopId, productId);

  if (patch.slug && patch.slug !== product.slug) {
    const existing = productRepo.findBySlugAndShop(patch.slug, shopId);
    if (existing) {
      throw new DomainError('DUPLICATE_SLUG', 'slug must be unique per shop', 409);
    }
  }

  if (patch.base_price != null && Number(patch.base_price) < 0) {
    throw new DomainError('VALIDATION_ERROR', 'base_price must be >= 0', 400);
  }

  return productRepo.updateProduct(product, patch);
}

function deleteProduct(shopId, productId) {
  const product = getProduct(shopId, productId);
  productRepo.deleteProduct(product.id);
  return { success: true };
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
