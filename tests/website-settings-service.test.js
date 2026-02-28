const { describe, it, beforeAll, afterAll } = require('bun:test');
const assert = require('node:assert/strict');
const { setup, teardown, shopId, adminUserId } = require('./helpers/setup');
const wsService = require('../src/services/website-settings');

describe('website settings service', () => {
  beforeAll(setup);
  afterAll(teardown);

  it('returns default settings for shop', async () => {
    const settings = await wsService.getWebsiteSettings(shopId);
    assert.equal(settings.shop_id, shopId);
    assert.equal(typeof settings.template, 'string');
  });

  it('updates settings', async () => {
    const updated = await wsService.updateWebsiteSettings(shopId, {
      template: 'modern_luxe',
      theme: { primary: '#111111' },
    });
    assert.equal(updated.template, 'modern_luxe');
  });
});