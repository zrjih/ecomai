const { products, createId } = require('../store');

function listByShop(shopId) {
  return products.filter((entry) => entry.shop_id === shopId);
}

function findByIdAndShop(id, shopId) {
  return products.find((entry) => entry.id === id && entry.shop_id === shopId);
}

function findBySlugAndShop(slug, shopId) {
  return products.find((entry) => entry.slug === slug && entry.shop_id === shopId);
}

function createProduct({ shop_id, name, slug, base_price, description, category }) {
  const product = {
    id: createId('prod'),
    shop_id,
    name,
    slug,
    base_price,
    description,
    category: category || null,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  products.push(product);
  return product;
}

function updateProduct(product, patch) {
  const allowed = ['name', 'slug', 'base_price', 'description', 'category', 'status'];
  allowed.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(patch, k)) {
      product[k] = k === 'base_price' ? Number(patch[k]) : patch[k];
    }
  });
  product.updated_at = new Date().toISOString();
  return product;
}

function deleteProduct(productId) {
  const idx = products.findIndex((entry) => entry.id === productId);
  if (idx >= 0) {
    products.splice(idx, 1);
    return true;
  }
  return false;
}

module.exports = { listByShop, findByIdAndShop, findBySlugAndShop, createProduct, updateProduct, deleteProduct };
