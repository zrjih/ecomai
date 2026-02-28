const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/async-handler');
const userRepo = require('../repositories/users');
const db = require('../db');
const config = require('../config');
const { DomainError } = require('../errors/domain-error');
const subscriptionPayments = require('../services/subscription-payments');

const router = express.Router();

const SALT_ROUNDS = 10;
const PAID_PLANS = ['starter', 'growth', 'enterprise'];

/**
 * POST /v1/register
 * Public endpoint: create a new shop + owner account (shop_admin).
 *
 * FREE plan  → shop created active, tokens returned immediately.
 * PAID plan  → shop created with status='pending_payment', SSLCommerz
 *              checkout URL returned. Shop activates after payment.
 */
router.post('/', asyncHandler(async (req, res) => {
  const { shop_name, slug, email, password, full_name, phone, industry, plan, billing } = req.body;

  if (!shop_name || !slug || !email || !password) {
    throw new DomainError('VALIDATION_ERROR', 'shop_name, slug, email, and password are required', 400);
  }

  if (password.length < 6) {
    throw new DomainError('VALIDATION_ERROR', 'password must be at least 6 characters', 400);
  }

  // Check email not taken
  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    throw new DomainError('DUPLICATE_EMAIL', 'An account with this email already exists', 409);
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const isPaid = PAID_PLANS.includes(plan);
  const shopStatus = isPaid ? 'pending_payment' : 'active';

  // Create shop + user + default settings atomically
  const result = await db.withTransaction(async (client) => {
    const shopRes = await client.query(
      `INSERT INTO shops (name, slug, status, industry, subscription_plan)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [shop_name, slug, shopStatus, industry || null, plan || 'free']
    );
    const shop = shopRes.rows[0];

    const userRes = await client.query(
      `INSERT INTO users (shop_id, email, password_hash, role, full_name, phone)
       VALUES ($1, $2, $3, 'shop_admin', $4, $5) RETURNING *`,
      [shop.id, email, password_hash, full_name || null, phone || null]
    );
    const user = userRes.rows[0];

    await client.query('UPDATE shops SET owner_user_id = $1 WHERE id = $2', [user.id, shop.id]);

    await client.query(
      `INSERT INTO website_settings (shop_id, template, theme, header, footer, homepage, custom_css, custom_js, seo_defaults)
       VALUES ($1, 'starter', '{"primaryColor":"#6366f1","fontFamily":"Inter"}', '{"logo":null,"nav":[]}',
        '{"text":"","links":[]}', '{"hero":{"title":"Welcome","subtitle":""},"sections":[]}', '', '', '{"title":"","description":""}')`,
      [shop.id]
    );

    return {
      shop: { ...shop, owner_user_id: user.id },
      user: { id: user.id, email: user.email, role: user.role, shop_id: shop.id, full_name: user.full_name },
    };
  });

  // ── FREE plan: immediate login ──────────────────────────
  if (!isPaid) {
    const authService = require('../services/auth');
    const tokens = {
      accessToken: authService.signAccessToken({ id: result.user.id, role: result.user.role, shop_id: result.shop.id }),
      refreshToken: authService.signRefreshToken({ id: result.user.id }),
      tokenType: 'Bearer',
    };
    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [result.user.id, tokens.refreshToken]
    );
    return res.status(201).json({ shop: result.shop, user: result.user, ...tokens });
  }

  // ── PAID plan: redirect to SSLCommerz ───────────────────
  const billingCycle = billing === 'yearly' ? 'yearly' : 'monthly';

  // Look up plan price
  const planRes = await db.query('SELECT * FROM subscription_plans WHERE slug = $1', [plan]);
  const planRow = planRes.rows[0];
  if (!planRow) {
    throw new DomainError('PLAN_NOT_FOUND', `Subscription plan "${plan}" not found`, 400);
  }
  const amount = billingCycle === 'yearly' ? Number(planRow.price_yearly) : Number(planRow.price_monthly);

  if (amount <= 0) {
    // Plan happens to be free (e.g. price = 0) — activate immediately
    await db.query("UPDATE shops SET status = 'active', updated_at = now() WHERE id = $1", [result.shop.id]);
    const authService = require('../services/auth');
    const tokens = {
      accessToken: authService.signAccessToken({ id: result.user.id, role: result.user.role, shop_id: result.shop.id }),
      refreshToken: authService.signRefreshToken({ id: result.user.id }),
      tokenType: 'Bearer',
    };
    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [result.user.id, tokens.refreshToken]
    );
    return res.status(201).json({ shop: result.shop, user: result.user, ...tokens });
  }

  // Initiate SSLCommerz session
  const payment = await subscriptionPayments.initSubscriptionPayment({
    shopId: result.shop.id,
    userId: result.user.id,
    planSlug: plan,
    amount,
    billingCycle,
    customerName: full_name || shop_name,
    customerEmail: email,
    customerPhone: phone,
  });

  return res.status(201).json({
    requiresPayment: true,
    checkoutUrl: payment.checkoutUrl,
    shop: result.shop,
    user: result.user,
  });
}));

// ── SSLCommerz subscription callbacks ─────────────────────

router.post('/payment/success', asyncHandler(async (req, res) => {
  const result = await subscriptionPayments.handleSubscriptionCallback(req.body);
  if (result.valid) {
    // Generate tokens so we can auto-login the user after redirect
    const auth = await subscriptionPayments.generateAuthTokensForUser(result.userId);
    if (auth) {
      const params = new URLSearchParams({
        status: 'success',
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      });
      return res.redirect(`${config.appUrl}/signup/success?${params.toString()}`);
    }
  }
  return res.redirect(`${config.appUrl}/signup/success?status=success`);
}));

router.post('/payment/fail', asyncHandler(async (req, res) => {
  await subscriptionPayments.handleSubscriptionCallback(req.body);
  return res.redirect(`${config.appUrl}/signup/fail?reason=payment_failed`);
}));

router.post('/payment/cancel', asyncHandler(async (req, res) => {
  await subscriptionPayments.handleSubscriptionCallback(req.body);
  return res.redirect(`${config.appUrl}/signup/fail?reason=payment_cancelled`);
}));

router.post('/payment/ipn', asyncHandler(async (req, res) => {
  await subscriptionPayments.handleSubscriptionCallback(req.body);
  return res.status(200).json({ message: 'IPN received' });
}));

// ── Check subscription payment status ─────────────────────

router.get('/payment/status/:shopId', asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const payRes = await db.query(
    'SELECT status FROM subscription_payments WHERE shop_id = $1 ORDER BY created_at DESC LIMIT 1',
    [shopId]
  );
  const shopRes = await db.query('SELECT status FROM shops WHERE id = $1', [shopId]);
  res.json({
    paymentStatus: payRes.rows[0]?.status || 'unknown',
    shopStatus: shopRes.rows[0]?.status || 'unknown',
  });
}));

/**
 * GET /v1/register/plans
 * Public: list subscription plans for pricing page.
 */
router.get('/plans', asyncHandler(async (_req, res) => {
  const result = await db.query('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
  res.json({ items: result.rows });
}));

module.exports = router;
