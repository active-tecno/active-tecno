// db.js — Active Tecno database layer (zero-dependency, node:sqlite)
// Migrations run in order; each is applied once and recorded in _migrations.
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Runtime DB is separate from the immutable seed snapshot (data/seed.db, tracked).
// On boot, if the runtime DB does not exist, it is initialized from the seed.
const SEED_PATH = path.join(__dirname, 'data', 'seed.db');
const DB_PATH = process.env.ACTIVE_TECNO_DB || path.join(__dirname, 'data', 'runtime.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (!fs.existsSync(DB_PATH) && fs.existsSync(SEED_PATH) && DB_PATH !== SEED_PATH) {
  fs.copyFileSync(SEED_PATH, DB_PATH);
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

const migrations = [
  {
    id: '001_core',
    sql: `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );
    CREATE TABLE themes (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      category TEXT NOT NULL,
      is_premium INTEGER NOT NULL DEFAULT 0,
      price INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL -- JSON: colors, radius, header style
    );
    CREATE TABLE stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      currency TEXT NOT NULL DEFAULT 'EGP',
      governorate TEXT DEFAULT '',
      theme_id TEXT NOT NULL DEFAULT 'modern',
      theme_settings TEXT NOT NULL DEFAULT '{}', -- JSON overrides: primary, accent, sections
      logo_text TEXT DEFAULT '',
      free_shipping_over INTEGER DEFAULT 0,
      announcement TEXT DEFAULT '',
      is_published INTEGER NOT NULL DEFAULT 0,
      published_until TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      compare_at_price REAL,
      cost REAL DEFAULT 0,
      sku TEXT DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 3,
      category TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active', -- active | draft
      images TEXT NOT NULL DEFAULT '[]', -- JSON array of URLs or /uploads paths
      upsell_product_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      governorate TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new', -- new confirmed shipped delivered cancelled returned
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      coupon_code TEXT,
      source TEXT DEFAULT 'store',
      whatsapp_confirmed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, number)
    );
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      qty INTEGER NOT NULL,
      image TEXT DEFAULT ''
    );
    CREATE TABLE order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'percent', -- percent | fixed
      value REAL NOT NULL,
      min_order REAL DEFAULT 0,
      usage_limit INTEGER DEFAULT 0, -- 0 = unlimited
      used_count INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, code)
    );
    CREATE TABLE blocked_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      phone TEXT NOT NULL,
      reason TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, phone)
    );
    CREATE TABLE shipping_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      governorates TEXT NOT NULL DEFAULT '', -- comma separated
      price REAL NOT NULL DEFAULT 0,
      per_item INTEGER NOT NULL DEFAULT 0,
      free_over REAL DEFAULT 0
    );
    CREATE TABLE team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff', -- owner | staff
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE activation_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'monthly',
      amount REAL NOT NULL,
      method TEXT NOT NULL, -- instapay | vodafone_cash
      reference TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- pending approved rejected
      admin_note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT
    );
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- page_view product_view add_to_cart begin_checkout purchase
      session_id TEXT DEFAULT '',
      product_id INTEGER,
      meta TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL,
      customer_phone TEXT DEFAULT '',
      items TEXT NOT NULL DEFAULT '[]',
      recovered INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, session_id)
    );
    CREATE INDEX idx_products_store ON products(store_id);
    CREATE INDEX idx_orders_store ON orders(store_id, status);
    CREATE INDEX idx_orders_phone ON orders(store_id, customer_phone);
    CREATE INDEX idx_events_store ON events(store_id, type, created_at);
    `
  },
  {
    id: '002_payments',
    sql: `ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod';`
  },
  {
    id: '003_integrations',
    sql: `
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE integration_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      kind TEXT NOT NULL,
      payload TEXT,
      status TEXT NOT NULL,
      simulated INTEGER NOT NULL DEFAULT 0,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_integ_provider ON integration_events(provider, id);
    ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid';
    ALTER TABLE orders ADD COLUMN payment_ref TEXT;
    `
  },
  {
    id: '004_brand_palette',
    sql: `
    UPDATE themes SET config = REPLACE(REPLACE(config, '#12213E', '#141924'), '#00BFAF', '#27cd27');
    UPDATE stores SET theme_settings = REPLACE(REPLACE(theme_settings, '#12213E', '#141924'), '#00BFAF', '#27cd27');
    `
  },
  {
    id: '005_brand_rename',
    sql: `
    UPDATE users SET name = REPLACE(name, 'اكتف تكنو', 'اكتف اوردر');
    UPDATE stores SET name = REPLACE(name, 'اكتف تكنو', 'اكتف اوردر'), description = REPLACE(description, 'اكتف تكنو', 'اكتف اوردر');
    UPDATE themes SET name_ar = REPLACE(name_ar, 'اكتف تكنو', 'اكتف اوردر');
    `
  },
  {
    id: '006_stage_f_dashboard',
    sql: `
    ALTER TABLE blocked_numbers ADD COLUMN kind TEXT NOT NULL DEFAULT 'order'; -- order | otp
    CREATE TABLE newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, email)
    );
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, name)
    );
    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      text TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending', -- pending | published | hidden
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE funnels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active', -- active | paused
      views INTEGER NOT NULL DEFAULT 0,
      orders INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE ab_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      variant_a TEXT NOT NULL DEFAULT '',
      variant_b TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'running', -- running | stopped
      views_a INTEGER NOT NULL DEFAULT 0,
      views_b INTEGER NOT NULL DEFAULT 0,
      orders_a INTEGER NOT NULL DEFAULT 0,
      orders_b INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE blog_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, name)
    );
    CREATE TABLE blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft', -- draft | published
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, slug)
    );
    CREATE TABLE cross_sells (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      related_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, product_id, related_product_id)
    );
    CREATE TABLE store_settings (
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (store_id, key)
    );
    CREATE TABLE referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      commission REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | credited | paid
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(referred_user_id)
    );
    CREATE TABLE withdrawal_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      account TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | rejected
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE dev_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new', -- new | reviewing | planned | done
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    ALTER TABLE users ADD COLUMN referral_code TEXT;
    CREATE INDEX idx_reviews_product ON reviews(product_id, status);
    `
  },
  {
    id: '007_stage_f_products',
    sql: `
    ALTER TABLE products ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE products ADD COLUMN slug TEXT NOT NULL DEFAULT '';
    ALTER TABLE products ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN variants TEXT NOT NULL DEFAULT '[]';
    CREATE INDEX idx_products_store_priority ON products(store_id, priority DESC);
    `
  },
  {
    id: '008_stage_f_marketing',
    sql: `
    ALTER TABLE orders ADD COLUMN utm_source TEXT NOT NULL DEFAULT '';
    ALTER TABLE orders ADD COLUMN utm_medium TEXT NOT NULL DEFAULT '';
    ALTER TABLE orders ADD COLUMN utm_campaign TEXT NOT NULL DEFAULT '';
    ALTER TABLE orders ADD COLUMN ref_code TEXT NOT NULL DEFAULT '';
    CREATE TABLE referral_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      orders INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, code)
    );
    `
  },
  {
    id: '009_demo_guardrail',
    sql: `
    ALTER TABLE orders ADD COLUMN demo INTEGER NOT NULL DEFAULT 0;
    `
  },
  {
    id: '010_cart_recovery',
    sql: `
    ALTER TABLE carts ADD COLUMN recovered_at TEXT;
    `
  },
  {
    id: '011_store_api_key',
    sql: `
    ALTER TABLE stores ADD COLUMN api_key TEXT;
    `
  },
  {
    id: '014_pages',
    sql: `
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      in_header INTEGER NOT NULL DEFAULT 0,
      in_footer INTEGER NOT NULL DEFAULT 1,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(store_id, slug)
    );
    CREATE INDEX IF NOT EXISTS idx_pages_store ON pages(store_id, active);
    `
  },
  {
    id: '013_store_sections',
    sql: `
    CREATE TABLE IF NOT EXISTS store_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      page TEXT NOT NULL DEFAULT 'home',
      zone TEXT NOT NULL DEFAULT 'content',
      position INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL,
      settings TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_sections_store ON store_sections(store_id, page, zone, position);
    `
  },
  {
    id: '012_product_advanced',
    sql: `
    ALTER TABLE products ADD COLUMN stock_tracking INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN disable_on_zero INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN currency TEXT NOT NULL DEFAULT '';
    ALTER TABLE products ADD COLUMN custom_pixel TEXT NOT NULL DEFAULT '';
    ALTER TABLE products ADD COLUMN settings TEXT NOT NULL DEFAULT '{}';
    UPDATE products SET stock_tracking = 1;
    `
  }
];

function migrate() {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))`);
  const applied = new Set(db.prepare('SELECT id FROM _migrations').all().map(r => r.id));
  for (const m of migrations) {
    if (applied.has(m.id)) continue;
    db.exec('BEGIN');
    try {
      db.exec(m.sql);
      db.prepare('INSERT INTO _migrations (id) VALUES (?)').run(m.id);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}

migrate();
module.exports = { db, migrate };
