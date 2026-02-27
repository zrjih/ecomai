ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS currency_config JSONB NOT NULL DEFAULT '{"symbol":"৳","code":"BDT","position":"before","decimals":2}';
ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS store_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS analytics JSONB NOT NULL DEFAULT '{}';
ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS popup_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS countdown JSONB NOT NULL DEFAULT '{}';
