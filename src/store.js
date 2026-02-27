const crypto = require('crypto');

const shops = [
  { id: 'shop_1', name: 'Demo Coffee', slug: 'demo-coffee', status: 'active', industry: 'food_beverage', subscription_plan: 'starter' },
  { id: 'shop_2', name: 'Demo Fashion', slug: 'demo-fashion', status: 'active', industry: 'fashion', subscription_plan: 'starter' },
];

const users = [
  { id: 'user_super', email: 'super@ecomai.dev', password: 'password123', role: 'super_admin', shopId: null },
  { id: 'user_shop_admin', email: 'admin@coffee.dev', password: 'password123', role: 'shop_admin', shopId: 'shop_1' },
  { id: 'user_shop_user', email: 'staff@coffee.dev', password: 'password123', role: 'shop_user', shopId: 'shop_1' },
  { id: 'user_driver', email: 'driver@ecomai.dev', password: 'password123', role: 'delivery_agent', shopId: 'shop_1' },
];

const products = [];
const productVariants = [];
const orders = [];
const orderItems = [];
const customers = [];
const payments = [];
const refunds = [];
const deliveryRequests = [];
const marketingCampaigns = [];
const inventoryMovements = [];
const websiteSettings = [];
const refreshTokens = [];

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = {
  shops,
  users,
  products,
  productVariants,
  orders,
  orderItems,
  customers,
  payments,
  refunds,
  deliveryRequests,
  marketingCampaigns,
  inventoryMovements,
  websiteSettings,
  refreshTokens,
  createId,
};
