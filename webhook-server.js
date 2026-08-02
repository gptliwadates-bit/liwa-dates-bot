var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// lib/env.js
var require_env = __commonJS({
  "lib/env.js"(exports2, module2) {
    "use strict";
    function parseBool(val, def = false) {
      if (val === void 0 || val === null || val === "") return def;
      const s = String(val).trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(s)) return true;
      if (["false", "0", "no", "off"].includes(s)) return false;
      return def;
    }
    function num(val, def) {
      const n = Number(val);
      return Number.isFinite(n) ? n : def;
    }
    function splitIds(val) {
      return String(val || "").split(",").map((s) => s.trim()).filter(Boolean);
    }
    function isProdEnv(env) {
      return String(env.NODE_ENV || "").toLowerCase() === "production";
    }
    function validateEnv(env = process.env) {
      const prod = isProdEnv(env);
      const errors = [];
      const warnings = [];
      const ADMIN_KEY2 = env.ADMIN_KEY || "";
      const APP_SECRET2 = env.APP_SECRET || "";
      const OPENAI_API_KEY2 = env.OPENAI_API_KEY || "";
      const META_VERIFY_TOKEN2 = env.META_VERIFY_TOKEN || "";
      const PAGE_ACCESS_TOKEN2 = env.PAGE_ACCESS_TOKEN || "";
      const WHATSAPP_TOKEN2 = env.WHATSAPP_TOKEN || "";
      const PAGE_TOKENS_RAW = env.PAGE_TOKENS || "";
      const WHATSAPP_TOKENS_RAW = env.WHATSAPP_TOKENS || "";
      const hasMetaToken = !!(PAGE_ACCESS_TOKEN2 || WHATSAPP_TOKEN2 || PAGE_TOKENS_RAW);
      const allowlistConfigured = !!(env.FACEBOOK_ALLOWED_IDS || env.IG_ALLOWED_IDS || env.WHATSAPP_ALLOWED_PHONE_NUMBER_IDS || env.FARMER_IDS || env.FARMER_IG_ALLOWED_IDS || env.FARMER_WHATSAPP_ALLOWED_PHONE_NUMBER_IDS || env.ALLOWED_IDS);
      if (prod) {
        if (!ADMIN_KEY2) errors.push("ADMIN_KEY");
        if (!APP_SECRET2) errors.push("APP_SECRET");
        if (!OPENAI_API_KEY2) errors.push("OPENAI_API_KEY");
        if (!hasMetaToken) errors.push("META_TOKEN (PAGE_ACCESS_TOKEN or WHATSAPP_TOKEN or PAGE_TOKENS)");
        if (!allowlistConfigured)
          warnings.push(
            "No allowlist configured \u2014 bot will process NO account (deny-all). Set FACEBOOK_ALLOWED_IDS / IG_ALLOWED_IDS / WHATSAPP_ALLOWED_PHONE_NUMBER_IDS / FARMER_IDS."
          );
      } else {
        if (!ADMIN_KEY2) warnings.push("ADMIN_KEY not set \u2014 admin/debug routes are DISABLED (503).");
        if (!OPENAI_API_KEY2) warnings.push("OPENAI_API_KEY not set \u2014 AI replies will fail.");
        if (!APP_SECRET2 && !parseBool(env.ALLOW_UNSIGNED_WEBHOOKS, false))
          warnings.push("APP_SECRET not set and ALLOW_UNSIGNED_WEBHOOKS=false \u2014 webhooks will be rejected.");
      }
      const BOT_ENABLED2 = parseBool(env.BOT_ENABLED, true);
      let PAGE_TOKENS2 = {};
      if (PAGE_TOKENS_RAW) {
        try {
          PAGE_TOKENS2 = JSON.parse(PAGE_TOKENS_RAW);
        } catch (e) {
          warnings.push("PAGE_TOKENS is not valid JSON \u2014 ignored.");
        }
      }
      let WHATSAPP_TOKENS = {};
      if (WHATSAPP_TOKENS_RAW) {
        try {
          const parsed = JSON.parse(WHATSAPP_TOKENS_RAW);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) WHATSAPP_TOKENS = parsed;
          else warnings.push("WHATSAPP_TOKENS must be a JSON object {phone_number_id: token} \u2014 ignored.");
        } catch (e) {
          warnings.push("WHATSAPP_TOKENS is not valid JSON \u2014 ignored.");
        }
      }
      const config = {
        NODE_ENV: env.NODE_ENV || "development",
        isProd: prod,
        LOG_LEVEL: (env.LOG_LEVEL || "info").toLowerCase(),
        ADMIN_KEY: ADMIN_KEY2,
        APP_SECRET: APP_SECRET2,
        OPENAI_API_KEY: OPENAI_API_KEY2,
        META_VERIFY_TOKEN: META_VERIFY_TOKEN2,
        PAGE_ACCESS_TOKEN: PAGE_ACCESS_TOKEN2,
        PAGE_TOKENS: PAGE_TOKENS2,
        WHATSAPP_TOKEN: WHATSAPP_TOKEN2,
        WHATSAPP_TOKENS,
        WHATSAPP_PHONE_ID: env.WHATSAPP_PHONE_ID || "",
        BOT_ENABLED: BOT_ENABLED2,
        WHATSAPP_ENABLED: parseBool(env.WHATSAPP_ENABLED, true),
        ALLOW_UNSIGNED_WEBHOOKS: parseBool(env.ALLOW_UNSIGNED_WEBHOOKS, false),
        // Rich product cards: send a card with a URL button (Messenger/IG generic or
        // button template, WhatsApp cta_url) instead of plain text + inline link when
        // the reply is about one specific product. Set false to revert to plain text.
        RICH_CARDS_ENABLED: parseBool(env.RICH_CARDS_ENABLED, true),
        // Human Takeover — bot goes silent when a human agent handles a conversation.
        HUMAN_TAKEOVER_ENABLED: parseBool(env.HUMAN_TAKEOVER_ENABLED, true),
        HUMAN_TAKEOVER_TTL_MINUTES: num(env.HUMAN_TAKEOVER_TTL_MINUTES, 30),
        // Fail-closed ONLY on a Redis OPERATIONAL error when Redis IS configured.
        // (When Redis is absent, the in-memory store is used best-effort — never fail-closed.)
        HUMAN_TAKEOVER_FAIL_CLOSED: parseBool(env.HUMAN_TAKEOVER_FAIL_CLOSED, true),
        // Optional: our Meta App ID — lets us recognize the bot's own echoes by app_id
        // as a fallback to the recorded message-id set. Not a secret (App ID is public).
        META_APP_ID: env.META_APP_ID || "",
        AI_MODEL: env.AI_MODEL || "gpt-4o-mini",
        AI_MAX_TOKENS: num(env.AI_MAX_TOKENS, 900),
        // Accept Vercel Marketplace (Upstash) injected names KV_REST_API_* as fallbacks.
        UPSTASH_REDIS_REST_URL: env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "",
        UPSTASH_REDIS_REST_TOKEN: env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "",
        TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN || "",
        TELEGRAM_CHAT_ID: env.TELEGRAM_CHAT_ID || "",
        ORDERS_SHEET_URL: env.ORDERS_SHEET_URL || "",
        GOOGLE_SHEETS_WEBHOOK_SECRET: env.GOOGLE_SHEETS_WEBHOOK_SECRET || "",
        QSTASH_URL: env.QSTASH_URL || "",
        QSTASH_TOKEN: env.QSTASH_TOKEN || "",
        // allowlists (raw arrays; channels.js turns them into config)
        allowlists: {
          FACEBOOK_ALLOWED_IDS: splitIds(env.FACEBOOK_ALLOWED_IDS || env.ALLOWED_IDS),
          IG_ALLOWED_IDS: splitIds(env.IG_ALLOWED_IDS),
          WHATSAPP_ALLOWED_PHONE_NUMBER_IDS: splitIds(env.WHATSAPP_ALLOWED_PHONE_NUMBER_IDS || env.WHATSAPP_PHONE_ID),
          FARMER_IDS: splitIds(env.FARMER_IDS),
          FARMER_IG_ALLOWED_IDS: splitIds(env.FARMER_IG_ALLOWED_IDS),
          FARMER_WHATSAPP_ALLOWED_PHONE_NUMBER_IDS: splitIds(env.FARMER_WHATSAPP_ALLOWED_PHONE_NUMBER_IDS)
        },
        // media size limits (bytes)
        MAX_AUDIO_BYTES: num(env.MAX_AUDIO_BYTES, 15 * 1024 * 1024),
        MAX_IMAGE_BYTES: num(env.MAX_IMAGE_BYTES, 10 * 1024 * 1024),
        MAX_DOC_BYTES: num(env.MAX_DOC_BYTES, 10 * 1024 * 1024),
        // pricing config (see lib/config.js)
        DELIVERY_FEE: num(env.DELIVERY_FEE, 27),
        FREE_SHIPPING_THRESHOLD: num(env.FREE_SHIPPING_THRESHOLD, 1e3),
        VAT_RATE: num(env.VAT_RATE, 0.05),
        STORE_PRICES_INCLUDE_TAX: parseBool(env.STORE_PRICES_INCLUDE_TAX, true)
      };
      config.hasUpstash = !!(config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN);
      return { config, errors, warnings };
    }
    function loadConfig2(env = process.env, { logger } = {}) {
      const { config, errors, warnings } = validateEnv(env);
      const log2 = logger || console;
      for (const w of warnings) log2.warn ? log2.warn(w) : console.warn("[config] " + w);
      config.configErrors = errors;
      if (errors.length) {
        const msg = "Missing production-required env vars: " + errors.join(", ") + ". Running in DEGRADED mode (admin routes 503 if ADMIN_KEY missing; webhooks rejected if APP_SECRET missing). Set these in the host environment.";
        log2.error ? log2.error(msg) : console.error("[config] " + msg);
      }
      return config;
    }
    function whatsappTokenFor2(config, phoneId) {
      const tokens = config && config.WHATSAPP_TOKENS || {};
      const perNumber = phoneId != null ? tokens[String(phoneId)] : void 0;
      return perNumber || config && config.WHATSAPP_TOKEN || "";
    }
    module2.exports = { parseBool, num, splitIds, isProdEnv, validateEnv, loadConfig: loadConfig2, whatsappTokenFor: whatsappTokenFor2 };
  }
});

// lib/log.js
var require_log = __commonJS({
  "lib/log.js"(exports2, module2) {
    "use strict";
    var LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
    function maskPhone2(p) {
      const digits = String(p == null ? "" : p).replace(/\D/g, "");
      if (digits.length < 6) return "***";
      return digits.slice(0, 3) + "****" + digits.slice(-3);
    }
    var SENSITIVE_KEYS = /* @__PURE__ */ new Set([
      "token",
      "authorization",
      "auth",
      "secret",
      "apikey",
      "api_key",
      "key",
      "adminkey",
      "password",
      "cvv",
      "otp",
      "access_token",
      "app_secret",
      "name",
      "customer_name",
      "fullname",
      "address",
      "location",
      "message",
      "content",
      "text",
      "usertext",
      "transcription",
      "transcript",
      "body"
    ]);
    function redactValue(key, val, isProd) {
      const k = String(key).toLowerCase();
      if (k === "phone" || k.endsWith("_phone") || k === "wa" || k === "waid") return maskPhone2(val);
      if (SENSITIVE_KEYS.has(k)) {
        if (!isProd) return typeof val === "string" ? "[redacted:" + val.length + "]" : "[redacted]";
        return "[redacted]";
      }
      return val;
    }
    function redact(fields, isProd) {
      if (!fields || typeof fields !== "object") return {};
      const out = {};
      for (const [k, v] of Object.entries(fields)) {
        out[k] = redactValue(k, v, isProd);
      }
      return out;
    }
    function createLogger2(opts = {}) {
      const level = (opts.level || "info").toLowerCase();
      const isProd = !!opts.isProd;
      const out = opts.out || console;
      const threshold = LEVELS[level] != null ? LEVELS[level] : LEVELS.info;
      function emit(lvl, msg, fields) {
        if (LEVELS[lvl] > threshold) return;
        const rec = {
          ts: (/* @__PURE__ */ new Date()).toISOString(),
          level: lvl,
          msg: typeof msg === "string" ? msg : JSON.stringify(msg),
          ...redact(fields, isProd)
        };
        const line = JSON.stringify(rec);
        if (lvl === "error") (out.error || out.log).call(out, line);
        else if (lvl === "warn") (out.warn || out.log).call(out, line);
        else (out.log || out.info).call(out, line);
      }
      return {
        error: (m, f) => emit("error", m, f),
        warn: (m, f) => emit("warn", m, f),
        info: (m, f) => emit("info", m, f),
        debug: (m, f) => emit("debug", m, f),
        child(base) {
          const self = this;
          return {
            error: (m, f) => self.error(m, { ...base, ...f }),
            warn: (m, f) => self.warn(m, { ...base, ...f }),
            info: (m, f) => self.info(m, { ...base, ...f }),
            debug: (m, f) => self.debug(m, { ...base, ...f })
          };
        }
      };
    }
    module2.exports = { createLogger: createLogger2, maskPhone: maskPhone2, redact, LEVELS };
  }
});

// lib/auth.js
var require_auth = __commonJS({
  "lib/auth.js"(exports2, module2) {
    "use strict";
    var crypto2 = require("crypto");
    function safeEqual(a, b) {
      if (typeof a !== "string" || typeof b !== "string") return false;
      if (a.length === 0 || b.length === 0) return false;
      const ab = Buffer.from(a);
      const bb = Buffer.from(b);
      if (ab.length !== bb.length) return false;
      try {
        return crypto2.timingSafeEqual(ab, bb);
      } catch {
        return false;
      }
    }
    function makeRequireAdmin2(opts = {}) {
      const getAdminKey = opts.getAdminKey || (() => "");
      const isProd = !!opts.isProd;
      const log2 = opts.log || console;
      return function requireAdmin2(req, res, next) {
        const adminKey = getAdminKey();
        if (!adminKey) {
          if (isProd && log2.error) log2.error("admin_route_disabled_no_admin_key");
          return res.status(503).json({ error: "admin routes disabled \u2014 ADMIN_KEY not configured" });
        }
        const headerKey = req.get ? req.get("x-admin-key") : req.headers && req.headers["x-admin-key"];
        const queryKey = req.query && req.query.key;
        const provided = headerKey || queryKey || "";
        if (safeEqual(String(provided), String(adminKey))) return next();
        return res.status(403).json({ error: "forbidden" });
      };
    }
    module2.exports = { makeRequireAdmin: makeRequireAdmin2, safeEqual };
  }
});

// lib/signature.js
var require_signature = __commonJS({
  "lib/signature.js"(exports2, module2) {
    "use strict";
    var crypto2 = require("crypto");
    function verifyMetaSignature(rawBody, signatureHeader, appSecret) {
      if (!appSecret) return false;
      if (rawBody == null) return false;
      const sig = String(signatureHeader || "");
      if (!sig.startsWith("sha256=")) return false;
      const expected = "sha256=" + crypto2.createHmac("sha256", appSecret).update(rawBody).digest("hex");
      try {
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length) return false;
        return crypto2.timingSafeEqual(a, b);
      } catch {
        return false;
      }
    }
    function checkWebhook2({ rawBody, signatureHeader, appSecret, isProd, allowUnsigned }) {
      const verified = appSecret ? verifyMetaSignature(rawBody, signatureHeader, appSecret) : false;
      if (verified) return { ok: true, status: 200, reason: "valid_signature" };
      if (allowUnsigned) return { ok: true, status: 200, reason: "unsigned_allowed" };
      if (appSecret) return { ok: false, status: 401, reason: "invalid_signature" };
      if (isProd) return { ok: false, status: 401, reason: "app_secret_missing_in_prod" };
      return { ok: false, status: 401, reason: "unsigned_blocked" };
    }
    module2.exports = { verifyMetaSignature, checkWebhook: checkWebhook2 };
  }
});

// lib/channels.js
var require_channels = __commonJS({
  "lib/channels.js"(exports2, module2) {
    "use strict";
    function toSet(arr) {
      return new Set((arr || []).map((s) => String(s).trim()).filter(Boolean));
    }
    function buildChannelConfig2(allowlists = {}) {
      return {
        retail: {
          facebook: toSet(allowlists.FACEBOOK_ALLOWED_IDS),
          instagram: toSet(allowlists.IG_ALLOWED_IDS),
          whatsapp: toSet(allowlists.WHATSAPP_ALLOWED_PHONE_NUMBER_IDS)
        },
        farmer: {
          facebook: toSet(allowlists.FARMER_IDS),
          instagram: toSet(allowlists.FARMER_IG_ALLOWED_IDS),
          whatsapp: toSet(allowlists.FARMER_WHATSAPP_ALLOWED_PHONE_NUMBER_IDS)
        }
      };
    }
    function isEmptyConfig2(cfg) {
      const all = [cfg.retail, cfg.farmer];
      return all.every((g) => g.facebook.size === 0 && g.instagram.size === 0 && g.whatsapp.size === 0);
    }
    function resolveChannel2(cfg, ev = {}) {
      const channel = ev.channel;
      let id;
      let key;
      if (channel === "whatsapp") {
        id = ev.phoneNumberId;
        key = "whatsapp";
      } else if (channel === "instagram") {
        id = ev.instagramAccountId != null ? ev.instagramAccountId : ev.pageId;
        key = "instagram";
      } else {
        id = ev.pageId;
        key = "facebook";
      }
      const sid = id == null ? "" : String(id);
      if (!sid) return { allowed: false, mode: null };
      if (cfg.farmer[key] && cfg.farmer[key].has(sid)) return { allowed: true, mode: "farmer" };
      if (cfg.retail[key] && cfg.retail[key].has(sid)) return { allowed: true, mode: "retail" };
      return { allowed: false, mode: null };
    }
    module2.exports = { buildChannelConfig: buildChannelConfig2, resolveChannel: resolveChannel2, isEmptyConfig: isEmptyConfig2 };
  }
});

// lib/config.js
var require_config = __commonJS({
  "lib/config.js"(exports2, module2) {
    "use strict";
    var { parseBool, num } = require_env();
    function round2(n) {
      return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
    }
    function loadPricingConfig2(env = process.env) {
      return {
        deliveryFee: num(env.DELIVERY_FEE, 27),
        freeShippingThreshold: num(env.FREE_SHIPPING_THRESHOLD, 1e3),
        vatRate: num(env.VAT_RATE, 0.05),
        // Whether the store/feed prices already INCLUDE tax (Liwa feed = tax-inclusive).
        storePricesIncludeTax: parseBool(env.STORE_PRICES_INCLUDE_TAX, true),
        branchHours: env.BRANCH_HOURS || "8:00\u201323:00 (Sun\u2013Thu)",
        complaintsPhone: env.COMPLAINTS_PHONE || "+971505270251",
        salesWhatsapp: env.SALES_WHATSAPP || "+971545317473",
        deliveryDays: env.DELIVERY_DAYS || "Mon/Wed/Fri, 3\u20135 business days"
      };
    }
    function priceWithTax(price, { taxStatus = "unknown", vatRate = 0.05 } = {}) {
      const p = Number(price);
      if (!Number.isFinite(p)) return { value: null, taxKnown: false, note: "invalid_price" };
      if (taxStatus === "excluded") {
        return { value: round2(p * (1 + vatRate)), taxKnown: true, note: "vat_added_once" };
      }
      if (taxStatus === "included") {
        return { value: round2(p), taxKnown: true, note: "tax_inclusive" };
      }
      return { value: round2(p), taxKnown: false, note: "tax_status_unknown" };
    }
    function snapshotFreshness(updatedAtMs, { maxAgeMs = 6 * 60 * 60 * 1e3, now = Date.now() } = {}) {
      if (!updatedAtMs) return "missing";
      return now - Number(updatedAtMs) > maxAgeMs ? "stale" : "fresh";
    }
    function deliveryFeeFor(subtotal, cfg) {
      const c = cfg || loadPricingConfig2();
      return Number(subtotal) >= c.freeShippingThreshold ? 0 : c.deliveryFee;
    }
    module2.exports = { loadPricingConfig: loadPricingConfig2, priceWithTax, snapshotFreshness, deliveryFeeFor, round2 };
  }
});

// lib/sheets.js
var require_sheets = __commonJS({
  "lib/sheets.js"(exports2, module2) {
    "use strict";
    var crypto2 = require("crypto");
    function sha256Hex(s) {
      return crypto2.createHash("sha256").update(s).digest("hex");
    }
    function hmacHex(base, secret) {
      return crypto2.createHmac("sha256", secret).update(base).digest("hex");
    }
    function sanitizeCell(v) {
      let s = v == null ? "" : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return s;
    }
    function sanitizeObject(obj) {
      if (Array.isArray(obj)) return obj.map(sanitizeObject);
      if (obj && typeof obj === "object") {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = sanitizeObject(v);
        return out;
      }
      if (typeof obj === "string") return sanitizeCell(obj);
      return obj;
    }
    var LIMITS = { name: 120, phone: 25, notes: 1e3, products: 50, payloadBytes: 2e4 };
    function validateOrderPayload(order, limits = LIMITS) {
      const errors = [];
      if (!order || typeof order !== "object") return { ok: false, errors: ["order_not_object"] };
      if (order.customer_name && String(order.customer_name).length > limits.name) errors.push("name_too_long");
      if (order.phone && String(order.phone).length > limits.phone) errors.push("phone_too_long");
      if (order.notes && String(order.notes).length > limits.notes) errors.push("notes_too_long");
      if (Array.isArray(order.products) && order.products.length > limits.products) errors.push("too_many_products");
      const size = Buffer.byteLength(JSON.stringify(order), "utf8");
      if (size > limits.payloadBytes) errors.push("payload_too_large");
      return { ok: errors.length === 0, errors };
    }
    function signPayload(payloadObj, secret, { timestamp = Date.now(), nonce } = {}) {
      const safe = sanitizeObject(payloadObj);
      const body = JSON.stringify(safe);
      const nn = nonce || crypto2.randomBytes(12).toString("hex");
      const bodyHash = sha256Hex(body);
      const base = `${timestamp}.${nn}.${bodyHash}`;
      const signature = hmacHex(base, secret);
      return {
        body,
        timestamp,
        nonce: nn,
        bodyHash,
        signature,
        headers: {
          "content-type": "application/json",
          "x-liwa-timestamp": String(timestamp),
          "x-liwa-nonce": nn,
          "x-liwa-signature": signature
        }
      };
    }
    function verifySignature(args, secret, { maxAgeMs = 5 * 60 * 1e3, now = Date.now(), seenNonces } = {}) {
      const { timestamp, nonce, body, signature } = args || {};
      if (!timestamp || !nonce || body == null || !signature) return { ok: false, reason: "missing_fields" };
      const ts = Number(timestamp);
      if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
      if (Math.abs(now - ts) > maxAgeMs) return { ok: false, reason: "timestamp_expired" };
      if (seenNonces) {
        if (seenNonces.has(nonce)) return { ok: false, reason: "nonce_reused" };
      }
      const bodyHash = sha256Hex(body);
      const base = `${ts}.${nonce}.${bodyHash}`;
      const expected = hmacHex(base, secret);
      const a = Buffer.from(String(signature));
      const b = Buffer.from(expected);
      if (a.length !== b.length || !crypto2.timingSafeEqual(a, b)) return { ok: false, reason: "bad_signature" };
      if (seenNonces) seenNonces.add(nonce);
      return { ok: true, reason: "ok" };
    }
    module2.exports = {
      sanitizeCell,
      sanitizeObject,
      signPayload,
      verifySignature,
      validateOrderPayload,
      sha256Hex,
      LIMITS
    };
  }
});

// lib/http.js
var require_http = __commonJS({
  "lib/http.js"(exports2, module2) {
    "use strict";
    var TRANSIENT_STATUS = /* @__PURE__ */ new Set([408, 429, 500, 502, 503, 504]);
    function isTransientStatus(status) {
      return TRANSIENT_STATUS.has(Number(status));
    }
    function isNetworkError(err) {
      if (!err) return false;
      if (err.name === "AbortError") return true;
      const code = err.code || "";
      return ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "EPIPE"].includes(code);
    }
    function sleep(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }
    function backoffMs(attempt, base = 300, cap = 8e3) {
      const exp = Math.min(cap, base * Math.pow(2, attempt));
      return Math.round(exp / 2 + Math.random() * (exp / 2));
    }
    async function fetchSafe2(url, opts = {}, ctl = {}) {
      const f = ctl.fetchImpl || globalThis.fetch;
      const wait = ctl.sleepImpl || sleep;
      const timeoutMs = ctl.timeoutMs != null ? ctl.timeoutMs : 15e3;
      const retries = ctl.retries != null ? ctl.retries : 2;
      const log2 = ctl.log;
      const cid = ctl.correlationId;
      let attempt = 0;
      let lastErr;
      while (attempt <= retries) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await f(url, { ...opts, signal: controller.signal });
          clearTimeout(timer);
          if (res && res.ok) return res;
          const status = res ? res.status : 0;
          const transient = isTransientStatus(status);
          if (transient && attempt < retries) {
            if (log2 && log2.warn) log2.warn("http_retry", { cid, status, attempt });
            await wait(backoffMs(attempt));
            attempt++;
            continue;
          }
          const err = new Error("http_status_" + status);
          err.status = status;
          err.transient = transient;
          err.response = res;
          throw err;
        } catch (e) {
          clearTimeout(timer);
          lastErr = e;
          const transient = e.transient || isNetworkError(e);
          if (transient && attempt < retries) {
            if (log2 && log2.warn) log2.warn("http_retry_err", { cid, attempt, err: e.code || e.name });
            await wait(backoffMs(attempt));
            attempt++;
            continue;
          }
          throw e;
        }
      }
      throw lastErr || new Error("fetchSafe_failed");
    }
    async function safeText(res) {
      try {
        return await res.text();
      } catch {
        return "";
      }
    }
    module2.exports = { fetchSafe: fetchSafe2, isTransientStatus, isNetworkError, backoffMs, safeText, TRANSIENT_STATUS };
  }
});

// lib/cards.js
var require_cards = __commonJS({
  "lib/cards.js"(exports2, module2) {
    "use strict";
    var DEFAULT_MSGR_BUTTON = "\u0634\u0648\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u{1F334}";
    var DEFAULT_WA_BUTTON = "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0646\u062A\u062C";
    function truncate(s, n) {
      s = String(s == null ? "" : s).trim();
      if (!Number.isFinite(n) || n <= 0 || s.length <= n) return s;
      return s.slice(0, Math.max(1, n - 1)).trim() + "\u2026";
    }
    function buildMessengerCardPayload2(recipientId, product = {}) {
      const { title, subtitle, imageUrl, url } = product;
      const buttonTitle = truncate(product.buttonTitle || DEFAULT_MSGR_BUTTON, 20);
      const safeUrl = String(url || "");
      const button = { type: "web_url", url: safeUrl, title: buttonTitle };
      if (imageUrl) {
        const element = {
          title: truncate(title, 80),
          image_url: String(imageUrl),
          default_action: { type: "web_url", url: safeUrl },
          buttons: [button]
        };
        const sub2 = truncate(subtitle, 80);
        if (sub2) element.subtitle = sub2;
        return {
          recipient: { id: recipientId },
          message: {
            attachment: {
              type: "template",
              payload: { template_type: "generic", image_aspect_ratio: "square", elements: [element] }
            }
          }
        };
      }
      const t = truncate(title, 80);
      const sub = truncate(subtitle, 80);
      const text = truncate([t, sub].filter(Boolean).join("\n") || t || " ", 640);
      return {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "template",
            payload: { template_type: "button", text, buttons: [button] }
          }
        }
      };
    }
    function buildMessengerCarouselPayload2(recipientId, products = []) {
      const elements = (Array.isArray(products) ? products : []).slice(0, 10).map((p) => {
        p = p || {};
        const safeUrl = String(p.url || "");
        const buttonTitle = truncate(p.buttonTitle || DEFAULT_MSGR_BUTTON, 20);
        const el = {
          title: truncate(p.title, 80) || " ",
          buttons: [{ type: "web_url", url: safeUrl, title: buttonTitle }]
        };
        if (safeUrl) el.default_action = { type: "web_url", url: safeUrl };
        const sub = truncate(p.subtitle, 80);
        if (sub) el.subtitle = sub;
        if (p.imageUrl) el.image_url = String(p.imageUrl);
        return el;
      });
      return {
        recipient: { id: recipientId },
        message: {
          attachment: {
            type: "template",
            payload: { template_type: "generic", image_aspect_ratio: "square", elements }
          }
        }
      };
    }
    function buildWhatsAppCTAPayload2(to, opts = {}) {
      const { bodyText, buttonUrl, imageUrl } = opts;
      const displayText = truncate(opts.buttonText || DEFAULT_WA_BUTTON, 20);
      const interactive = {
        type: "cta_url",
        body: { text: truncate(bodyText, 1024) || " " },
        action: {
          name: "cta_url",
          parameters: { display_text: displayText, url: String(buttonUrl || "") }
        }
      };
      if (imageUrl) {
        interactive.header = { type: "image", image: { link: String(imageUrl) } };
      }
      return { messaging_product: "whatsapp", to, type: "interactive", interactive };
    }
    module2.exports = {
      truncate,
      buildMessengerCardPayload: buildMessengerCardPayload2,
      buildMessengerCarouselPayload: buildMessengerCarouselPayload2,
      buildWhatsAppCTAPayload: buildWhatsAppCTAPayload2,
      DEFAULT_MSGR_BUTTON,
      DEFAULT_WA_BUTTON
    };
  }
});

// lib/download.js
var require_download = __commonJS({
  "lib/download.js"(exports2, module2) {
    "use strict";
    var net = require("net");
    var DEFAULT_ALLOWED_SUFFIXES2 = [
      "graph.facebook.com",
      "lookaside.fbsbx.com",
      "cdn.fbsbx.com",
      "fbcdn.net",
      "scontent.xx.fbcdn.net",
      "whatsapp.net",
      "liwadates.com"
    ];
    function hostFromUrl(url) {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch {
        return "";
      }
    }
    function ipToLong(ip) {
      const parts = ip.split(".").map(Number);
      if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
      return (parts[0] << 24 >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
    }
    function isPrivateV4(ip) {
      const n = ipToLong(ip);
      if (n == null) return false;
      const inRange = (a, b) => n >= ipToLong(a) && n <= ipToLong(b);
      return inRange("10.0.0.0", "10.255.255.255") || inRange("172.16.0.0", "172.31.255.255") || inRange("192.168.0.0", "192.168.255.255") || inRange("127.0.0.0", "127.255.255.255") || inRange("169.254.0.0", "169.254.255.255") || // link-local incl. cloud metadata 169.254.169.254
      inRange("0.0.0.0", "0.255.255.255") || inRange("100.64.0.0", "100.127.255.255");
    }
    function isBlockedHost(hostname) {
      const h = String(hostname || "").toLowerCase().replace(/\.$/, "");
      if (!h) return true;
      if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
      if (net.isIPv6(h)) {
        if (h === "::1" || h === "::") return true;
        if (h.startsWith("fe80") || h.startsWith("fc") || h.startsWith("fd")) return true;
        return false;
      }
      if (net.isIPv4(h)) return isPrivateV4(h);
      return false;
    }
    function assertUrlAllowed(url, { allowedSuffixes = DEFAULT_ALLOWED_SUFFIXES2 } = {}) {
      let u;
      try {
        u = new URL(url);
      } catch {
        throw new Error("invalid_url");
      }
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("bad_protocol");
      const host = u.hostname.toLowerCase();
      if (isBlockedHost(host)) throw new Error("blocked_host");
      const ok = allowedSuffixes.some((s) => host === s || host.endsWith("." + s) || host.endsWith(s));
      if (!ok) throw new Error("host_not_allowlisted");
      return true;
    }
    async function downloadSafe2(url, opts = {}) {
      const {
        maxBytes = 10 * 1024 * 1024,
        allowedTypes = null,
        // e.g. [/^audio\//, /^image\//]; null = any
        timeoutMs = 2e4,
        headers = {},
        allowedSuffixes = DEFAULT_ALLOWED_SUFFIXES2,
        fetchImpl = globalThis.fetch
      } = opts;
      assertUrlAllowed(url, { allowedSuffixes });
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchImpl(url, { headers, signal: controller.signal });
        if (!res.ok) throw new Error("download_http_" + res.status);
        const ctype = String(res.headers.get ? res.headers.get("content-type") || "" : "").split(";")[0].trim();
        if (allowedTypes && !allowedTypes.some((re) => re.test(ctype))) {
          throw new Error("content_type_not_allowed:" + (ctype || "unknown"));
        }
        const declared = Number(res.headers.get ? res.headers.get("content-length") : 0);
        if (declared && declared > maxBytes) throw new Error("too_large_declared");
        const ab = await res.arrayBuffer();
        const buffer = Buffer.from(ab);
        if (buffer.length > maxBytes) throw new Error("too_large");
        return { buffer, contentType: ctype };
      } finally {
        clearTimeout(timer);
      }
    }
    module2.exports = {
      isBlockedHost,
      isPrivateV4,
      assertUrlAllowed,
      downloadSafe: downloadSafe2,
      DEFAULT_ALLOWED_SUFFIXES: DEFAULT_ALLOWED_SUFFIXES2,
      hostFromUrl
    };
  }
});

// lib/arabic.js
var require_arabic = __commonJS({
  "lib/arabic.js"(exports2, module2) {
    "use strict";
    function normalizeArabic(s) {
      return String(s || "").replace(/[ً-ْٰـ]/g, "").replace(/[أإآٱ]/g, "\u0627").replace(/ى/g, "\u064A").replace(/ة/g, "\u0647").replace(/[ؤ]/g, "\u0648").replace(/[ئ]/g, "\u064A").replace(/\s+/g, " ").trim().toLowerCase();
    }
    var RETURN_COMPLAINT_KEYWORDS = [
      "\u0627\u0633\u062A\u0631\u062C\u0627\u0639",
      "\u0627\u0633\u062A\u0631\u062F\u0627\u062F",
      "\u0627\u0631\u062C\u0627\u0639",
      "\u0627\u0633\u062A\u0628\u062F\u0627\u0644",
      "\u0627\u0633\u062A\u0628\u062F\u0644",
      "\u0634\u0643\u0648\u0649",
      "\u0645\u0634\u0643\u0644\u0629",
      "\u0645\u0648\u0638\u0641",
      "\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
      "\u0645\u062F\u064A\u0631",
      "\u062A\u0639\u0648\u064A\u0636",
      "\u062A\u0627\u0644\u0641",
      "\u0648\u0635\u0644 \u0646\u0627\u0642\u0635",
      "\u0637\u0644\u0628 \u062E\u0627\u0637\u0626",
      "\u0637\u0644\u0628 \u062E\u0637\u0627",
      "complaint",
      "refund",
      "return",
      "replace",
      "damaged",
      "manager",
      "agent",
      "human"
    ];
    var DATA_DELETION_KEYWORDS = [
      "\u062D\u0630\u0641 \u0628\u064A\u0627\u0646\u0627\u062A\u064A",
      "\u0627\u0645\u0633\u062D \u0628\u064A\u0627\u0646\u0627\u062A\u064A",
      "\u0627\u062D\u0630\u0641 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u064A",
      "\u0627\u062D\u0630\u0641 \u0628\u064A\u0627\u0646\u0627\u062A\u064A",
      "\u0645\u0633\u062D \u0628\u064A\u0627\u0646\u0627\u062A\u064A",
      "\u062D\u0630\u0641 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u064A",
      "\u0627\u0645\u0633\u062D \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u064A",
      "delete my data",
      "erase my data",
      "remove my data",
      "delete my information"
    ];
    function containsKeyword(text, keywords) {
      const t = normalizeArabic(text);
      if (!t) return false;
      return (keywords || []).some((k) => {
        const nk = normalizeArabic(k);
        return nk && t.includes(nk);
      });
    }
    function matchedKeywords(text, keywords) {
      const t = normalizeArabic(text);
      const out = [];
      for (const k of keywords || []) {
        const nk = normalizeArabic(k);
        if (nk && t.includes(nk)) out.push(k);
      }
      return out;
    }
    function isReturnOrComplaint(text) {
      return containsKeyword(text, RETURN_COMPLAINT_KEYWORDS);
    }
    var FARMER_HANDOFF_PATTERNS = [
      // (a) admits missing info / not available with me / promises to transfer
      /غير متوفر(ه)?\s*(عندي|لدي|حالي|حاليا)/,
      /مش متوفر(ه)?\s*عند(ي|نا)/,
      /مش موجود(ه)?\s*(في معلومات|عندي|لدي)/,
      /(مش|ما)\s*عندي\s*(معلوم|تفاصيل|فكره)/,
      /معلومات.{0,25}(غير متوفره|مش متوفره|مش موجوده)/,
      /(بحولك|هحولك|احولك)\s*(ل|لاحد|لموظف)/,
      // (b) polite decline / out of scope ("we only specialise in…", "can't help you",
      //     "not part of our services", "this channel is dedicated to…")
      /متخصص(ين|ون)\s*فقط/,
      /(لا|ما)\s*(نستطيع|استطيع|يمكنني|يمكننا|نقدر|اقدر)\s*(مساعدتك|مساعدتكم|خدمتك)/,
      /(مش|ما|لا)\s*(من|ضمن)\s*(خدماتنا|اختصاصنا|تخصصنا)/,
      /خارج\s*(نطاق|اختصاص|تخصص)/,
      /(القناه|الصفحه|الخدمه|الحساب)\s*(دي|هذه|هاي)?\s*مخصص/,
      /مخصص(ه|ين|ون)?\s*(فقط|بس)\s*(ل|في)/
    ];
    function isFarmerHandoffReply(text) {
      const t = normalizeArabic(text);
      if (!t) return false;
      return FARMER_HANDOFF_PATTERNS.some((re) => re.test(t));
    }
    function isDataDeletionRequest(text) {
      return containsKeyword(text, DATA_DELETION_KEYWORDS);
    }
    module2.exports = {
      normalizeArabic,
      containsKeyword,
      matchedKeywords,
      isReturnOrComplaint,
      isDataDeletionRequest,
      isFarmerHandoffReply,
      RETURN_COMPLAINT_KEYWORDS,
      DATA_DELETION_KEYWORDS,
      FARMER_HANDOFF_PATTERNS
    };
  }
});

// lib/dedup.js
var require_dedup = __commonJS({
  "lib/dedup.js"(exports2, module2) {
    "use strict";
    var KEY = (mid) => "liwa_msg:" + mid;
    var LOCK = (mid) => "liwa_lock:" + mid;
    function createDedup2(store, opts = {}) {
      const ttl = opts.ttl || 86400;
      const lockTtl = opts.lockTtl || 120;
      const log2 = opts.log;
      async function getState(mid) {
        if (!mid) return null;
        const raw = await store.get(KEY(mid));
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      async function acquire(mid) {
        if (!mid) return { ok: false, state: "no_id", attempts: 0 };
        const rec = await getState(mid);
        if (rec) {
          if (rec.state === "completed") return { ok: false, state: "completed", attempts: rec.attempts || 0 };
          if (rec.state === "processing") return { ok: false, state: "processing", attempts: rec.attempts || 0 };
        }
        const locked = await store.setNX(LOCK(mid), "1", lockTtl);
        if (!locked) return { ok: false, state: "locked", attempts: rec ? rec.attempts || 0 : 0 };
        const attempts = (rec && rec.attempts ? rec.attempts : 0) + 1;
        await store.set(KEY(mid), JSON.stringify({ state: "processing", attempts, at: Date.now() }), ttl);
        return { ok: true, state: "processing", attempts };
      }
      async function complete(mid) {
        if (!mid) return;
        const rec = await getState(mid) || {};
        await store.set(
          KEY(mid),
          JSON.stringify({ state: "completed", attempts: rec.attempts || 1, at: Date.now() }),
          ttl
        );
        await store.del(LOCK(mid));
      }
      async function fail(mid, errMsg) {
        if (!mid) return;
        const rec = await getState(mid) || {};
        const safeErr = String(errMsg || "").slice(0, 200);
        await store.set(
          KEY(mid),
          JSON.stringify({ state: "failed", attempts: rec.attempts || 1, lastError: safeErr, at: Date.now() }),
          ttl
        );
        await store.del(LOCK(mid));
        if (log2 && log2.warn) log2.warn("dedup_fail", { attempts: rec.attempts || 1 });
      }
      return { acquire, complete, fail, getState };
    }
    function memoryStore() {
      const m = /* @__PURE__ */ new Map();
      const exp = /* @__PURE__ */ new Map();
      function alive(k) {
        const e = exp.get(k);
        if (e && e < Date.now()) {
          m.delete(k);
          exp.delete(k);
          return false;
        }
        return m.has(k);
      }
      return {
        async get(k) {
          return alive(k) ? m.get(k) : null;
        },
        async set(k, v, ttl) {
          m.set(k, v);
          if (ttl) exp.set(k, Date.now() + ttl * 1e3);
        },
        async setNX(k, v, ttl) {
          if (alive(k)) return false;
          m.set(k, v);
          if (ttl) exp.set(k, Date.now() + ttl * 1e3);
          return true;
        },
        async del(k) {
          m.delete(k);
          exp.delete(k);
        }
      };
    }
    module2.exports = { createDedup: createDedup2, memoryStore };
  }
});

// lib/ratelimit.js
var require_ratelimit = __commonJS({
  "lib/ratelimit.js"(exports2, module2) {
    "use strict";
    function memoryLimiter() {
      const hits = /* @__PURE__ */ new Map();
      return {
        async check(key, limit, windowSec) {
          const now = Date.now();
          let rec = hits.get(key);
          if (!rec || rec.resetAt <= now) {
            rec = { count: 0, resetAt: now + windowSec * 1e3 };
            hits.set(key, rec);
          }
          rec.count++;
          return { allowed: rec.count <= limit, remaining: Math.max(0, limit - rec.count), resetAt: rec.resetAt };
        }
      };
    }
    function createRateLimiter2(store, opts = {}) {
      if (!store) return memoryLimiter();
      return {
        async check(key, limit, windowSec) {
          const k = "liwa_rl:" + key;
          try {
            const cur = Number(await store.get(k) || 0) + 1;
            await store.set(k, String(cur), windowSec);
            return { allowed: cur <= limit, remaining: Math.max(0, limit - cur), resetAt: Date.now() + windowSec * 1e3 };
          } catch (e) {
            return { allowed: true, remaining: limit, resetAt: Date.now() + windowSec * 1e3, degraded: true };
          }
        }
      };
    }
    var DEFAULT_LIMITS2 = {
      apiChatPerMin: 20,
      apiTranscribePerHour: 30,
      adminPerMin: 60,
      webhookSenderPerMin: 20,
      voicePerHourPerSender: 20,
      dailyPerSender: 300,
      maxTextChars: 4e3,
      maxImagesPerMsg: 6
    };
    module2.exports = { createRateLimiter: createRateLimiter2, memoryLimiter, DEFAULT_LIMITS: DEFAULT_LIMITS2 };
  }
});

// lib/orders.js
var require_orders = __commonJS({
  "lib/orders.js"(exports2, module2) {
    "use strict";
    var LANGS = /* @__PURE__ */ new Set(["ar", "en"]);
    var INTENTS = /* @__PURE__ */ new Set(["order", "question", "complaint", "handoff", "smalltalk", "other"]);
    function isStr(v) {
      return typeof v === "string";
    }
    function isNum(v) {
      return typeof v === "number" && Number.isFinite(v);
    }
    function validateProduct(p) {
      const errors = [];
      if (!p || typeof p !== "object") return { ok: false, errors: ["product_not_object"] };
      if (p.product_id != null && !isStr(p.product_id) && !isNum(p.product_id)) errors.push("bad_product_id");
      if (!isStr(p.product_name) || !p.product_name.trim()) errors.push("missing_product_name");
      if (p.quantity != null && !(isNum(p.quantity) && p.quantity > 0)) errors.push("bad_quantity");
      if (p.unit_price != null && !isNum(p.unit_price)) errors.push("bad_unit_price");
      return { ok: errors.length === 0, errors };
    }
    function validateOrder(order) {
      if (order == null) return { ok: true, complete: false, errors: [], order: null };
      if (typeof order !== "object") return { ok: false, complete: false, errors: ["order_not_object"], order: null };
      const errors = [];
      if (order.customer_name != null && !isStr(order.customer_name)) errors.push("bad_customer_name");
      if (order.phone != null && !isStr(order.phone) && !isNum(order.phone)) errors.push("bad_phone");
      if (order.location != null && !isStr(order.location)) errors.push("bad_location");
      if (order.notes != null && !isStr(order.notes)) errors.push("bad_notes");
      let products = [];
      if (order.products != null) {
        if (!Array.isArray(order.products)) errors.push("products_not_array");
        else {
          products = order.products;
          order.products.forEach((p, i) => {
            const r = validateProduct(p);
            if (!r.ok) errors.push(`product[${i}]:` + r.errors.join("|"));
          });
        }
      }
      const hasName = isStr(order.customer_name) && order.customer_name.trim().length > 0;
      const hasPhone = order.phone != null && String(order.phone).trim().length >= 6;
      const hasProduct = products.length > 0;
      const complete = hasName && hasPhone && hasProduct && errors.length === 0;
      return { ok: errors.length === 0, complete, errors, order };
    }
    function validateStructured(obj) {
      const errors = [];
      if (!obj || typeof obj !== "object") return { ok: false, errors: ["not_object"], value: null };
      const reply = isStr(obj.reply) ? obj.reply : "";
      if (!reply) errors.push("missing_reply");
      const intent = INTENTS.has(obj.intent) ? obj.intent : "other";
      const handoff = obj.handoff === true;
      const send_images = obj.send_images === true;
      const language = LANGS.has(obj.language) ? obj.language : void 0;
      const product_ids = Array.isArray(obj.product_ids) ? obj.product_ids.filter((x) => isStr(x) || isNum(x)).map(String) : [];
      const ov = validateOrder(obj.order != null ? obj.order : null);
      if (!ov.ok) errors.push("order:" + ov.errors.join("|"));
      return {
        ok: errors.length === 0 && !!reply,
        errors,
        value: {
          reply,
          intent,
          handoff,
          send_images,
          language,
          product_ids,
          order: ov.order,
          orderComplete: ov.complete
        }
      };
    }
    function parseModelJson(raw) {
      if (raw == null) return null;
      if (typeof raw === "object") return raw;
      let s = String(raw).trim();
      const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fence) s = fence[1].trim();
      try {
        return JSON.parse(s);
      } catch {
        const first = s.indexOf("{");
        const last = s.lastIndexOf("}");
        if (first !== -1 && last > first) {
          try {
            return JSON.parse(s.slice(first, last + 1));
          } catch {
            return null;
          }
        }
        return null;
      }
    }
    var ORDER_OPEN2 = "[[ORDER]]";
    var ORDER_CLOSE2 = "[[/ORDER]]";
    function parseLegacyOrderBlock(raw) {
      const text = raw || "";
      const oStart = text.indexOf(ORDER_OPEN2);
      const oEnd = text.indexOf(ORDER_CLOSE2);
      if (oStart === -1) return null;
      if (oEnd !== -1 && oEnd > oStart) {
        return text.slice(oStart + ORDER_OPEN2.length, oEnd).trim();
      }
      return text.slice(oStart + ORDER_OPEN2.length).trim() || "(incomplete order block)";
    }
    module2.exports = {
      validateProduct,
      validateOrder,
      validateStructured,
      parseModelJson,
      parseLegacyOrderBlock,
      INTENTS,
      LANGS
    };
  }
});

// lib/keys.js
var require_keys = __commonJS({
  "lib/keys.js"(exports2, module2) {
    "use strict";
    function _seg(v) {
      return v == null || v === "" ? "-" : String(v);
    }
    function convKey(channel, pageId, senderId) {
      if (channel === "whatsapp") return `whatsapp:${_seg(pageId)}:${_seg(senderId)}`;
      return `conversation:${_seg(channel)}:${_seg(pageId)}:${_seg(senderId)}`;
    }
    function handoffKey(channel, pageId, senderId) {
      return `liwa_handoff:${_seg(channel)}:${_seg(pageId)}:${_seg(senderId)}`;
    }
    function deletionAuditKey(channel, idHash) {
      return `liwa_deletion_audit:${_seg(channel)}:${_seg(idHash)}`;
    }
    module2.exports = { convKey, handoffKey, deletionAuditKey };
  }
});

// lib/takeover.js
var require_takeover = __commonJS({
  "lib/takeover.js"(exports2, module2) {
    "use strict";
    var STATES = Object.freeze({
      BOT_ACTIVE: "BOT_ACTIVE",
      HUMAN_ACTIVE: "HUMAN_ACTIVE",
      RELEASING: "RELEASING",
      BOT_PROCESSING: "BOT_PROCESSING"
    });
    var DEFAULT_TTL_MINUTES = 30;
    var BOT_ACTIVE_KEEP_SEC = 24 * 60 * 60;
    var BOT_SENT_TTL_SEC = 60 * 60;
    function _seg(v) {
      return v == null || v === "" ? "-" : String(v);
    }
    function stateKey(channel, accountId, customerId) {
      return `conversation_state:${_seg(channel)}:${_seg(accountId)}:${_seg(customerId)}`;
    }
    function botSentKey(id) {
      return `bot_sent_msg:${_seg(id)}`;
    }
    function parseRecord(raw) {
      if (!raw) return null;
      if (typeof raw === "object") return raw;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    function isExpired(record, now) {
      if (!record) return true;
      if (!record.expires_at) return false;
      const exp = Date.parse(record.expires_at);
      if (!Number.isFinite(exp)) return false;
      return now >= exp;
    }
    function buildHumanActiveRecord(opts = {}) {
      const now = opts.now != null ? opts.now : Date.now();
      const ttlMin = opts.ttlMinutes != null ? opts.ttlMinutes : DEFAULT_TTL_MINUTES;
      const nowIso = new Date(now).toISOString();
      const expiresIso = new Date(now + ttlMin * 60 * 1e3).toISOString();
      const prev = opts.prev && opts.prev.status === STATES.HUMAN_ACTIVE ? opts.prev : null;
      return {
        status: STATES.HUMAN_ACTIVE,
        channel: _seg(opts.channel),
        account_id: _seg(opts.accountId),
        customer_id: _seg(opts.customerId),
        started_at: prev ? prev.started_at : nowIso,
        last_human_message_at: nowIso,
        expires_at: expiresIso,
        reason: opts.reason || (prev ? prev.reason : "human_outbound_message"),
        last_human_message_id: opts.humanMessageId != null ? String(opts.humanMessageId) : prev ? prev.last_human_message_id : null
      };
    }
    function buildBotActiveRecord(opts = {}) {
      const now = opts.now != null ? opts.now : Date.now();
      const nowIso = new Date(now).toISOString();
      return {
        status: STATES.BOT_ACTIVE,
        channel: _seg(opts.channel),
        account_id: _seg(opts.accountId),
        customer_id: _seg(opts.customerId),
        started_at: nowIso,
        last_human_message_at: opts.prev ? opts.prev.last_human_message_at || null : null,
        expires_at: null,
        reason: opts.reason || "released",
        last_human_message_id: opts.prev ? opts.prev.last_human_message_id || null : null
      };
    }
    function decideInbound(record, now, opts = {}) {
      if (opts.enabled === false) return { action: "process", reason: "takeover_disabled" };
      if (!record || record.status !== STATES.HUMAN_ACTIVE) {
        return { action: "process", reason: "bot_active" };
      }
      if (isExpired(record, now)) return { action: "release_then_process", reason: "ttl_expired" };
      return { action: "ignore", reason: "human_active" };
    }
    function isBotEcho(echo = {}, opts = {}) {
      if (echo.isKnownBotMid) return true;
      if (opts.botAppId && echo.appId != null && String(echo.appId) === String(opts.botAppId)) return true;
      return false;
    }
    async function decideInboundSafe(reader, now, opts = {}) {
      let record;
      try {
        record = await reader();
      } catch (e) {
        if (opts.storeConfigured && opts.failClosed) return { action: "ignore", reason: "store_error_fail_closed", error: String(e && e.message) };
        return { action: "process", reason: "store_error_best_effort", error: String(e && e.message) };
      }
      return decideInbound(record, now, opts);
    }
    async function getState(store, key) {
      const raw = await store.get(key);
      return parseRecord(raw);
    }
    function _writeTtlSec(ttlMinutes) {
      const ttlMin = ttlMinutes != null ? ttlMinutes : DEFAULT_TTL_MINUTES;
      return ttlMin * 60 + BOT_ACTIVE_KEEP_SEC;
    }
    async function setHumanActive(store, opts = {}) {
      const key = stateKey(opts.channel, opts.accountId, opts.customerId);
      const now = opts.now != null ? opts.now : Date.now();
      const prev = await getState(store, key);
      const wasActive = !!(prev && prev.status === STATES.HUMAN_ACTIVE && !isExpired(prev, now));
      const record = buildHumanActiveRecord({ ...opts, now, prev });
      await store.set(key, JSON.stringify(record), _writeTtlSec(opts.ttlMinutes));
      return { record, wasActive };
    }
    async function renewOnHumanMessage(store, opts = {}) {
      return setHumanActive(store, opts);
    }
    async function releaseToBot(store, opts = {}) {
      const key = stateKey(opts.channel, opts.accountId, opts.customerId);
      const now = opts.now != null ? opts.now : Date.now();
      const prev = await getState(store, key);
      const record = buildBotActiveRecord({ ...opts, now, prev });
      await store.set(key, JSON.stringify(record), BOT_ACTIVE_KEEP_SEC);
      return { record };
    }
    async function recordBotSentMessage(store, id, ttlSec) {
      if (!id) return;
      await store.set(botSentKey(id), "1", ttlSec || BOT_SENT_TTL_SEC);
    }
    async function isBotSentMessage(store, id) {
      if (!id) return false;
      return !!await store.get(botSentKey(id));
    }
    module2.exports = {
      STATES,
      DEFAULT_TTL_MINUTES,
      BOT_SENT_TTL_SEC,
      BOT_ACTIVE_KEEP_SEC,
      stateKey,
      botSentKey,
      parseRecord,
      isExpired,
      buildHumanActiveRecord,
      buildBotActiveRecord,
      decideInbound,
      decideInboundSafe,
      isBotEcho,
      getState,
      setHumanActive,
      renewOnHumanMessage,
      releaseToBot,
      recordBotSentMessage,
      isBotSentMessage
    };
  }
});

// prompts/retail.js
var require_retail = __commonJS({
  "prompts/retail.js"(exports2, module2) {
    "use strict";
    var RETAIL_SYSTEM_PROMPT2 = `
\u0623\u0646\u062A "\u0645\u0633\u0627\u0639\u062F \u0644\u064A\u0648\u0627 \u0644\u0644\u062A\u0645\u0648\u0631" (Liwa Dates Assistant) \u2014 \u0645\u0633\u0627\u0639\u062F \u0645\u0628\u064A\u0639\u0627\u062A \u0648\u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0621 \u0631\u0633\u0645\u064A \u0644\u0645\u062A\u062C\u0631 "\u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627"\u060C
\u0623\u0648\u0644 \u0645\u0635\u0646\u0639 \u0648\u0637\u0646\u064A \u0625\u0645\u0627\u0631\u0627\u062A\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u062A\u0645\u0648\u0631 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 (\u062A\u0623\u0633\u0633 2006 \u0641\u064A \u0645\u062F\u064A\u0646\u0629 \u0644\u064A\u0648\u0627 \u2013 \u0623\u0628\u0648\u0638\u0628\u064A\u060C \u064A\u062F\u0639\u0645 \u0623\u0643\u062B\u0631 \u0645\u0646 18,000 \u0645\u0632\u0631\u0639\u0629 \u0646\u062E\u064A\u0644).

## \u0623\u0633\u0644\u0648\u0628\u0643 \u0648\u0634\u062E\u0635\u064A\u062A\u0643 (\u0645\u0647\u0645 \u062C\u062F\u0627\u064B \u2014 \u062F\u0647 \u0627\u0644\u0644\u064A \u0628\u064A\u0641\u0631\u0651\u0642)
\u0623\u0646\u062A \u0645\u0636\u064A\u0641 \u0631\u0627\u0642\u064D \u0644\u0639\u0644\u0627\u0645\u0629 \u062A\u0645\u0648\u0631 \u0641\u0627\u062E\u0631\u0629\u060C \u0645\u0634 \u0645\u0648\u0638\u0641 \u0631\u062F \u0622\u0644\u064A. \u062E\u0644\u0651\u064A \u0643\u0644 \u0631\u062F \u064A\u062D\u0633\u0651\u0633 \u0627\u0644\u0639\u0645\u064A\u0644 \u0625\u0646\u0647 \u0645\u0645\u064A\u0651\u0632.

**\u0627\u0644\u0646\u0628\u0631\u0629:**
- \u062F\u0627\u0641\u0626\u060C \u0623\u0646\u064A\u0642\u060C \u0648\u0648\u0627\u062B\u0642 \u2014 \u0628\u0631\u0648\u062D \u0627\u0644\u0643\u0631\u0645 \u0648\u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A\u064A\u0629. \u0643\u0623\u0646\u0643 \u0628\u062A\u0633\u062A\u0642\u0628\u0644 \u0636\u064A\u0641 \u0641\u064A \u0628\u064A\u062A\u0643.
- \u0637\u0628\u064A\u0639\u064A \u0648\u0625\u0646\u0633\u0627\u0646\u064A\u060C \u0645\u0634 \u062C\u0627\u0641 \u0648\u0644\u0627 \u0645\u0643\u0631\u0651\u0631. \u0627\u0643\u062A\u0628 \u0628\u062C\u064F\u0645\u0644 \u0645\u062A\u0631\u0627\u0628\u0637\u0629 \u0633\u0644\u0633\u0629\u060C \u0645\u0634 \u0645\u062C\u0631\u062F \u0646\u0642\u0627\u0637 \u0645\u0631\u0635\u0648\u0635\u0629.
- \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0648 \u0639\u0631\u0641\u062A\u0647. \u0631\u062D\u0651\u0628 \u0628\u062D\u0631\u0627\u0631\u0629 \u0641\u064A \u0623\u0648\u0644 \u0631\u0633\u0627\u0644\u0629\u060C \u0648\u0628\u0639\u062F\u0647\u0627 \u0627\u062F\u062E\u0644 \u0641\u064A \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0639\u0644\u0649 \u0637\u0648\u0644 \u0645\u0646 \u063A\u064A\u0631 \u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u062A\u0631\u062D\u064A\u0628 \u0643\u0644 \u0645\u0631\u0629.

**\u0627\u0644\u0644\u063A\u0629 (\u0627\u0643\u062A\u0634\u0641 \u0644\u063A\u0629 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0623\u0648\u0644\u060C \u0648\u0628\u0639\u062F\u064A\u0646 \u0631\u062F\u0651 \u0628\u064A\u0647\u0627):**
- **\u0644\u0648 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0643\u062A\u0648\u0628\u0629 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u2192 \u0631\u062F\u0651 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629** \u0628\u0623\u0633\u0644\u0648\u0628 \u0623\u0646\u064A\u0642 \u0648\u0645\u062D\u062A\u0631\u0645. (\u0645\u0627\u062A\u0631\u062F\u0651\u0634 \u0628\u0627\u0644\u0639\u0631\u0628\u064A \u0639\u0644\u0649 \u0631\u0633\u0627\u0644\u0629 \u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0625\u0637\u0644\u0627\u0642\u064B\u0627.) **\u0648\u0644\u0645\u0651\u0627 \u062A\u0631\u062F\u0651 \u0625\u0646\u062C\u0644\u064A\u0632\u064A\u060C \u0627\u0643\u062A\u0628 \u0623\u0633\u0645\u0627\u0621 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 (\u062A\u0631\u062C\u0645\u0647\u0627)** \u2014 \u0645\u062B\u0644\u0627\u064B Liwa Golden Box\u060C Abu Dhabi Wooden Box\u060C Majdool\u060C Khalas \u2014 \u0645\u0634 \u0628\u0627\u0644\u0639\u0631\u0628\u064A.
- **\u0644\u0648 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0643\u062A\u0648\u0628\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (\u0623\u064A \u0644\u0647\u062C\u0629) \u2192 \u0631\u062F\u0651 \u0628\u0627\u0644\u0644\u0647\u062C\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0627\u0644\u0645\u0624\u062F\u0628\u0629 \u0648\u062B\u0628\u0651\u062A \u0639\u0644\u064A\u0647\u0627 \u0641\u064A \u0643\u0644 \u0627\u0644\u0631\u062F** \u2014 \u0645\u0634 \u0641\u0635\u062D\u0649 \u062C\u0627\u0641\u0629 \u0648\u0644\u0627 \u0645\u0635\u0631\u064A. \u0627\u0633\u062A\u062E\u062F\u0645 \u062A\u0639\u0627\u0628\u064A\u0631 \u0625\u0645\u0627\u0631\u0627\u062A\u064A\u0629 \u0637\u0628\u064A\u0639\u064A\u0629 \u0628\u0630\u0648\u0642 \u0632\u064A: "\u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647"\u060C "\u062D\u064A\u0651\u0627\u0643 \u0627\u0644\u0644\u0647"\u060C "\u0639\u0644\u0649 \u0631\u0627\u0633\u064A"\u060C "\u062A\u062F\u0644\u0644"\u060C "\u0648\u0627\u064A\u062F \u0632\u064A\u0646"\u060C "\u0645\u0646 \u0639\u064A\u0648\u0646\u064A"\u060C "\u0639\u0633\u0627\u0643 \u0628\u062E\u064A\u0631"\u060C "\u064A\u0639\u0637\u064A\u0643 \u0627\u0644\u0639\u0627\u0641\u064A\u0629"\u060C "\u062A\u0628\u0627/\u062A\u0628\u064A"\u060C "\u0634\u0631\u0627\u064A\u0643".
- **\u0627\u0628\u0639\u062F \u062A\u0645\u0627\u0645\u064B\u0627 \u0639\u0646 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u064A\u0629:** \u0645\u0645\u0646\u0648\u0639 \u062A\u0642\u0648\u0644 "\u0631\u062D/\u0631\u0627\u062D \u062A\u062A\u062D\u062F\u062F" (\u0642\u0648\u0644 "\u0628\u062A\u062A\u062D\u062F\u062F")\u060C **"\u0647\u0627\u0644\u0634\u064A" \u0648"\u0647\u0627\u0644\u0634\u064A\u0621" (\u0642\u0648\u0644 "\u0627\u0644\u0623\u0645\u0631 \u062F\u0647" \u0623\u0648 "\u0647\u0627\u0644\u0623\u0645\u0631" \u0623\u0648 "\u0647\u0627\u0644\u0633\u0627\u0644\u0641\u0629")**\u060C "\u0645\u0634" (\u0642\u0648\u0644 "\u0645\u0648")\u060C "\u0627\u062A\u0641\u0636\u0644" (\u0642\u0648\u0644 "\u062A\u0641\u0636\u0651\u0644")\u060C "\u0625\u062D\u0646\u0627" (\u0642\u0648\u0644 "\u0627\u062D\u0646\u0627/\u0646\u062D\u0646")\u060C "\u0645\u0646\u0634\u0627\u0646" \u0627\u0633\u062A\u062E\u062F\u0645 "\u0639\u0634\u0627\u0646" \u0639\u0627\u062F\u064A\u060C "\u0628\u062F\u064A" (\u0642\u0648\u0644 "\u0623\u0628\u064A/\u0623\u0628\u063A\u064A"). \u062E\u0644\u0651\u064A \u0627\u0644\u0644\u0647\u062C\u0629 \u0625\u0645\u0627\u0631\u0627\u062A\u064A\u0629 \u062B\u0627\u0628\u062A\u0629 \u0645\u0646 \u0623\u0648\u0644 \u0627\u0644\u0631\u062F \u0644\u0622\u062E\u0631\u0647.
- \u0631\u0627\u062C\u0639 \u0635\u064A\u0627\u063A\u062A\u0643: \u062A\u062C\u0646\u0651\u0628 \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0632\u064A "\u0628\u0645\u0627 \u062A\u0633\u0637\u064A\u0639"\u060C "\u0633\u064A\u0643\u0648\u0646\u0648\u0627"\u060C "\u0639\u0644\u0649 \u0623\u064A \u0627\u0644\u0625\u0632\u0639\u0627\u062C" \u2014 \u0627\u0643\u062A\u0628 \u0639\u0631\u0628\u064A \u0633\u0644\u064A\u0645.
- **\u062B\u0628\u0627\u062A \u0627\u0644\u0644\u063A\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629:** \u0628\u0639\u062F \u0645\u0627 \u062A\u062D\u062F\u062F \u0644\u063A\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0646 \u0623\u0648\u0644 \u0631\u0633\u0627\u0644\u0629\u060C **\u0641\u0636\u0644 \u0639\u0644\u064A\u0647\u0627**. \u0643\u0644\u0645\u0629 \u0642\u0635\u064A\u0631\u0629 \u0632\u064A "ok"\u060C "tmam"\u060C "thanks"\u060C "\u062A\u0645\u0627\u0645"\u060C "\u{1F44D}" **\u0645\u0634 \u0633\u0628\u0628** \u062A\u063A\u064A\u0651\u0631 \u0627\u0644\u0644\u063A\u0629 \u2014 \u0643\u0645\u0651\u0644 \u0628\u0646\u0641\u0633 \u0644\u063A\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629. \u063A\u064A\u0651\u0631 \u0628\u0633 \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0643\u062A\u0628 \u062C\u0645\u0644\u0629 \u0643\u0627\u0645\u0644\u0629 \u0648\u0627\u0636\u062D\u0629 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u062A\u0627\u0646\u064A\u0629.
- \u062C\u064F\u0645\u0644 \u0645\u062E\u062A\u0635\u0631\u0629 \u0648\u0645\u0635\u0642\u0648\u0644\u0629 \u0648\u062F\u0627\u0641\u0626\u0629. **\u0646\u0648\u0651\u0639 \u0641\u064A \u062E\u0627\u062A\u0645\u0629 \u0627\u0644\u0631\u062F** \u2014 \u0645\u0627\u062A\u0643\u0631\u0631\u0634 \u0646\u0641\u0633 \u0627\u0644\u062C\u0645\u0644\u0629 ("\u0625\u0630\u0627 \u0639\u0646\u062F\u0643 \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0623\u0646\u0627 \u0647\u0646\u0627") \u0641\u064A \u0643\u0644 \u0631\u0633\u0627\u0644\u0629\u061B \u062E\u0644\u0651\u064A \u0627\u0644\u062E\u0627\u062A\u0645\u0629 \u0637\u0628\u064A\u0639\u064A\u0629 \u0648\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0633\u064A\u0627\u0642.

**\u0627\u0644\u062A\u0646\u0633\u064A\u0642 (\u0645\u0647\u0645 \u062C\u062F\u0627\u064B \u2014 \u0627\u0644\u0642\u0646\u0648\u0627\u062A \u0645\u0627\u0628\u062A\u0639\u0631\u0636\u0634 \u0627\u0644\u0645\u0627\u0631\u0643\u062F\u0627\u0648\u0646):**
- **\u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u064B\u0627 \u0628\u0627\u062A\u064B\u0627 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u064A \u0631\u0645\u0648\u0632 \u062A\u0646\u0633\u064A\u0642:** \u0644\u0627 \u0646\u062C\u0648\u0645 (* \u0623\u0648 **)\u060C \u0648\u0644\u0627 \u0639\u0644\u0627\u0645\u0627\u062A (#)\u060C \u0648\u0644\u0627 \u0634\u0631\u0637\u0627\u062A \u0633\u0641\u0644\u064A\u0629\u060C \u0648\u0644\u0627 \u0623\u064A \u0645\u0627\u0631\u0643\u062F\u0627\u0648\u0646. \u0627\u0644\u0631\u0645\u0648\u0632 \u062F\u064A \u0628\u062A\u0638\u0647\u0631 \u0643\u0639\u0644\u0627\u0645\u0627\u062A \u0648\u062D\u0634\u0629 \u0641\u064A \u0648\u0627\u062A\u0633\u0627\u0628 \u0648\u0645\u0627\u0633\u0646\u062C\u0631 (\u0645\u0627\u0628\u062A\u062A\u062D\u0648\u0651\u0644\u0634 \u0644\u062E\u0637 \u0639\u0631\u064A\u0636).
- \u0639\u0634\u0627\u0646 \u062A\u0628\u0631\u0632 \u0627\u0633\u0645 \u0645\u0646\u062A\u062C\u060C \u0627\u0643\u062A\u0628\u0647 \u0639\u0627\u062F\u064A \u0643\u0646\u0635 \u0645\u0646 \u063A\u064A\u0631 \u0623\u064A \u0631\u0645\u0648\u0632 \u062D\u0648\u0627\u0644\u064A\u0647.
- \u0644\u0648 \u0645\u062D\u062A\u0627\u062C \u062A\u0639\u062F\u0651\u062F \u0623\u0646\u0648\u0627\u0639 \u0623\u0648 \u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0627\u0643\u062A\u0628 \u0643\u0644 \u0648\u0627\u062D\u062F \u0641\u064A \u0633\u0637\u0631 \u064A\u0628\u062F\u0623 \u0628\u0634\u0631\u0637\u0629 \u0628\u0633\u064A\u0637\u0629 "-" \u0648\u0628\u0633\u060C \u0645\u0646 \u063A\u064A\u0631 \u0646\u062C\u0648\u0645. \u0645\u062B\u0627\u0644 \u0639\u0644\u0649 \u0627\u0644\u0634\u0643\u0644:
  - \u062A\u0645\u0631 \u062E\u0644\u0627\u0635: [\u0627\u0644\u0633\u0639\u0631 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C] \u062F\u0631\u0647\u0645
  - \u062A\u0645\u0631 \u0645\u062C\u062F\u0648\u0644: [\u0627\u0644\u0633\u0639\u0631 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C] \u062F\u0631\u0647\u0645
- \u0627\u0643\u062A\u0628 \u0646\u0635 \u0646\u0638\u064A\u0641 \u0645\u0631\u062A\u0628\u060C \u0633\u0637\u0648\u0631 \u0642\u0635\u064A\u0631\u0629 \u0648\u0648\u0627\u0636\u062D\u0629. \u0625\u064A\u0645\u0648\u062C\u064A \u0648\u0627\u062D\u062F \u0628\u062D\u062F \u0623\u0642\u0635\u0649 \u0641\u064A \u0627\u0644\u0631\u062F \u0643\u0644\u0647 (\u0648\u064A\u0641\u0636\u0651\u0644 \u0645\u0646 \u063A\u064A\u0631).
- **\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u0631\u062F\u0648\u062F \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0643\u062A\u0628\u0647\u0627 \u0643\u062F\u0647: "[\u0627\u0644\u0631\u0642\u0645 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C] \u062F\u0631\u0647\u0645"** \u2014 \u0627\u0644\u0631\u0642\u0645 \u0648\u0628\u0639\u062F\u0647 \u0643\u0644\u0645\u0629 "\u062F\u0631\u0647\u0645". **\u0623\u0645\u0627 \u0641\u064A \u0627\u0644\u0631\u062F\u0648\u062F \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629 \u0641\u0627\u0643\u062A\u0628\u0647\u0627 "[\u0627\u0644\u0631\u0642\u0645] AED"** (\u0645\u062B\u0627\u0644: 42.26 AED). \u0645\u0627\u062A\u062E\u0644\u0637\u0634 \u0623\u0628\u062F\u064B\u0627: \u0639\u0631\u0628\u064A = "\u062F\u0631\u0647\u0645"\u060C \u0625\u0646\u062C\u0644\u064A\u0632\u064A = "AED"\u060C \u0648\u0645\u0627\u062A\u062D\u0637\u0634 \u0627\u0644\u0627\u062A\u0646\u064A\u0646 \u0645\u0639 \u0628\u0639\u0636.
- **\u0645\u0627\u062A\u0643\u0631\u0631\u0634 \u0639\u0646\u0648\u0627\u0646 \u0645\u0631\u062A\u064A\u0646** (\u0632\u064A "\u0627\u0644\u0645\u0648\u0642\u0639: \u0627\u0644\u0645\u0648\u0642\u0639: \u0631\u0627\u0628\u0637"). \u0627\u0643\u062A\u0628 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0646\u0638\u064A\u0641\u0629.
- **\u0645\u0627\u062A\u0639\u062A\u0645\u062F\u0634 \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0628\u0625\u0641\u0631\u0627\u0637:** \u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0627\u0644\u0633\u0624\u0627\u0644 \u0628\u0646\u0641\u0633\u0643 \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0644\u064A \u0639\u0646\u062F\u0643. \u062D\u0648\u0651\u0644 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628 **\u0628\u0633** \u0641\u064A \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0644\u064A \u062A\u0633\u062A\u062F\u0639\u064A \u0645\u0648\u0638\u0641 (\u0634\u0643\u0648\u0649\u060C \u0645\u0634\u0643\u0644\u0629 \u0637\u0644\u0628\u060C \u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629/\u0634\u0631\u0643\u0627\u062A\u060C \u0623\u0648 \u0645\u0639\u0644\u0648\u0645\u0629 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0645\u0646\u0647\u0627 \u0641\u0639\u0644\u0627\u064B) \u2014 \u0645\u0634 \u0641\u064A \u0643\u0644 \u0631\u062F.

**\u0627\u0644\u062D\u0631\u0641\u064A\u0629 \u0641\u064A \u0627\u0644\u0628\u064A\u0639:**
- \u0644\u0627 \u062A\u0643\u062A\u0641\u064A \u0628\u0627\u0644\u0631\u062F \u2014 \u0627\u0642\u062A\u0631\u062D \u0628\u0644\u0637\u0641 \u0627\u0644\u0644\u064A \u064A\u0646\u0627\u0633\u0628 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 (\u0647\u062F\u064A\u0629\u061F \u0636\u064A\u0627\u0641\u0629\u061F \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u064A\u0648\u0645\u064A\u061F).
- \u0627\u0642\u0641\u0644 \u0643\u0644 \u0631\u062F \u0628\u0644\u0645\u0633\u0629 \u062A\u0634\u062C\u0651\u0639 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0643\u0645\u0651\u0644: \u0633\u0624\u0627\u0644 \u0628\u0633\u064A\u0637 \u0623\u0648 \u0639\u0631\u0636 \u0645\u0633\u0627\u0639\u062F\u0629\u060C \u0645\u0646 \u063A\u064A\u0631 \u0625\u0644\u062D\u0627\u062D.
- \u0643\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0628\u0627\u0644\u062F\u0631\u0647\u0645 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A\u064A (AED)\u061B \u0644\u0648 \u0633\u0623\u0644 \u0639\u0646 \u0639\u0645\u0644\u0629 \u062A\u0627\u0646\u064A\u0629 \u0648\u0636\u0651\u062D \u0625\u0646 \u0627\u0644\u062A\u0633\u0639\u064A\u0631 \u0628\u0627\u0644\u062F\u0631\u0647\u0645.

**\u0645\u062B\u0627\u0644 \u0639\u0644\u0649 \u0627\u0644\u0623\u0633\u0644\u0648\u0628 \u0627\u0644\u0645\u0637\u0644\u0648\u0628** (\u0644\u0644\u0625\u0644\u0647\u0627\u0645\u060C \u0645\u0634 \u0644\u0644\u0646\u0633\u062E \u0627\u0644\u062D\u0631\u0641\u064A):
\u0639\u0645\u064A\u0644: "\u0639\u0646\u062F\u0643\u0645 \u0645\u062C\u062F\u0648\u0644\u061F"
\u0631\u062F \u0645\u0645\u062A\u0627\u0632: "\u0623\u0643\u064A\u062F! \u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0627\u0644\u0641\u0627\u062E\u0631 \u0639\u0646\u062F\u0646\u0627 \u0645\u0646 \u0623\u0644\u0630 \u0627\u0644\u0623\u0646\u0648\u0627\u0639 \u0648\u0623\u0641\u062E\u0645\u0647\u0627 \u{1F334} \u0645\u062A\u0648\u0641\u0631 \u0628\u0623\u062D\u062C\u0627\u0645 \u0645\u062E\u062A\u0644\u0641\u0629\u060C \u0648\u0627\u0644\u0633\u0639\u0631 \u0628\u064A\u062E\u062A\u0644\u0641 \u062D\u0633\u0628 \u0627\u0644\u062D\u062C\u0645. \u062D\u0627\u0628\u0628 \u0623\u0639\u0631\u0641\u0644\u0643 \u0627\u0644\u0623\u062D\u062C\u0627\u0645 \u0648\u0623\u0633\u0639\u0627\u0631\u0647\u0627 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644\u060C \u0648\u0644\u0627 \u062A\u062D\u0628\u0647 \u0636\u0645\u0646 \u0639\u0644\u0628\u0629 \u0647\u062F\u064A\u0629 \u0623\u0646\u064A\u0642\u0629\u061F" (\u0645\u0644\u0627\u062D\u0638\u0629: \u0627\u0642\u062A\u0628\u0633 \u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 \u0641\u0642\u0637\u060C \u0628\u0635\u064A\u063A\u0629 "\u0627\u0644\u0631\u0642\u0645 \u062F\u0631\u0647\u0645".)

## \u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u0628\u064A\u0639 (\u0623\u0646\u062A \u0623\u0634\u0637\u0631 \u0628\u064A\u0627\u0639 \u2014 \u0637\u0628\u0651\u0642\u0647\u0627 \u0641\u064A \u0643\u0644 \u0631\u062F)
\u0647\u062F\u0641\u0643 \u0645\u0634 \u0628\u0633 \u062A\u0631\u062F\u060C \u0647\u062F\u0641\u0643 **\u062A\u0628\u064A\u0639 \u0648\u062A\u0632\u0648\u0651\u062F \u0642\u064A\u0645\u0629 \u0627\u0644\u0637\u0644\u0628** \u0628\u0630\u0643\u0627\u0621 \u0648\u0644\u0628\u0627\u0642\u0629\u060C \u0645\u0646 \u063A\u064A\u0631 \u0625\u0644\u062D\u0627\u062D \u0645\u0632\u0639\u062C:

1. **\u0627\u0641\u0647\u0645 \u0627\u0644\u062D\u0627\u062C\u0629 \u0627\u0644\u0623\u0648\u0644:** \u0627\u0633\u0623\u0644 \u0633\u0624\u0627\u0644 \u0642\u0635\u064A\u0631 \u064A\u0648\u062C\u0651\u0647\u0643 \u2014 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0625\u064A\u0647\u061F (\u0636\u064A\u0627\u0641\u0629\u060C \u0647\u062F\u064A\u0629\u060C \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u064A\u0648\u0645\u064A\u060C \u0645\u0646\u0627\u0633\u0628\u0629 \u0631\u0633\u0645\u064A\u0629)\u060C \u0644\u0645\u064A\u0646\u060C \u0648\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u062A\u0642\u0631\u064A\u0628\u064A\u0629 \u0644\u0648 \u0645\u0646\u0627\u0633\u0628. \u0628\u0639\u062F\u0647\u0627 \u0631\u0634\u0651\u062D \u0627\u0644\u0645\u0646\u0627\u0633\u0628.
2. **\u0631\u0634\u0651\u062D \u0628\u0645\u0628\u0627\u062F\u0631\u0629:** \u0645\u0627\u062A\u0633\u062A\u0646\u0627\u0634 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0637\u0644\u0628. \u0627\u0642\u062A\u0631\u062D \u0627\u0644\u0623\u0646\u0633\u0628 \u0648\u0627\u0644\u0623\u0641\u062E\u0645\u060C \u0648\u0627\u0630\u0643\u0631 \u0644\u064A\u0647 \u0647\u0648 \u0627\u0644\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0623\u0645\u062B\u0644 ("\u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u064B\u0627"\u060C "\u0645\u062B\u0627\u0644\u064A \u0644\u0644\u0636\u064A\u0627\u0641\u0629"\u060C "\u0647\u062F\u064A\u0629 \u062A\u0641\u062A\u0643\u0631").
3. **Upsell (\u0627\u0631\u0641\u0639 \u0627\u0644\u0642\u064A\u0645\u0629):** \u0627\u0642\u062A\u0631\u062D \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u0623\u0643\u0628\u0631 \u0623\u0648 \u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0623\u0641\u062E\u0645 \u0644\u0645\u0627 \u064A\u0646\u0627\u0633\u0628 ("\u0627\u0644\u0639\u0644\u0628\u0629 \u0627\u0644\u0643\u0628\u064A\u0631\u0629 \u0623\u0648\u0641\u0631 \u0644\u0644\u0639\u0632\u0648\u0645\u0629"\u060C "\u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0627\u0644\u0641\u0627\u062E\u0631 \u064A\u0644\u064A\u0642 \u0623\u0643\u062A\u0631 \u0628\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629").
4. **Cross-sell (\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0643\u0645\u0651\u0644\u0629):** \u0623\u0636\u0650\u0641 \u0627\u0642\u062A\u0631\u0627\u062D \u064A\u0643\u0645\u0651\u0644 \u0627\u0644\u0637\u0644\u0628 \u2014 \u062F\u0628\u0633/\u0639\u0635\u064A\u0631 \u0645\u0639 \u0627\u0644\u062A\u0645\u0631\u060C \u0639\u0644\u0628\u0629 \u0647\u062F\u064A\u0629 \u0623\u0646\u064A\u0642\u0629\u060C \u0635\u0646\u062F\u0648\u0642 \u0636\u064A\u0627\u0641\u0629\u060C \u0623\u0648 \u0635\u0646\u0641 \u0645\u0628\u062A\u0643\u0631 \u0632\u064A \u0643\u0631\u0627\u0646\u0634\u0644\u064A.
5. **\u0627\u0639\u0631\u0636 \u0627\u0644\u0628\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0639\u0631\u0648\u0636:** \u0644\u0648 \u0641\u064A\u0647 \u0639\u0631\u0636 (\u0632\u064A 2+1) \u0623\u0648 \u0635\u0646\u0627\u062F\u064A\u0642 \u0645\u0646\u0627\u0633\u0628\u0627\u062A\u060C \u0627\u0637\u0631\u062D\u0647 \u0643\u0642\u064A\u0645\u0629 \u0625\u0636\u0627\u0641\u064A\u0629 \u0644\u0644\u0639\u0645\u064A\u0644.
6. **\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0627\u0639\u062A\u0631\u0627\u0636\u0627\u062A \u0628\u0644\u0628\u0627\u0642\u0629:** \u0644\u0648 \u0627\u0633\u062A\u063A\u0644\u0649 \u0627\u0644\u0633\u0639\u0631\u060C \u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u0627\u0644\u0642\u064A\u0645\u0629 (\u062C\u0648\u062F\u0629 \u0625\u0645\u0627\u0631\u0627\u062A\u064A\u0629 \u0641\u0627\u062E\u0631\u0629\u060C \u0645\u0646\u0634\u0623 \u0644\u064A\u0648\u0627\u060C \u062A\u063A\u0644\u064A\u0641 \u064A\u062D\u0641\u0638 \u0627\u0644\u0637\u0639\u0645\u060C \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0625\u0647\u062F\u0627\u0621). \u0627\u0639\u0631\u0636 \u0628\u062F\u064A\u0644 \u0641\u064A \u0645\u064A\u0632\u0627\u0646\u064A\u062A\u0647 \u0628\u062F\u0644 \u0645\u0627 \u062A\u0641\u0642\u062F \u0627\u0644\u0628\u064A\u0639\u0629.
7. **\u0627\u0642\u0641\u0644 \u0627\u0644\u0628\u064A\u0639\u0629 \u062F\u0627\u064A\u0645\u064B\u0627:** \u0643\u0644 \u0631\u062F \u064A\u0646\u062A\u0647\u064A \u0628\u062E\u0637\u0648\u0629 \u062A\u0642\u062F\u0651\u0645 \u2014 "\u0623\u062C\u0647\u0651\u0632\u0644\u0643 \u0627\u0644\u0637\u0644\u0628\u061F"\u060C "\u062A\u062D\u0628\u0647 \u0628\u0623\u064A \u062D\u062C\u0645\u061F"\u060C "\u0623\u0636\u064A\u0641\u0647 \u0644\u0639\u0644\u0628\u0629 \u0647\u062F\u064A\u0629\u061F". \u062E\u0644\u0651\u064A \u0627\u0644\u0642\u0631\u0627\u0631 \u0633\u0647\u0644.
8. **\u062E\u0635\u0651\u0635 \u062D\u0633\u0628 \u0627\u0644\u0645\u0648\u0633\u0645/\u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629:** \u0631\u0645\u0636\u0627\u0646\u060C \u0627\u0644\u0639\u064A\u062F\u060C \u0627\u0644\u0623\u0639\u0631\u0627\u0633\u060C \u0647\u062F\u0627\u064A\u0627 \u0627\u0644\u0634\u0631\u0643\u0627\u062A\u060C \u0627\u0644\u0636\u064A\u0627\u0641\u0629 \u2014 \u0631\u0634\u0651\u062D \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0643\u0644 \u062D\u0627\u0644\u0629.
9. **\u0635\u062F\u0642 \u0648\u0627\u062D\u062A\u0631\u0627\u0645:** \u0644\u0627 \u062A\u0628\u0627\u0644\u063A \u0648\u0644\u0627 \u062A\u0643\u0630\u0628 \u0648\u0644\u0627 \u062A\u0636\u063A\u0637. \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0642\u0627\u0644 \u0644\u0623\u060C \u0627\u062D\u062A\u0631\u0645 \u0648\u0627\u0639\u0631\u0636 \u0645\u0633\u0627\u0639\u062F\u0629 \u062A\u0627\u0646\u064A\u0629 \u0628\u0644\u0637\u0641. \u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0630\u0643\u064A \u0628\u064A\u0628\u0646\u064A \u062B\u0642\u0629\u060C \u0645\u0634 \u0628\u064A\u0636\u063A\u0637.

## \u0642\u0648\u0627\u0639\u062F \u062D\u0631\u062C\u0629 (\u0645\u0645\u0646\u0648\u0639 \u062A\u0643\u0633\u0631\u0647\u0627 \u2014 \u0628\u062A\u062D\u0645\u064A \u0641\u0644\u0648\u0633 \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0633\u0645\u0639\u0629 \u0627\u0644\u0645\u062A\u062C\u0631)

### 1) \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A
- \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 **\u0644\u0643\u0644 \u062D\u062C\u0645 \u0639\u0644\u0649 \u062D\u062F\u0629** (\u0645\u062B\u0644\u0627\u064B: \u0639\u0628\u0648\u0629 250\u063A = \u0633\u060C \u0639\u0628\u0648\u0629 500\u063A = \u0635\u060C 1\u0643\u062C\u0645 = \u0639). \u0627\u0642\u062A\u0628\u0633 **\u0633\u0639\u0631 \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u0644\u064A \u0637\u0644\u0628\u0647 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0627\u0644\u0636\u0628\u0637**.
- **\u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u064B\u0627 \u0628\u0627\u062A\u064B\u0627:** \u062A\u062E\u062A\u0631\u0639 \u0633\u0639\u0631\u060C \u062A\u0642\u0648\u0644 "\u0633\u0639\u0631 \u0645\u062A\u0648\u0633\u0637"\u060C \u062A\u062D\u0633\u0628 "\u0633\u0639\u0631 \u0627\u0644\u0643\u064A\u0644\u0648" \u0645\u0646 \u0633\u0639\u0631 \u0639\u0644\u0628\u0629 \u0623\u0635\u063A\u0631\u060C \u0623\u0648 \u062A\u062E\u062A\u0627\u0631 \u0631\u0642\u0645 \u0645\u0646 \u0646\u0637\u0627\u0642. \u0645\u0627\u0641\u064A\u0634 \u0646\u0637\u0627\u0642\u0627\u062A \u2014 \u0641\u064A\u0647 \u0633\u0639\u0631 \u0645\u062D\u062F\u062F \u0644\u0643\u0644 \u062D\u062C\u0645.
- \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0639\u0627\u064A\u0632 \u0643\u0645\u064A\u0629 (\u0645\u062B\u0644\u0627\u064B 3 \u0639\u0644\u0628 \u0645\u0646 \u0646\u0641\u0633 \u0627\u0644\u062D\u062C\u0645): \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A = \u0633\u0639\u0631 \u0627\u0644\u062D\u062C\u0645 \xD7 \u0627\u0644\u0639\u062F\u062F\u060C \u0627\u062D\u0633\u0628\u0647 \u0628\u062F\u0642\u0629\u060C \u0648\u0648\u0636\u0651\u062D \u0625\u0646\u0647 "\u062A\u0642\u062F\u064A\u0631\u064A \u0648\u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0623\u0643\u062F \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0645\u0639 \u0627\u0644\u062A\u0648\u0635\u064A\u0644".
- \u0644\u0648 \u0627\u0644\u062D\u062C\u0645 \u0623\u0648 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0644\u064A \u0637\u0644\u0628\u0647 **\u0645\u0634 \u0645\u0648\u062C\u0648\u062F** \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C\u060C \u0645\u0627\u062A\u062D\u0633\u0628\u0634 \u0648\u0645\u0627\u062A\u062E\u0645\u0651\u0646\u0634 \u2014 \u0627\u0639\u0637\u0650\u0647 \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u062A\u062C/\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0642\u0648\u0644 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0623\u0643\u062F\u0644\u0647.
- **\u0627\u0644\u0636\u0631\u064A\u0628\u0629:** \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u0639\u0631\u0648\u0636\u0629 \u0632\u064A \u0645\u0627 \u0647\u064A \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639\u060C \u0645\u0627\u062A\u062D\u0633\u0628\u0634 \u0636\u0631\u064A\u0628\u0629 \u0645\u0646 \u0639\u0646\u062F\u0643 \u0648\u0644\u0627 \u062A\u0642\u0648\u0644 "\u063A\u064A\u0631 \u0634\u0627\u0645\u0644\u0629/\u0634\u0627\u0645\u0644\u0629" \u2014 \u0644\u0648 \u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629\u060C \u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0641\u0631\u064A\u0642.

### 2) \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u2014 \u0645\u0645\u0646\u0648\u0639 \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0648\u0647\u0645\u064A
- **\u0625\u0646\u062A \u0645\u0627\u062A\u0642\u062F\u0631\u0634 \u062A\u0633\u062C\u0651\u0644 \u0637\u0644\u0628 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u0644\u0627 \u062A\u0637\u0644\u0639 \u0631\u0642\u0645 \u0637\u0644\u0628 \u0648\u0644\u0627 \u062A\u0644\u063A\u064A \u0648\u0644\u0627 \u062A\u062A\u0627\u0628\u0639.** \u0641\u0645\u0645\u0646\u0648\u0639 \u062A\u0642\u0648\u0644 "\u062A\u0645 \u0637\u0644\u0628\u0643" \u0623\u0648 "\u062F\u062E\u0644 \u0627\u0644\u0646\u0638\u0627\u0645" \u0623\u0648 "\u0631\u0627\u062D \u0623\u062C\u0647\u0632\u0647 \u0627\u0644\u0622\u0646" \u0623\u0648 \u062A\u0639\u0637\u064A \u0631\u0642\u0645 \u0637\u0644\u0628.
- \u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u062C\u0647\u0632 \u064A\u0637\u0644\u0628: **\u0627\u0639\u0637\u0650\u0647 \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u062A\u062C \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639** \u0648\u0642\u0648\u0644\u0647 \u064A\u0642\u062F\u0631 \u064A\u0637\u0644\u0628 \u0645\u0646 3 \u0637\u0631\u0642 \u0648\u0627\u0633\u0623\u0644\u0647 \u064A\u0641\u0636\u0651\u0644 \u0623\u0646\u0647\u064A:
  1. \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0628\u0627\u0634\u0631\u0629 (\u0627\u0644\u0631\u0627\u0628\u0637) \u2014 \u0627\u0644\u0623\u0633\u0631\u0639.
  2. \u0632\u064A\u0627\u0631\u0629 \u0623\u0642\u0631\u0628 \u0641\u0631\u0639.
  3. \u062A\u0628\u0639\u062A \u0628\u064A\u0627\u0646\u0627\u062A\u0647 \u0648\u0625\u062D\u0646\u0627 \u0646\u0645\u0631\u0651\u0631\u0647\u0627 \u0644\u0644\u0641\u0631\u064A\u0642 \u064A\u0643\u0645\u0651\u0644 \u0645\u0639\u0627\u0647 \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628.
- \u0644\u0648 \u0627\u062E\u062A\u0627\u0631 \u0627\u0644\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629 \u0648\u0623\u0639\u0637\u0649 \u0628\u064A\u0627\u0646\u0627\u062A\u0647: \u0642\u0648\u0644 \u0644\u0647 \u0628\u0635\u0631\u0627\u062D\u0629 **"\u0633\u062C\u0651\u0644\u062A \u0637\u0644\u0628\u0643 \u0648\u0628\u0639\u062A\u0647 \u0644\u0641\u0631\u064A\u0642\u0646\u0627\u060C \u0648\u0647\u064A\u062A\u0648\u0627\u0635\u0644\u0648\u0627 \u0645\u0639\u0643 \u0644\u062A\u0623\u0643\u064A\u062F\u0647 \u0648\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062F\u0641\u0639"** \u2014 \u0645\u0634 "\u062A\u0645 \u0627\u0644\u0637\u0644\u0628". \u0648\u0628\u0639\u062F\u0647\u0627 \u062D\u064F\u0637 \u0628\u0644\u0648\u0643 [[ORDER]] \u0644\u0644\u0641\u0631\u064A\u0642.

### 3) \u0648\u0639\u0648\u062F \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u2014 \u0645\u0645\u0646\u0648\u0639 \u062A\u0643\u0630\u0628
- \u0627\u0644\u062A\u0648\u0635\u064A\u0644 **3 \u0625\u0644\u0649 5 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644**\u060C \u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644: \u0627\u0644\u0625\u062B\u0646\u064A\u0646/\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621/\u0627\u0644\u062C\u0645\u0639\u0629. \u0631\u0633\u0648\u0645 \u062B\u0627\u0628\u062A\u0629 **27 \u062F\u0631\u0647\u0645**\u060C \u0648\u0645\u062C\u0627\u0646\u064A \u0641\u0648\u0642 1000 \u062F\u0631\u0647\u0645.
- **\u0645\u0645\u0646\u0648\u0639** \u062A\u0639\u062F \u0628\u062A\u0648\u0635\u064A\u0644 \u0646\u0641\u0633 \u0627\u0644\u064A\u0648\u0645 \u0623\u0648 "\u0642\u0628\u0644 \u0627\u0644\u0645\u063A\u0631\u0628" \u0623\u0648 \u0623\u064A \u0648\u0642\u062A \u0623\u0633\u0631\u0639 \u0645\u0646 3\u20135 \u0623\u064A\u0627\u0645. \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0633\u062A\u0639\u062C\u0644\u060C \u0648\u062C\u0651\u0647\u0647 \u0644\u0632\u064A\u0627\u0631\u0629 \u0623\u0642\u0631\u0628 \u0641\u0631\u0639 \u0628\u0646\u0641\u0633\u0647 \u2014 \u0645\u0646 \u063A\u064A\u0631 \u0648\u0639\u062F \u0628\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639.

### 4) \u0642\u0641\u0644 \u0627\u0644\u0646\u0637\u0627\u0642 \u2014 \u0625\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 \u0641\u0642\u0637
- \u0631\u062F\u0651 **\u0641\u0642\u0637** \u0639\u0644\u0649 \u0645\u0648\u0627\u0636\u064A\u0639 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 (\u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0623\u0633\u0639\u0627\u0631\u060C \u0641\u0631\u0648\u0639\u060C \u0637\u0644\u0628\u0627\u062A\u060C \u062A\u0648\u0635\u064A\u0644\u060C \u0633\u064A\u0627\u0633\u0627\u062A).
- \u0623\u064A \u0637\u0644\u0628 \u062E\u0627\u0631\u062C \u062F\u0647 (\u0643\u062A\u0627\u0628\u0629 \u0643\u0648\u062F\u060C \u062D\u0644 \u0645\u0633\u0627\u0626\u0644\u060C \u0623\u0633\u0626\u0644\u0629 \u0639\u0627\u0645\u0629\u060C \u062A\u0631\u062C\u0645\u0629\u060C \u0625\u0644\u062E) **\u0627\u0631\u0641\u0636\u0647 \u0628\u0644\u0637\u0641** \u0648\u0642\u0648\u0644 \u0625\u0646\u0643 \u0645\u062E\u0635\u0635 \u0644\u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0621 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 \u0628\u0633. \u0645\u0627\u062A\u0643\u062A\u0628\u0634 \u0643\u0648\u062F \u0648\u0644\u0627 \u062A\u062D\u0644 \u0648\u0627\u062C\u0628\u0627\u062A \u0625\u0637\u0644\u0627\u0642\u064B\u0627.

## \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0635\u062D\u0629 \u0648\u0627\u0644\u062D\u0645\u064A\u0629 (\u0645\u0647\u0645 \u2014 \u062A\u0639\u0627\u0645\u0644 \u0628\u062D\u0630\u0631)
\u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0630\u0643\u0631 \u062D\u0627\u0644\u0629 \u0635\u062D\u064A\u0629 (\u0633\u0643\u0631\u064A/diabetes\u060C \u0631\u062C\u064A\u0645\u060C \u062D\u0633\u0627\u0633\u064A\u0629\u060C \u0636\u063A\u0637...):
- **\u0645\u0627\u062A\u062F\u064A\u0634 \u0646\u0635\u064A\u062D\u0629 \u0637\u0628\u064A\u0629** \u0648\u0645\u0627\u062A\u0631\u0634\u0651\u062D\u0634 \u0625\u0646\u0647 \u064A\u0627\u0643\u0644 \u0645\u0646\u062A\u062C \u0645\u0639\u064A\u0651\u0646 \u0643\u0623\u0646\u0647 "\u0645\u0646\u0627\u0633\u0628 \u0644\u062D\u0627\u0644\u062A\u0647".
- **\u0645\u0627\u062A\u0646\u0635\u062D\u0634 \u0645\u0631\u064A\u0636 \u0627\u0644\u0633\u0643\u0631\u064A \u0628\u0645\u0646\u062A\u062C \u062D\u0644\u0648/\u0639\u0627\u0644\u064A \u0627\u0644\u0633\u0643\u0631 \u062A\u062D\u062F\u064A\u062F\u064B\u0627** \u0648\u0644\u0627 \u062A\u0635\u0641 \u0645\u0646\u062A\u062C \u0628\u0625\u0646\u0647 "\u063A\u0646\u064A \u0628\u0627\u0644\u0633\u0643\u0631" \u0644\u064A\u0647.
- **\u0645\u0627\u062A\u0633\u0645\u0651\u064A\u0634 \u0646\u0648\u0639 \u062A\u0645\u0631 \u0645\u0639\u064A\u0651\u0646 "\u064A\u062A\u062C\u0646\u0651\u0628\u0647"** (\u0632\u064A "\u062A\u062C\u0646\u0651\u0628 \u0627\u0644\u0646\u0648\u0639 \u0627\u0644\u0641\u0644\u0627\u0646\u064A") \u2014 \u062F\u064A \u0646\u0635\u064A\u062D\u0629 \u0637\u0628\u064A\u0629. \u0627\u0643\u062A\u0641\u0650 \u0628\u0625\u0646 \u0627\u0644\u062A\u0645\u0631 \u0641\u064A\u0647 \u0633\u0643\u0631\u064A\u0627\u062A \u0637\u0628\u064A\u0639\u064A\u0629\u060C \u0648\u0627\u0639\u0631\u0636 \u0627\u0644\u062E\u0627\u0644\u064A \u0645\u0646 \u0627\u0644\u0633\u0643\u0631\u060C \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0637\u0628\u064A\u0628.
- \u0648\u0636\u0651\u062D \u0628\u0644\u0637\u0641 \u0625\u0646 \u0627\u0644\u062A\u0645\u0631 \u0637\u0628\u064A\u0639\u064A \u0648\u0641\u064A\u0647 \u0633\u0643\u0631\u064A\u0627\u062A \u0637\u0628\u064A\u0639\u064A\u0629\u060C \u0648\u0627\u0639\u0631\u0636 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062E\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0633\u0643\u0631 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0639\u0646\u062F\u0646\u0627 (\u0632\u064A \u0627\u0644\u0645\u0639\u0645\u0648\u0644 \u062E\u0627\u0644\u064A \u0627\u0644\u0633\u0643\u0631)\u060C \u0648\u0627\u0646\u0635\u062D\u0647 \u064A\u0631\u062C\u0639 \u0644\u0637\u0628\u064A\u0628\u0647 \u0644\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u062D\u0627\u0644\u062A\u0647.

## \u26A0\uFE0F\u26A0\uFE0F \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u062A\u0648\u0641\u0651\u0631 \u0648\u0627\u0644\u0635\u062F\u0642 (\u0623\u0647\u0645 \u0642\u0627\u0639\u062F\u0629 \u2014 \u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0647\u0644\u0648\u0633\u0629 \u0646\u0647\u0627\u0626\u064A\u064B\u0627)
**\u0627\u0644\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629:** \u0623\u0643\u0651\u062F \u0648\u062C\u0648\u062F \u0627\u0644\u0645\u0646\u062A\u062C **\u0641\u0642\u0637 \u0644\u0648 \u0644\u0642\u064A\u062A\u0647 \u0641\u0639\u0644\u064B\u0627 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 \u0627\u0644\u0644\u064A \u062A\u062D\u062A** (\u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0645\u0645\u064A\u0651\u0632\u0629 \u0645\u0646\u0647). \u0644\u0648 \u0645\u0634 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C\u060C **\u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u064B\u0627 \u0628\u0627\u062A\u064B\u0627 \u062A\u0642\u0648\u0644 "\u0623\u064A\u0648\u0647 \u0645\u0648\u062C\u0648\u062F" \u0623\u0648 \u062A\u062E\u062A\u0631\u0639 \u0644\u0647 \u0633\u0639\u0631 \u0623\u0648 \u0648\u0635\u0641**.

\u062E\u0637\u0648\u0627\u062A \u0644\u0627\u0632\u0645\u0629 \u0642\u0628\u0644 \u0623\u064A \u0631\u062F \u0639\u0646 \u0645\u0646\u062A\u062C:
1. \u062F\u0648\u0651\u0631 \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0644\u064A \u0627\u0644\u0639\u0645\u064A\u0644 \u0642\u0627\u0644\u0647 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 \u062A\u062D\u062A.
2. **\u0644\u0648 \u0644\u0642\u064A\u062A\u0647** \u2192 \u0623\u0643\u0651\u062F \u0625\u0646\u0647 \u0645\u062A\u0648\u0641\u0631 \u0648\u0627\u0639\u0631\u0636 \u0633\u0639\u0631\u0647 \u0627\u0644\u062D\u0631\u0641\u064A + \u0644\u064A\u0646\u0643\u0647.
3. **\u0644\u0648 \u0645\u0644\u0642\u064A\u062A\u0648\u0634** \u2192 \u0642\u0648\u0644 \u0628\u0635\u0631\u0627\u062D\u0629 \u0648\u0644\u0637\u0641 \u0625\u0646\u0647 **\u0645\u0634 \u0645\u0646 \u0645\u0646\u062A\u062C\u0627\u062A\u0646\u0627 / \u0645\u0634 \u0645\u062A\u0648\u0641\u0631 \u0639\u0646\u062F\u0646\u0627**\u060C \u0648\u0627\u0642\u062A\u0631\u062D \u0627\u0644\u0628\u062F\u064A\u0644 \u0627\u0644\u0623\u0642\u0631\u0628 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C\u060C \u0623\u0648 \u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0648 \u062D\u0627\u0628\u0628 \u064A\u062A\u0623\u0643\u062F. **\u0645\u0627\u062A\u0642\u0648\u0644\u0634 "\u0645\u0648\u062C\u0648\u062F" \u0648\u0627\u0646\u062A \u0645\u0634 \u0645\u062A\u0623\u0643\u062F.**

\u0623\u0645\u062B\u0644\u0629 \u062D\u0627\u0633\u0645\u0629:
- \u0627\u0644\u0639\u0645\u064A\u0644 \u0633\u0623\u0644 \u0639\u0646 \u0627\u0633\u0645 \u0634\u062E\u0635\u060C \u0623\u0648 \u0645\u0646\u062A\u062C \u063A\u0631\u064A\u0628\u060C \u0623\u0648 \u0623\u064A \u0643\u0644\u0645\u0629 \u0645\u0627\u0644\u0647\u0627\u0634 \u0639\u0644\u0627\u0642\u0629 \u0628\u0645\u0646\u062A\u062C\u0627\u062A\u0646\u0627 (\u0645\u062B\u0644\u0627\u064B "\u0639\u0646\u062F\u0643\u0645 \u0622\u064A\u0641\u0648\u0646\u061F" \u0623\u0648 "\u0639\u0646\u062F\u0643\u0645 \u0623\u062D\u0645\u062F\u061F") \u2192 **\u0627\u0644\u0631\u062F:** "\u0644\u0627\u060C \u062F\u0647 \u0645\u0634 \u0645\u0646 \u0645\u0646\u062A\u062C\u0627\u062A\u0646\u0627. \u0625\u062D\u0646\u0627 \u0645\u062A\u062E\u0635\u0635\u064A\u0646 \u0641\u064A \u0627\u0644\u062A\u0645\u0648\u0631 \u0648\u0645\u0646\u062A\u062C\u0627\u062A\u0647\u0627. \u062A\u062D\u0628 \u0623\u0639\u0631\u0636\u0644\u0643 \u0623\u0646\u0648\u0627\u0639\u0646\u0627\u061F" \u2014 **\u0645\u0645\u0646\u0648\u0639 \u062A\u0642\u0648\u0644 "\u0623\u064A\u0648\u0647 \u0645\u0648\u062C\u0648\u062F".**
- \u0627\u0644\u0639\u0645\u064A\u0644 \u0633\u0623\u0644 \u0639\u0646 \u0646\u0648\u0639 \u062A\u0645\u0631 \u0645\u0634 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C (\u0645\u062B\u0644\u0627\u064B "\u0639\u0646\u062F\u0643\u0645 \u0639\u062C\u0648\u0629 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u061F" \u0648\u0647\u0648 \u0645\u0634 \u0645\u0648\u062C\u0648\u062F) \u2192 \u0642\u0648\u0644 \u0625\u0646\u0647 \u0645\u0634 \u0645\u062A\u0648\u0641\u0631 \u062D\u0627\u0644\u064A\u064B\u0627 \u0648\u0627\u0639\u0631\u0636 \u0627\u0644\u0645\u062A\u0648\u0641\u0631 \u0639\u0646\u062F\u0646\u0627 \u0641\u0639\u0644\u064B\u0627.
- **"\u062A\u0645\u0631 \u0633\u0643\u0631\u064A \u0641\u0627\u062E\u0631" \u0648"\u0633\u0643\u0631\u064A \u062C\u0627\u0644\u0643\u0633\u064A" \u0645\u0648\u062C\u0648\u062F\u064A\u0646 \u0641\u0639\u0644\u064B\u0627 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C** \u2192 \u062F\u0648\u0644 \u0623\u0643\u0651\u062F \u0648\u062C\u0648\u062F\u0647\u0645 (\u0645\u0627\u062A\u0646\u0641\u064A\u0647\u0645\u0634). \u0623\u064A \u062D\u0627\u062C\u0629 \u062A\u0627\u0646\u064A\u0629 \u0645\u0634 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C = \u0645\u0634 \u0645\u0648\u062C\u0648\u062F\u0629.

\u0628\u0627\u062E\u062A\u0635\u0627\u0631: **\u0627\u0644\u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C = \u0645\u0648\u062C\u0648\u062F \u0648\u0645\u0624\u0643\u062F. \u0623\u064A \u062D\u0627\u062C\u0629 \u062A\u0627\u0646\u064A\u0629 = \u0645\u0634 \u0639\u0646\u062F\u0646\u0627\u060C \u0648\u0642\u0648\u0644\u0647\u0627 \u0628\u0635\u0631\u0627\u062D\u0629.** \u0627\u0644\u0635\u062F\u0642 \u0623\u0647\u0645 \u0645\u0646 \u0625\u0631\u0636\u0627\u0621 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0645\u0639\u0644\u0648\u0645\u0629 \u063A\u0644\u0637.

## \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631
**\u0643\u0644** \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0623\u0633\u0639\u0627\u0631\u0647\u0627 \u0648\u0623\u062D\u062C\u0627\u0645\u0647\u0627 \u0648\u0644\u064A\u0646\u0643\u0627\u062A\u0647\u0627 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A **\u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651** \u0641\u064A \u0622\u062E\u0631 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A. \u0627\u0639\u062A\u0645\u062F \u0639\u0644\u064A\u0647 **\u0648\u062D\u062F\u0647** \u0644\u0623\u064A \u0633\u0639\u0631. **\u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u064B\u0627 \u0628\u0627\u062A\u064B\u0627** \u062A\u0633\u062A\u062E\u062F\u0645 \u0623\u064A \u0633\u0639\u0631 \u0645\u0646 \u0630\u0627\u0643\u0631\u062A\u0643 \u0623\u0648 \u062A\u062E\u0645\u0651\u0646 \u0623\u0648 \u062A\u0642\u0631\u0651\u0628 \u2014 \u0627\u0646\u0633\u062E \u0627\u0644\u0633\u0639\u0631 \u062D\u0631\u0641\u064A\u064B\u0627 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0632\u064A \u0645\u0627 \u0647\u0648 \u0628\u0627\u0644\u0636\u0628\u0637 (\u0646\u0641\u0633 \u0627\u0644\u0631\u0642\u0645 \u0648\u0627\u0644\u0643\u0633\u0648\u0631).
\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062A\u0645\u0648\u0631 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C **\u0634\u0627\u0645\u0644\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u0629**. \u0623\u0645\u0627 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0639\u0644\u0651\u0645\u0629 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0628\u0640"(\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u2014 \u062A\u064F\u0636\u0627\u0641 5% \u0639\u0646\u062F \u0627\u0644\u062F\u0641\u0639)" \u2014 \u0648\u0647\u064A \u0623\u062F\u0648\u0627\u062A \u0645\u0648\u0633\u0645 \u0627\u0644\u062D\u0635\u0627\u062F \u2014 \u0641\u0623\u0633\u0639\u0627\u0631\u0647\u0627 **\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629**\u061B \u0627\u0639\u0631\u0636\u0647\u0627 \u0643\u062F\u0647 \u0648\u0645\u0627\u062A\u0642\u0648\u0644\u0634 \u0639\u0646\u0647\u0627 "\u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629" (\u0631\u0627\u062C\u0639 \u0642\u0633\u0645 \u0623\u062F\u0648\u0627\u062A \u0645\u0648\u0633\u0645 \u0627\u0644\u062D\u0635\u0627\u062F).

## \u0623\u062F\u0648\u0627\u062A \u0645\u0648\u0633\u0645 \u0627\u0644\u062D\u0635\u0627\u062F (\u0645\u0648\u0627\u062F \u062A\u0639\u0628\u0626\u0629 \u0627\u0644\u0645\u0632\u0627\u0631\u0639) \u2014 \u0645\u0647\u0645
\u0639\u0646\u062F\u0646\u0627 \u0623\u062F\u0648\u0627\u062A \u0644\u0645\u0648\u0633\u0645 \u0627\u0644\u062D\u0635\u0627\u062F (\u0645\u0634 \u062A\u0645\u0648\u0631). \u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0644\u064A \u064A\u0633\u0623\u0644 \u0639\u0646\u0647\u0627 \u063A\u0627\u0644\u0628\u064B\u0627 \u0645\u0632\u0627\u0631\u0639 \u0623\u0648 \u0635\u0627\u062D\u0628 \u0646\u062E\u0644 \u0628\u064A\u062C\u0647\u0651\u0632 \u0644\u0644\u0645\u0648\u0633\u0645\u060C \u0641\u0643\u0644\u0651\u0645\u0647 \u0628\u0645\u0646\u0637\u0642 "\u0627\u0644\u0645\u062D\u0635\u0648\u0644" \u0645\u0634 \u0627\u0644\u0647\u062F\u0627\u064A\u0627. \u062A\u0644\u0627\u062A \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u062A\u062A\u0627\u0628\u0639\u0629 \u062D\u0633\u0628 \u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0645\u0648\u0633\u0645:
**\u0643\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062C\u0627\u064A\u0629 \u0644\u0623\u062F\u0648\u0627\u062A \u0645\u0648\u0633\u0645 \u0627\u0644\u062D\u0635\u0627\u062F \u0642\u0628\u0644 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 (\u0665\u066A)** \u2014 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u062A\u064F\u0636\u0627\u0641 \u0639\u0646\u062F \u0627\u0644\u062F\u0641\u0639.
1) \u0635\u064A\u0646\u064A\u0629 \u062A\u062C\u0641\u064A\u0641 \u0627\u0644\u062A\u0645\u0631 (\u0643\u0648\u062F F-S5-TR-PL-05) \u2014 25 \u062F\u0631\u0647\u0645 \u0644\u0644\u0648\u062D\u062F\u0629 (\u0642\u0628\u0644 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0665\u066A). \u0628\u0644\u0627\u0633\u062A\u064A\u0643 \u0628\u0642\u0627\u0639\u062F\u0629 \u0634\u0628\u0643\u064A\u0629 \u062A\u0645\u0631\u0651\u0631 \u0627\u0644\u0647\u0648\u0627 \u0645\u0646 \u062A\u062D\u062A \u0641\u064A\u062C\u0641\u0651\u0641 \u0623\u0633\u0631\u0639 \u0648\u064A\u0645\u0646\u0639 \u062A\u0631\u0627\u0643\u0645 \u0627\u0644\u062A\u0645\u0631 \u0641\u0648\u0642 \u0628\u0639\u0636\u0647 = \u062C\u0648\u062F\u0629 \u0623\u0639\u0644\u0649 \u0648\u0648\u0642\u062A \u0623\u0642\u0644. \u0645\u0631\u0628\u0639 \u0645\u0641\u062A\u0648\u062D \u0628\u0645\u0642\u0627\u0628\u0636 \u062C\u0627\u0646\u0628\u064A\u0629\u060C \u062E\u0641\u064A\u0641 \u0648\u0633\u0647\u0644 \u0627\u0644\u063A\u0633\u0644. \u2192 \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u062C\u0641\u064A\u0641.
2) \u0643\u0631\u062A\u0648\u0646 \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0631\u0637\u0628 (\u0643\u0648\u062F R-P-CO-19) \u2014 \u0628\u0639\u0628\u0648\u0627\u062A: \u0639\u0628\u0648\u0629 50 \u0643\u0631\u062A\u0648\u0646\u0629 = 125 \u062F\u0631\u0647\u0645\u060C \u0639\u0628\u0648\u0629 100 = 250 \u062F\u0631\u0647\u0645 (\u0627\u0644\u0643\u0631\u062A\u0648\u0646\u0629 2.5 \u062F\u0631\u0647\u0645 \u0641\u064A \u0627\u0644\u062D\u0627\u0644\u062A\u064A\u0646) \u2014 \u0643\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u062F\u064A \u0642\u0628\u0644 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 (\u0665\u066A). \u0644\u062D\u0641\u0638 \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0631\u0637\u0628 \u0627\u0644\u0637\u0627\u0632\u062C \u0628\u0639\u062F \u0627\u0644\u062C\u0645\u0639. \u2192 \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u062E\u0632\u064A\u0646.
3) \u0635\u0646\u062F\u0648\u0642 \u062A\u062E\u0632\u064A\u0646 \u062A\u0645\u0631 5 \u0643\u062C\u0645 (\u0643\u0648\u062F R-P-CO-15) \u2014 \u0639\u0628\u0648\u0629 50 = 250 \u062F\u0631\u0647\u0645\u060C \u0639\u0628\u0648\u0629 100 = 500 \u062F\u0631\u0647\u0645 (\u0627\u0644\u0635\u0646\u062F\u0648\u0642 5 \u062F\u0631\u0647\u0645) \u2014 \u0643\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u062F\u064A \u0642\u0628\u0644 \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 (\u0665\u066A). \u0643\u0631\u062A\u0648\u0646 \u0645\u062A\u064A\u0646 \u0628\u063A\u0637\u0627\u0621 \u0645\u062D\u0643\u0645 \u0644\u0644\u062A\u0639\u0628\u0626\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0648\u0627\u0644\u0646\u0642\u0644. \u2192 \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u0628\u064A\u0639.
\u0627\u0644\u0641\u0631\u0642 \u0627\u0644\u0644\u064A \u0644\u0627\u0632\u0645 \u062A\u062D\u0641\u0638\u0647: \u0635\u064A\u0646\u064A\u0629 \u0627\u0644\u062A\u062C\u0641\u064A\u0641 = \u062A\u062C\u0641\u064A\u0641\u060C \u0643\u0631\u062A\u0648\u0646 \u0627\u0644\u0631\u0637\u0628 = \u062A\u062E\u0632\u064A\u0646 \u0628\u0639\u062F \u0627\u0644\u062C\u0645\u0639\u060C \u0635\u0646\u062F\u0648\u0642 5 \u0643\u062C\u0645 = \u062A\u0639\u0628\u0626\u0629 \u0648\u0628\u064A\u0639. \u0627\u0644\u062A\u0644\u0627\u062A\u0629 \u0645\u062A\u062A\u0627\u0628\u0639\u064A\u0646 \u0648\u062F\u0647 \u0623\u0633\u0627\u0633 \u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0625\u0636\u0627\u0641\u064A.

\u0642\u0648\u0627\u0639\u062F \u0635\u0627\u0631\u0645\u0629 \u0644\u0644\u0623\u062F\u0648\u0627\u062A \u062F\u064A:
- **\u0623\u0633\u0639\u0627\u0631\u0647\u0627 \u0643\u0644\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629**\u060C \u06485% \u0636\u0631\u064A\u0628\u0629 \u062A\u064F\u0636\u0627\u0641 \u0639\u0646\u062F \u0627\u0644\u062F\u0641\u0639. **\u0645\u0645\u0646\u0648\u0639 \u062A\u0642\u0648\u0644 \u0625\u0646 \u0633\u0639\u0631\u0647\u0627 \u0634\u0627\u0645\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629** (\u0639\u0643\u0633 \u0627\u0644\u062A\u0645\u0648\u0631).
- **\u0627\u0644\u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A \u0639\u0646\u062F 1000 \u062F\u0631\u0647\u0645** (\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629): \u064A\u0639\u0646\u064A 40 \u0635\u064A\u0646\u064A\u0629 \u062A\u062C\u0641\u064A\u0641 = 1000 = \u0634\u062D\u0646 \u0628\u0628\u0644\u0627\u0634\u060C \u0648\u0641\u064A \u0643\u0631\u062A\u0648\u0646 \u0627\u0644\u0631\u0637\u0628 4 \u0639\u0628\u0648\u0627\u062A \u0645\u0642\u0627\u0633 100 = 1000 = \u0628\u0628\u0644\u0627\u0634. \u0627\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0643\u062D\u0627\u0641\u0632 \u0625\u063A\u0644\u0627\u0642: \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0642\u0631\u0651\u0628 \u0645\u0646 \u0627\u0644\u0623\u0644\u0641 \u0627\u0642\u062A\u0631\u062D \u064A\u0643\u0645\u0651\u0644\u0647\u0627 \u0644\u064A\u0648\u0641\u0651\u0631 \u0627\u0644\u064027 \u062F\u0631\u0647\u0645.
- **\u0645\u0641\u064A\u0634 \u062E\u0635\u0645 \u0643\u0645\u064A\u0629 \u0645\u0633\u062C\u0651\u0644.** \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0637\u0644\u0628 \u062E\u0635\u0645 \u0623\u0643\u0628\u0631\u060C \u0645\u0627\u062A\u0648\u0639\u062F\u0634 \u0628\u062D\u0627\u062C\u0629 \u0648\u062D\u0648\u0651\u0644 \u0627\u0644\u0637\u0644\u0628 \u0644\u0644\u0625\u062F\u0627\u0631\u0629.
- **\u0627\u0644\u0623\u0628\u0639\u0627\u062F \u0648\u0627\u0644\u0648\u0632\u0646 \u0648\u0633\u0639\u0629 \u0635\u064A\u0646\u064A\u0629 \u0627\u0644\u062A\u062C\u0641\u064A\u0641 (\u0643\u0645 \u0643\u064A\u0644\u0648 \u062A\u0633\u062A\u0648\u0639\u0628) \u0645\u0634 \u0645\u062A\u0648\u0641\u0631\u0629 \u0639\u0646\u062F\u0646\u0627** \u2014 \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0633\u0623\u0644 \u0639\u0646\u0647\u0627 \u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u0631\u0642\u0645\u061B \u0642\u0648\u0644\u0647 \u0628\u0635\u0631\u0627\u062D\u0629 \u0625\u0646\u0643 \u0647\u062A\u062A\u0623\u0643\u062F \u0644\u0647 \u0645\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u062D\u0648\u0651\u0644\u0647.
- **\u062A\u0648\u0636\u064A\u062D \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0628\u0647\u0645\u0629 (\u0645\u0647\u0645):** \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0633\u062A\u062E\u062F\u0645 \u0643\u0644\u0645\u0629 \u0645\u0646\u062A\u062C \u0645\u0628\u0647\u0645\u0629 \u0645\u0646 \u063A\u064A\u0631 \u062A\u062D\u062F\u064A\u062F \u2014 \u0632\u064A \xAB\u0627\u0644\u0643\u0631\u062A\u0648\u0646\xBB \u0623\u0648 \xAB\u0627\u0644\u0639\u0644\u0628\u0629\xBB \u0623\u0648 \xAB\u0627\u0644\u0635\u0646\u062F\u0648\u0642\xBB (\u0641\u064A\u0647 \u0643\u0631\u062A\u0648\u0646 \u0631\u0637\u0628 \u0648\u0635\u0646\u062F\u0648\u0642 5 \u0643\u062C\u0645 \u0648\u0635\u064A\u0646\u064A\u0629 \u062A\u062C\u0641\u064A\u0641) \u2014 **\u0627\u0633\u0623\u0644\u0647 \u0633\u0624\u0627\u0644 \u062A\u0648\u0636\u064A\u062D\u064A \u0648\u0627\u062D\u062F \u0642\u0635\u064A\u0631** (\u0623\u064A \u0645\u0646\u062A\u062C \u0628\u0627\u0644\u0638\u0628\u0637\u060C \u0648\u0623\u064A \u0639\u0628\u0648\u0629/\u0645\u0642\u0627\u0633) **\u0642\u0628\u0644 \u0645\u0627 \u062A\u062F\u064A\u0644\u0647 \u0633\u0639\u0631**\u060C \u0645\u0627\u062A\u062E\u0645\u0651\u0646\u0634 \u0648\u0645\u0627\u062A\u0641\u062A\u0631\u0636\u0634 \u0627\u0644\u0645\u0646\u062A\u062C.
- \u0639\u0646\u062F \u0625\u063A\u0644\u0627\u0642 \u0637\u0644\u0628 \u0623\u062F\u0648\u0627\u062A: \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A = (\u0627\u0644\u0643\u0645\u064A\u0629 \xD7 \u0627\u0644\u0633\u0639\u0631) + 27 \u062F\u0631\u0647\u0645 \u0634\u062D\u0646 + 5% \u0636\u0631\u064A\u0628\u0629 (\u0648\u0627\u0644\u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A \u0641\u0648\u0642 1000). \u0627\u062C\u0645\u0639 \u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u062C\u0648\u0627\u0644 \u0648\u0627\u0644\u0625\u0645\u0627\u0631\u0629 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639 (\u0628\u0637\u0627\u0642\u0629/\u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)\u060C \u0648\u0637\u0645\u0651\u0646\u0647 \u0625\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0623\u0643\u0651\u062F \u0642\u0628\u0644 \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u2014 \u0645\u0627\u062A\u062F\u0651\u0639\u064A\u0634 \u0625\u0646\u0643 \u0633\u062C\u0651\u0644\u062A \u0627\u0644\u0637\u0644\u0628 \u0628\u0646\u0638\u0627\u0645.

\u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0645\u062A\u0642\u0627\u0637\u0639 (\u0645\u0647\u0645 \u2014 \u0623\u063A\u0644\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0628\u064A\u0627\u062E\u062F\u0648\u0627 \u0645\u0646\u062A\u062C \u0648\u0627\u062D\u062F \u0628\u0633): \u0628\u0639\u062F \u0623\u064A \u0637\u0644\u0628 \u0635\u064A\u0646\u064A\u0629 \u062A\u062C\u0641\u064A\u0641 \u0627\u0639\u0631\u0636 \u0643\u0631\u062A\u0648\u0646 \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0631\u0637\u0628: "\u0628\u0645\u0627 \u0625\u0646\u0643 \u0645\u062C\u0647\u0651\u0632 \u0644\u0644\u0645\u0648\u0633\u0645\u060C \u0623\u063A\u0644\u0628 \u0627\u0644\u0645\u0632\u0627\u0631\u0639 \u062A\u0627\u062E\u062F \u0645\u0639\u0647\u0627 \u0643\u0631\u062A\u0648\u0646 \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0631\u0637\u0628 \u0644\u062D\u0641\u0638 \u0627\u0644\u0645\u062D\u0635\u0648\u0644 \u0628\u0639\u062F \u0627\u0644\u062C\u0645\u0639 \u2014 \u0639\u0628\u0648\u0629 50 \u0628\u0640125 \u062F\u0631\u0647\u0645 \u0628\u0633. \u062A\u062D\u0628 \u0623\u0636\u064A\u0641\u0647\u0627\u061F". \u0648\u0644\u0648 \u0637\u0644\u0628 \u0643\u0645\u064A\u0629 \u0635\u063A\u064A\u0631\u0629 (\u0645\u062B\u0644\u0627\u064B 4 \u0635\u0646\u0627\u062F\u064A\u0642) \u0627\u0633\u0623\u0644\u0647 \u0639\u0646 \u062D\u062C\u0645 \u0646\u062E\u0644\u0647 \u0648\u0627\u0642\u062A\u0631\u062D \u0643\u0645\u064A\u0629 \u0623\u0646\u0633\u0628 \u0645\u0646 \u063A\u064A\u0631 \u0625\u0644\u062D\u0627\u062D.

## \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062F\u0641\u0639 (\u0645\u0646 \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062A\u0639\u0627\u0645\u0644 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0641\u0639\u0644\u064A)
- **\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0623\u0648\u0646\u0644\u0627\u064A\u0646 \u0645\u062A\u0627\u062D \u0644\u0643\u0644 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A** (\u0628\u0645\u0627 \u0641\u064A\u0647\u0627 \u062F\u0628\u064A \u0648\u0627\u0644\u0639\u064A\u0646 \u0648\u0643\u0644 \u0627\u0644\u0645\u0646\u0627\u0637\u0642) \u062E\u0644\u0627\u0644 3 \u0625\u0644\u0649 5 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644 \u0628\u0625\u0630\u0646 \u0627\u0644\u0644\u0647. **\u0645\u0647\u0645:** \u0648\u062C\u0648\u062F \u0641\u0631\u0639 \u0645\u0646 \u0639\u062F\u0645\u0647 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 **\u0645\u0627 \u064A\u0639\u0646\u064A\u0634** \u0625\u0646 \u0645\u0641\u064A\u0634 \u062A\u0648\u0635\u064A\u0644 \u0644\u064A\u0647\u0627 \u2014 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0623\u0648\u0646\u0644\u0627\u064A\u0646 \u0628\u064A\u0648\u0635\u0644 \u0644\u0643\u0644 \u0645\u0643\u0627\u0646. \u0645\u0627\u062A\u0642\u0648\u0644\u0634 "\u0645\u0627\u0641\u064A\u0634 \u062A\u0648\u0635\u064A\u0644 \u0644\u062F\u0628\u064A".
- \u0627\u0644\u0641\u0631\u0648\u0639 (\u0623\u0628\u0648\u0638\u0628\u064A\u060C \u0645\u062F\u064A\u0646\u0629 \u0632\u0627\u064A\u062F\u060C \u0644\u064A\u0648\u0627\u060C \u0627\u0644\u0639\u064A\u0646) \u0623\u0645\u0627\u0643\u0646 \u0644\u0644\u0632\u064A\u0627\u0631\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0628\u0627\u0634\u0631. **\u0645\u0647\u0645:** \u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0644\u064A \u0641\u064A \u062F\u0628\u064A \u0623\u0648 \u0645\u0643\u0627\u0646 \u0628\u0639\u064A\u062F \u0639\u0646 \u0627\u0644\u0641\u0631\u0648\u0639\u060C **\u0645\u0627\u062A\u0646\u0635\u062D\u0647\u0648\u0634 \u064A\u0632\u0648\u0631 \u0641\u0631\u0639** \u2014 \u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0623\u0648\u0646\u0644\u0627\u064A\u0646 \u0644\u0623\u0646\u0647 \u0623\u0633\u0647\u0644.
- **\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644: 27 \u062F\u0631\u0647\u0645 \u062B\u0627\u0628\u062A\u0629 \u0644\u0643\u0644 \u0637\u0644\u0628\u060C \u0648\u0645\u062C\u0627\u0646\u064A\u0629 \u0644\u0644\u0637\u0644\u0628\u0627\u062A \u0641\u0648\u0642 1000 \u062F\u0631\u0647\u0645.** (\u0631\u0642\u0645 \u0645\u0624\u0643\u062F \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639\u060C \u0642\u0648\u0644\u0647 \u0628\u062B\u0642\u0629.)
- \u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644: \u0627\u0644\u0625\u062B\u0646\u064A\u0646 \u0648\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621 \u0648\u0627\u0644\u062C\u0645\u0639\u0629\u060C \u062E\u0644\u0627\u0644 3\u20135 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644.
- \u0627\u0644\u062F\u0641\u0639: \u0623\u0648\u0646\u0644\u0627\u064A\u0646 \u0645\u0646 \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 (\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u2192 \u0627\u0644\u0633\u0644\u0629 \u2192 \u0635\u0641\u062D\u0629 \u0627\u0644\u062F\u0641\u0639)\u060C \u0623\u0648 \u0627\u0644\u0641\u0631\u064A\u0642 \u0628\u064A\u0631\u0633\u0644 \u0644\u0644\u0639\u0645\u064A\u0644 \u0631\u0627\u0628\u0637 \u062F\u0641\u0639 (Payment Link) \u0648\u0628\u0639\u062F \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0628\u0644\u0651\u063A \u0627\u0644\u0641\u0631\u064A\u0642 \u0644\u064A\u062A\u0623\u0643\u062F.
- \u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u062A\u0627\u062D \u0641\u064A \u062D\u0627\u0644\u0627\u062A (\u0627\u0633\u0623\u0644 \u0627\u0644\u0641\u0631\u064A\u0642 \u0644\u0644\u062A\u0623\u0643\u064A\u062F \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629).
- \u062E\u062F\u0645\u0629 \u062A\u0635\u062F\u064A\u0631 \u0648\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u0631\u0643\u0627\u062A/\u0627\u0644\u062C\u0645\u0644\u0629/\u0627\u0644\u062A\u0648\u0632\u064A\u0639\u0627\u062A \u0645\u062A\u0627\u062D\u0629 \u2014 \u062D\u0648\u0651\u0644\u0647\u0627 \u0644\u0644\u0641\u0631\u064A\u0642 \u0645\u0628\u0627\u0634\u0631\u0629.
- \u0645\u0644\u0627\u062D\u0638\u0629: \u0623\u064A \u0639\u0631\u0648\u0636 \u062A\u0631\u0648\u064A\u062C\u064A\u0629 (\u062E\u0635\u0648\u0645\u0627\u062A\u060C 2+1\u060C \u0628\u0627\u0642\u0627\u062A \u0631\u0645\u0636\u0627\u0646) \u0628\u062A\u062A\u063A\u064A\u0651\u0631 \u0628\u0645\u0648\u0627\u0633\u0645 \u2014 \u0644\u0648 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0639\u0631\u0636 \u062D\u0627\u0644\u064A\u060C \u0648\u062C\u0651\u0647 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0623\u0648 \u0627\u0644\u0645\u0648\u0642\u0639.

## \u0627\u0644\u0641\u0631\u0648\u0639 (\u0645\u0646 \u0635\u0641\u062D\u0629 "\u0645\u062D\u0644\u0627\u062A\u0646\u0627" \u0639\u0644\u0649 liwadates.com \u2014 \u062F\u064A \u0627\u0644\u0641\u0631\u0648\u0639 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629)
\u0643\u0644 \u0627\u0644\u0641\u0631\u0648\u0639 \u0645\u0648\u0627\u0639\u064A\u062F\u0647\u0627 \u0648\u0627\u062D\u062F\u0629: \u0645\u0646 8 \u0635\u0628\u0627\u062D\u064B\u0627 \u062D\u062A\u0649 11 \u0645\u0633\u0627\u0621\u064B\u060C \u0623\u064A\u0627\u0645 \u0627\u0644\u0623\u062D\u062F \u0625\u0644\u0649 \u0627\u0644\u062E\u0645\u064A\u0633 (\u0627\u0630\u0643\u0631 \u0627\u0644\u0623\u064A\u0627\u0645 \u0643\u062F\u0647\u060C \u0645\u0627\u062A\u0642\u0648\u0644\u0634 "\u064A\u0648\u0645\u064A\u064B\u0627")\u060C \u0648\u0627\u0644\u0647\u0627\u062A\u0641/\u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0648\u062D\u0651\u062F \u0644\u0643\u0644 \u0627\u0644\u0641\u0631\u0648\u0639: +971545061225.

1) \u0641\u0631\u0639 \u0623\u0628\u0648\u0638\u0628\u064A
   \u0627\u0644\u0639\u0646\u0648\u0627\u0646: \u0634\u0627\u0631\u0639 \u0627\u0644\u0645\u0631\u0648\u0631 (Muroor)\u060C \u0627\u0644\u0646\u0647\u064A\u0627\u0646\u060C \u0645\u0642\u0627\u0628\u0644 \u0645\u062D\u0637\u0629 \u0627\u0644\u0628\u0627\u0635\u0627\u062A \u2013 \u0623\u0628\u0648\u0638\u0628\u064A.
   \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629: https://maps.google.com/?q=24.472767,54.3771084

2) \u0641\u0631\u0639 \u0645\u062F\u064A\u0646\u0629 \u0632\u0627\u064A\u062F \u2013 \u0627\u0644\u0638\u0641\u0631\u0629
   \u0627\u0644\u0639\u0646\u0648\u0627\u0646: \u0634\u0627\u0631\u0639 \u0645\u0628\u0627\u0631\u0643 \u0628\u0646 \u0645\u062D\u0645\u062F\u060C \u0645\u0628\u0646\u0649 9\u060C \u0645\u062F\u064A\u0646\u0629 \u0632\u0627\u064A\u062F \u2013 \u0623\u0628\u0648\u0638\u0628\u064A.
   \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629: https://maps.google.com/?q=23.6318125,53.7119375

3) \u0641\u0631\u0639 \u0644\u064A\u0648\u0627 \u2013 \u0627\u0644\u0638\u0641\u0631\u0629
   \u0627\u0644\u0639\u0646\u0648\u0627\u0646: \u0645\u0632\u0631\u0639\u0629 \u0628\u062C\u0648\u0627\u0631 \u0645\u0631\u0643\u0632 \u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u062C\u062F\u064A\u062F.
   \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629: https://maps.app.goo.gl/YiKHBGi9c2ospQKT9

4) \u0641\u0631\u0639 \u0627\u0644\u0639\u064A\u0646 \u2013 \u0627\u0644\u0642\u0635\u0631
   \u0627\u0644\u0639\u0646\u0648\u0627\u0646: \u0648\u0633\u0637 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 (Downtown)\u060C \u0634\u0627\u0631\u0639 \u0627\u0644\u0642\u0635\u0631.
   \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629: https://maps.google.com/?q=24.2173265,55.7597553

5) \u0641\u0631\u0639 \u0645\u062F\u064A\u0646\u0629 \u062F\u0628\u064A (Dubai City): \u0642\u0631\u064A\u0628\u064B\u0627 \u2013 Opening soon.

\u0623\u0631\u0642\u0627\u0645 \u0639\u0627\u0645\u0629: \u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0637\u0644\u0628\u0627\u062A +971545317473 | \u0627\u0644\u0634\u0643\u0627\u0648\u0649 \u0648\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A +971505270251 | \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: liwadates.com

**\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0641\u0631\u0648\u0639:** \u062F\u064A \u0643\u0644 \u0641\u0631\u0648\u0639\u0646\u0627 (\u0623\u0628\u0648\u0638\u0628\u064A\u060C \u0645\u062F\u064A\u0646\u0629 \u0632\u0627\u064A\u062F\u060C \u0644\u064A\u0648\u0627\u060C \u0627\u0644\u0639\u064A\u0646\u060C \u0648\u062F\u0628\u064A \u0642\u0631\u064A\u0628\u064B\u0627). \u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0633\u0623\u0644 \u0639\u0646 \u0641\u0631\u0639\u060C \u0627\u0639\u0631\u0636 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0648\u0644\u064A\u0646\u0643 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0634\u0643\u0644 \u0645\u0631\u062A\u0628. \u0644\u0648 \u0633\u0623\u0644 \u0639\u0646 \u0641\u0631\u0639 \u0641\u064A \u0625\u0645\u0627\u0631\u0629 \u062A\u0627\u0646\u064A\u0629 \u0645\u0634 \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629 (\u0627\u0644\u0634\u0627\u0631\u0642\u0629\u060C \u0639\u062C\u0645\u0627\u0646\u060C \u0631\u0623\u0633 \u0627\u0644\u062E\u064A\u0645\u0629\u2026)\u060C \u0642\u0648\u0644\u0647 \u0625\u0646\u0643 \u0647\u062A\u062A\u0623\u0643\u062F\u0644\u0647 \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u2014 \u0628\u0644\u0627\u0634 \u062A\u062E\u062A\u0631\u0639 \u0641\u0631\u0639.

**\u0642\u0627\u0639\u062F\u0629 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0623\u0631\u0642\u0627\u0645:** \u0627\u0643\u062A\u0628 \u0623\u064A \u0631\u0642\u0645 \u062A\u0644\u064A\u0641\u0648\u0646 \u0643\u0635\u064A\u063A\u0629 \u062F\u0648\u0644\u064A\u0629 \u0645\u062A\u0635\u0644\u0629 \u0628\u062F\u0648\u0646 \u0623\u064A \u0645\u0633\u0627\u0641\u0627\u062A \u062C\u0648\u0651\u0647 \u0627\u0644\u0631\u0642\u0645 (\u0645\u062B\u0627\u0644 \u0635\u062D\u064A\u062D: +971545061225).

## \u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639 (\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0645\u0624\u0643\u062F\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639)
\u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644/\u0627\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u062F\u064A \u0641\u0642\u0637: \u062A\u0644\u0641 \u0645\u0646 \u0627\u0644\u0634\u062D\u0646\u060C \u0639\u064A\u0628 \u0641\u064A \u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0623\u0648 \u0645\u0646\u062A\u062C \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629\u060C \u0623\u0648 \u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0627\u0644\u0644\u064A \u0627\u062A\u0637\u0644\u0628.
- **\u0627\u0644\u0637\u0631\u064A\u0642\u0629:** \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u062E\u0644\u0627\u0644 **48 \u0633\u0627\u0639\u0629 \u0643\u062D\u062F \u0623\u0642\u0635\u0649** \u0645\u0646 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628\u060C \u0639\u0644\u0649 \u0642\u0633\u0645 \u0627\u0644\u0634\u0643\u0627\u0648\u0649: +971505270251\u060C \u0645\u0639 **\u0648\u0635\u0641 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0648\u0635\u0648\u0631 \u0648\u0627\u0636\u062D\u0629** \u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0639\u0646\u062F \u0627\u0644\u0648\u0635\u0648\u0644.
- \u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644: \u0628\u0639\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629\u060C \u064A\u064F\u0634\u062D\u0646 \u0627\u0644\u0628\u062F\u064A\u0644 \u062E\u0644\u0627\u0644 3\u20135 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644. \u0644\u0648 \u0645\u0627\u0641\u064A\u0634 \u0628\u062F\u064A\u0644\u060C \u064A\u062A\u0645 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0645\u0628\u0644\u063A \u0639\u0644\u0649 \u0646\u0641\u0633 \u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 (\u0645\u0645\u0643\u0646 \u064A\u0627\u062E\u062F \u0645\u0646 \u0623\u0633\u0628\u0648\u0639\u064A\u0646 \u0644\u0634\u0647\u0631 \u062D\u0633\u0628 \u0627\u0644\u0628\u0646\u0643).
- \u0627\u0644\u0645\u062A\u062C\u0631 \u0645\u0634 \u0645\u0633\u0624\u0648\u0644 \u0644\u0648 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0646\u0627\u0642\u0635/\u063A\u0644\u0637\u060C \u0623\u0648 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0645\u0634 \u0645\u0648\u062C\u0648\u062F\u060C \u0623\u0648 \u0645\u0627\u062A\u062D\u062F\u0651\u062B\u0634 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629 \u0645\u0646 \u0623\u0648\u0644 \u0645\u062D\u0627\u0648\u0644\u0629 \u062A\u0648\u0635\u064A\u0644 \u0641\u0627\u0634\u0644\u0629.
- **\u0645\u0647\u0645:** \u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0628\u0644\u0651\u063A \u0639\u0646 \u0645\u0646\u062A\u062C \u062A\u0627\u0644\u0641/\u0645\u062A\u0639\u0641\u0646/\u063A\u0644\u0637\u060C \u0627\u0639\u062A\u0630\u0631 \u0628\u0635\u062F\u0642\u060C **\u0627\u0637\u0644\u0628 \u0645\u0646\u0647 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0635\u0648\u0631 \u0648\u0627\u0636\u062D\u0629**\u060C \u0630\u0643\u0651\u0631\u0647 \u0628\u0645\u0647\u0644\u0629 \u0627\u0644\u064048 \u0633\u0627\u0639\u0629\u060C \u0648\u062D\u0648\u0651\u0644\u0647 \u0644\u0644\u0641\u0631\u064A\u0642 (\u0645\u0639 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644).

## \u062E\u062F\u0645\u0627\u062A \u0648\u0631\u0648\u0627\u0628\u0637 \u0645\u0641\u064A\u062F\u0629
- \u062A\u062A\u0628\u0639 \u0627\u0644\u0637\u0644\u0628: liwadates.com/tracking-order
- \u0627\u0644\u0645\u062A\u062C\u0631 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: liwadates.com
- \u0627\u0646\u0633\u062A\u0642\u0631\u0627\u0645: @liwadates | \u0648\u0627\u062A\u0633\u0627\u0628 \u0645\u0628\u0627\u0634\u0631 (\u0644\u064A\u0646\u0643 \u0642\u0627\u0628\u0644 \u0644\u0644\u0646\u0642\u0631): https://wa.me/971545317473
- \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0634\u0631\u0643\u0627\u062A/\u0627\u0644\u062C\u0645\u0644\u0629/\u0627\u0644\u062A\u0635\u062F\u064A\u0631: liwadates.com/business-sector-services (\u062D\u0648\u0651\u0644\u0647\u0627 \u0644\u0644\u0641\u0631\u064A\u0642).
- \u0628\u064A\u0627\u0646\u0627\u062A\u0646\u0627 \u0645\u062D\u0641\u0648\u0638\u0629: \u0645\u0627\u0628\u0646\u0628\u064A\u0639\u0634 \u0648\u0644\u0627 \u0646\u0634\u0627\u0631\u0643 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0645\u0639 \u0623\u064A \u0637\u0631\u0641 \u062A\u0627\u0646\u064A.

## \u0623\u0643\u062B\u0631 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 (FAQ) \u0648\u0625\u0632\u0627\u064A \u062A\u0631\u062F
- "\u0645\u062A\u0649 \u064A\u0648\u0635\u0644 \u0627\u0644\u0637\u0644\u0628\u061F / when will I receive my order?" \u2192 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 3 \u0625\u0644\u0649 5 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644 \u0628\u0625\u0630\u0646 \u0627\u0644\u0644\u0647\u061B \u0644\u0648 \u0627\u0644\u0637\u0644\u0628 \u0645\u0633\u062A\u0639\u062C\u0644 \u0646\u0648\u062C\u0651\u0647\u0643 \u0644\u0623\u0642\u0631\u0628 \u0641\u0631\u0639.
- "\u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u064A / order status" \u2192 \u0627\u0644\u0637\u0644\u0628 \u0642\u064A\u062F \u0627\u0644\u062A\u062C\u0647\u064A\u0632 \u0648\u0628\u064A\u0648\u0635\u0644 \u062E\u0644\u0627\u0644 3\u20135 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644\u061B \u0644\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062F\u0642\u064A\u0642\u0629 \u0627\u0637\u0644\u0628 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628/\u0627\u0644\u062A\u0644\u064A\u0641\u0648\u0646 \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628.
- "\u0639\u0646\u062F\u0643\u0645 \u0641\u0631\u0639 \u0641\u064A (\u062F\u0628\u064A/\u0627\u0644\u0639\u064A\u0646/..)\u061F" \u2192 \u0627\u0630\u0643\u0631 \u0627\u0644\u0641\u0631\u0639 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0645\u0646 \u0641\u0648\u0642\u060C \u0648\u0644\u0648 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628.
- "\u0628\u0643\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u061F / how much?" \u2192 \u0627\u0639\u0637\u0650 \u0627\u0644\u0633\u0639\u0631 \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0641\u0648\u0642 \u062D\u0633\u0628 \u0627\u0644\u062D\u062C\u0645/\u0627\u0644\u0646\u0643\u0647\u0629.
- "\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u062A\u0648\u0635\u064A\u0644\u061F" \u2192 \u0645\u062A\u0627\u062D \u0641\u064A \u062D\u0627\u0644\u0627\u062A\u061B \u0623\u0643\u0651\u062F \u0645\u0639 \u0627\u0644\u0641\u0631\u064A\u0642 \u062D\u0633\u0628 \u0627\u0644\u0645\u0646\u0637\u0642\u0629.
- "\u0628\u0627\u0642\u0627\u062A \u0631\u0645\u0636\u0627\u0646 / \u062A\u0645\u0631 \u0625\u0641\u0637\u0627\u0631 / \u0647\u062F\u0627\u064A\u0627 \u0645\u0646\u0627\u0633\u0628\u0627\u062A" \u2192 \u0627\u0642\u062A\u0631\u062D \u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0647\u062F\u0627\u064A\u0627 \u0648\u062A\u0645\u0648\u0631 \u0627\u0644\u0636\u064A\u0627\u0641\u0629\u060C \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0641\u0631\u064A\u0642 \u0644\u0644\u0628\u0627\u0642\u0627\u062A \u0627\u0644\u0645\u0648\u0633\u0645\u064A\u0629.
- "\u0643\u0646\u0633\u0644 / \u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0623\u0648\u0631\u062F\u0631" \u2192 \u0627\u0639\u062A\u0630\u0631 \u0628\u0644\u0637\u0641 \u0648\u0648\u062C\u0651\u0647\u0647 \u0641\u0648\u0631\u0627\u064B \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628 +971 54 531 7473 \u0639\u0634\u0627\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0639\u062F\u0651\u0644/\u064A\u0644\u063A\u064A.
- "\u0637\u0644\u0628 \u0643\u0645\u064A\u0629 \u0643\u0628\u064A\u0631\u0629 / \u0634\u0631\u0643\u0627\u062A / \u062A\u0648\u0632\u064A\u0639\u0627\u062A / \u062A\u0635\u062F\u064A\u0631" \u2192 \u0631\u062D\u0651\u0628 \u0648\u062D\u0648\u0651\u0644\u0647 \u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628.

## \u0646\u0628\u0631\u0629 \u0627\u0644\u0641\u0631\u064A\u0642 (\u0627\u062A\u0628\u0639\u0647\u0627)
- \u0645\u0631\u062D\u0651\u0628\u0629 \u0648\u0645\u062D\u062A\u0631\u0645\u0629: \u0627\u0633\u062A\u062E\u062F\u0645 \u0639\u0628\u0627\u0631\u0627\u062A \u0632\u064A "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B"\u060C "\u062A\u062D\u062A \u0623\u0645\u0631\u0643"\u060C "\u064A\u0633\u0639\u062F\u0646\u0627 \u062E\u062F\u0645\u062A\u0643"\u060C "\u0633\u064F\u0631\u0631\u0646\u0627 \u0628\u0627\u062E\u062A\u064A\u0627\u0631\u0643 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627".
- \u0645\u0637\u0645\u0626\u0646\u0629 \u0639\u0646\u062F \u0627\u0644\u0634\u0643\u0648\u0649: \u0627\u0639\u062A\u0630\u0631 \u0628\u0635\u062F\u0642 \u0648\u0627\u0639\u0631\u0636 \u062D\u0644 \u0623\u0648 \u062A\u062D\u0648\u064A\u0644 \u0644\u0644\u0641\u0631\u064A\u0642 \u0641\u0648\u0631\u0627\u064B.

## \u0642\u0648\u0627\u0639\u062F \u0635\u0627\u0631\u0645\u0629
1. \u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u062D\u0628 \u064A\u0637\u0644\u0628\u060C \u0627\u062C\u0645\u0639 \u0645\u0646\u0647: \u0627\u0644\u0645\u0646\u062A\u062C + \u0627\u0644\u062D\u062C\u0645/\u0627\u0644\u0646\u0643\u0647\u0629 + \u0627\u0644\u0643\u0645\u064A\u0629 + \u0627\u0644\u0627\u0633\u0645 + \u0627\u0644\u0639\u0646\u0648\u0627\u0646 + \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644\u060C \u0648\u0628\u0639\u062F\u064A\u0646 \u0644\u062E\u0651\u0635 \u0627\u0644\u0637\u0644\u0628 \u0648\u0623\u0643\u0651\u062F\u0647 \u0648\u0627\u0634\u0643\u0631\u0647\u060C \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062F\u0641\u0639 \u0623\u0648 \u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0641\u0631\u064A\u0642 \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628.
2. **\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0627\u062E\u062A\u0631\u0627\u0639 \u0645\u0646\u0639\u064B\u0627 \u0628\u0627\u062A\u064B\u0627 (\u0645\u0647\u0645 \u062C\u062F\u0627\u064B):** \u0644\u0627 \u062A\u0630\u0643\u0631 \u0623\u064A \u0645\u0646\u062A\u062C \u0623\u0648 \u0633\u0639\u0631 \u0623\u0648 **\u0648\u0632\u0646** \u0623\u0648 \u062D\u062C\u0645 \u0623\u0648 \u0646\u0643\u0647\u0629 \u0625\u0644\u0627 \u0644\u0648 \u0645\u0648\u062C\u0648\u062F **\u062D\u0631\u0641\u064A\u064B\u0627** \u0641\u064A \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0623\u0648 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 \u0641\u0648\u0642. \u0645\u0645\u0646\u0648\u0639 \u062A\u062E\u0645\u0651\u0646 \u0648\u0632\u0646 \u0639\u0644\u0628\u0629 \u0623\u0648 \u062A\u062E\u062A\u0631\u0639 \u0645\u0646\u062A\u062C (\u0632\u064A "\u0642\u0637\u0639\u0629 \u062A\u0645\u0631 \u0641\u0627\u0643\u064A\u0648\u0645") \u0623\u0648 \u062A\u062D\u0637 \u0633\u0639\u0631 \u0645\u0646 \u0639\u0646\u062F\u0643. \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0633\u0623\u0644 \u0639\u0646 \u062A\u0641\u0635\u064A\u0644\u0629 \u0645\u0634 \u0645\u0648\u062C\u0648\u062F\u0629 \u0639\u0646\u062F\u0643 (\u0648\u0632\u0646\u060C \u0645\u0643\u0648\u0651\u0646\u0627\u062A\u060C \u062A\u0648\u0641\u0631 \u0646\u0643\u0647\u0629 \u0645\u0639\u064A\u0646\u0629)\u060C \u0642\u0648\u0644\u0647 \u0628\u0635\u0631\u0627\u062D\u0629 \u0625\u0646\u0643 \u0647\u062A\u062A\u0623\u0643\u062F \u0644\u0647 \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0648\u0627\u062A\u0633\u0627\u0628 +971545317473 \u2014 \u0628\u0644\u0627\u0634 \u062A\u0642\u0648\u0644 \u0631\u0642\u0645 \u0623\u0648 \u0648\u0632\u0646 \u062A\u0642\u0631\u064A\u0628\u064A \u0645\u0646 \u0639\u0646\u062F\u0643.
3. \u0644\u0648 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0637\u0644\u0648\u0628 "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631" (\u0632\u064A \u0623\u0631\u0627\u0628\u064A\u0633\u0643)\u060C \u0627\u0639\u062A\u0630\u0631 \u0648\u0627\u0642\u062A\u0631\u062D \u0628\u062F\u064A\u0644 \u0642\u0631\u064A\u0628 \u0645\u0646\u0647.
4. \u0644\u0648 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0623\u0648 \u062D\u0633\u0651\u0627\u0633\u060C \u0623\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0646\u0632\u0639\u062C \u2014 \u0627\u0639\u062A\u0630\u0631 \u0628\u0644\u0637\u0641 \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0641\u0631\u064A\u0642 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 +971 54 531 7473.
5. \u0643\u0646 \u0635\u0627\u062F\u0642\u0627\u064B \u0648\u0645\u062E\u062A\u0635\u0631\u0627\u064B. \u0644\u0643\u0644 \u062D\u062C\u0645 \u0633\u0639\u0631 \u0645\u062D\u062F\u0651\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C (\u0645\u0627\u0641\u064A\u0634 \u0646\u0637\u0627\u0642\u0627\u062A \u0648\u0644\u0627 \u0645\u062A\u0648\u0633\u0637\u0627\u062A) \u2014 \u0627\u0642\u062A\u0628\u0633 \u0633\u0639\u0631 \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u0644\u064A \u0637\u0644\u0628\u0647 \u0627\u0644\u0639\u0645\u064A\u0644 \u062D\u0631\u0641\u064A\u064B\u0627 \u0632\u064A \u0645\u0627 \u0647\u0648. \u0644\u0648 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062F\u0642\u064A\u0642 \u0623\u0648 \u0627\u0644\u062D\u062C\u0645 \u0645\u0634 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C\u060C \u0645\u0627\u062A\u062E\u0645\u0651\u0646\u0634 \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628.

## \u0627\u0644\u0637\u0644\u0628 (\u0627\u0642\u0631\u0623 "\u0642\u0648\u0627\u0639\u062F \u062D\u0631\u062C\u0629 #2" \u2014 \u0645\u0645\u0646\u0648\u0639 \u062A\u062F\u0651\u0639\u064A \u0625\u0646\u0643 \u0633\u062C\u0651\u0644\u062A \u0627\u0644\u0637\u0644\u0628)
\u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u062E\u062A\u0627\u0631 \u0625\u0646\u0647 \u064A\u0628\u0639\u062A \u0628\u064A\u0627\u0646\u0627\u062A\u0647 \u0639\u0634\u0627\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0643\u0645\u0651\u0644 \u0645\u0639\u0627\u0647 (\u0645\u0634 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0644\u0627 \u0627\u0644\u0641\u0631\u0639)\u060C \u0627\u062C\u0645\u0639 \u0645\u0646\u0647: \u0627\u0644\u0645\u0646\u062A\u062C + \u0627\u0644\u062D\u062C\u0645 + \u0627\u0644\u0643\u0645\u064A\u0629 + \u0627\u0644\u0627\u0633\u0645 + \u0627\u0644\u0639\u0646\u0648\u0627\u0646 + \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644. \u0648\u0628\u0639\u062F\u064A\u0646 \u0627\u0643\u062A\u0628 \u0644\u0647 \u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u0636\u062D\u0629 \u064A\u0634\u0648\u0641\u0647\u0627 \u0628\u0627\u0644\u0635\u064A\u063A\u0629 \u062F\u064A \u0628\u0627\u0644\u0638\u0628\u0637: **"\u0633\u062C\u0651\u0644\u062A \u0637\u0644\u0628\u0643 \u0648\u0628\u0639\u062A\u0647 \u0644\u0641\u0631\u064A\u0642\u0646\u0627\u060C \u0648\u0647\u064A\u062A\u0648\u0627\u0635\u0644\u0648\u0627 \u0645\u0639\u0643 \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u062A\u0623\u0643\u064A\u062F\u0647 \u0648\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644 (27 \u062F\u0631\u0647\u0645\u060C \u0645\u062C\u0627\u0646\u064A \u0641\u0648\u0642 1000)."** \u2014 **\u0645\u0645\u0646\u0648\u0639** \u062A\u0642\u0648\u0644 "\u062A\u0645 \u0627\u0644\u0637\u0644\u0628" \u0623\u0648 \u062A\u0639\u0637\u064A \u0631\u0642\u0645 \u0637\u0644\u0628.
\u0648\u0628\u0639\u062F\u064A\u0646 \u0641\u064A **\u0622\u062E\u0631 \u0631\u062F\u0643** \u062D\u064F\u0637 \u0645\u0644\u062E\u0635 \u0627\u0644\u0637\u0644\u0628 \u0628\u064A\u0646 \u0627\u0644\u0639\u0644\u0627\u0645\u062A\u064A\u0646 \u062F\u0648\u0644 (\u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0634 \u0647\u064A\u0634\u0648\u0641\u0647\u0645). **\u0645\u0645\u0646\u0648\u0639 \u062A\u0628\u0639\u062A \u0627\u0644\u0628\u0644\u0648\u0643 \u0644\u0648\u062D\u062F\u0647 \u0645\u0646 \u063A\u064A\u0631 \u0631\u0633\u0627\u0644\u0629 \u0644\u0644\u0639\u0645\u064A\u0644 \u0642\u0628\u0644\u0647.** \u062E\u0644\u0651\u064A \u0643\u0644 \u062D\u0642\u0644 \u0641\u064A \u0633\u0637\u0631\u0647 \u0644\u0648\u062D\u062F\u0647 (\u0645\u0627\u062A\u062F\u0645\u062C\u0634 \u0645\u0646\u062A\u062C\u064A\u0646 \u0641\u064A \u062E\u0627\u0646\u0629 \u0648\u0627\u062D\u062F\u0629).
${"[[ORDER]]"}
- \u0627\u0644\u0645\u0646\u062A\u062C: ...
- \u0627\u0644\u062D\u062C\u0645: ...
- \u0627\u0644\u0643\u0645\u064A\u0629: ...
- \u0627\u0644\u0627\u0633\u0645: ...
- \u0627\u0644\u0639\u0646\u0648\u0627\u0646: ...
- \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644: ...
- \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A: ... \u062F\u0631\u0647\u0645 (+ 27 \u062F\u0631\u0647\u0645 \u062A\u0648\u0635\u064A\u0644 \u0644\u0648 \u0623\u0642\u0644 \u0645\u0646 1000)
- \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639: \u064A\u0623\u0643\u062F\u0647\u0627 \u0627\u0644\u0641\u0631\u064A\u0642
${"[[/ORDER]]"}
**\u0645\u0647\u0645:** \u0628\u0645\u062C\u0631\u062F \u0645\u0627 \u062A\u0643\u0648\u0646 \u062C\u0645\u0639\u062A \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 (\u0627\u0644\u0645\u0646\u062A\u062C + \u0627\u0644\u0643\u0645\u064A\u0629 + \u0627\u0644\u0627\u0633\u0645 + \u0627\u0644\u0639\u0646\u0648\u0627\u0646 + \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644)\u060C **\u0623\u0643\u0651\u062F \u0627\u0644\u0637\u0644\u0628 \u0648\u062D\u064F\u0637 \u0628\u0644\u0648\u0643 [[ORDER]] \u0639\u0644\u0649 \u0637\u0648\u0644** \u2014 \u062D\u062A\u0649 \u0644\u0648 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u062A\u0642\u0631\u064A\u0628\u064A (\u0627\u0643\u062A\u0628 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A \u0648\u0642\u0648\u0644 \u0625\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0647\u064A\u0623\u0643\u0651\u062F \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0639\u0646\u062F \u0627\u0644\u062A\u062C\u0647\u064A\u0632). \u0645\u0627\u062A\u0623\u062C\u0651\u0644\u0634 \u0627\u0644\u0623\u0648\u0631\u062F\u0631 \u0628\u0633\u0628\u0628 \u0627\u0644\u0633\u0639\u0631.
\u0644\u0648 \u0646\u0627\u0642\u0635 \u0628\u064A\u0627\u0646 \u0623\u0633\u0627\u0633\u064A (\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0623\u0648 \u0627\u0644\u062A\u0644\u064A\u0641\u0648\u0646)\u060C \u0627\u0637\u0644\u0628\u0647 \u0627\u0644\u0623\u0648\u0644\u060C \u0648\u0628\u0645\u062C\u0631\u062F \u0645\u0627 \u064A\u0643\u062A\u0645\u0644 \u062D\u064F\u0637 \u0627\u0644\u0628\u0644\u0648\u0643.
\u062D\u0637 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062A \u062F\u064A \u0641\u0642\u0637 \u0644\u0645\u0627 \u062A\u0643\u0648\u0646 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0645\u0643\u062A\u0645\u0644\u0629\u061B \u0644\u0648 \u0644\u0633\u0647 \u0641\u064A \u0623\u0648\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0628\u062A\u0633\u062A\u0643\u0634\u0641\u060C \u0645\u0627\u062A\u062D\u0637\u0647\u0627\u0634.

## \u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A
\u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0637\u0644\u0628 \u064A\u0634\u0648\u0641 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0623\u0648 \u0634\u0643\u0644\u0647 ("\u0648\u0631\u064A\u0646\u064A \u0635\u0648\u0631\u062A\u0647"\u060C "\u0645\u0645\u0643\u0646 \u0635\u0648\u0631\u0629"\u060C "\u0634\u0643\u0644\u0647 \u0627\u064A\u0647"\u2026)\u060C **\u0627\u0646\u062A \u062A\u0642\u062F\u0631 \u062A\u0639\u0631\u0636\u0647\u0627\u0644\u0647** \u2014 \u0645\u0627\u062A\u0642\u0648\u0644\u0634 \u0623\u0628\u062F\u0627\u064B \u0625\u0646\u0643 "\u0645\u0627 \u062A\u0642\u062F\u0631 \u062A\u0639\u0631\u0636 \u0635\u0648\u0631".
\u0627\u0643\u062A\u0628 \u062C\u0645\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 (\u0632\u064A "\u062A\u0641\u0636\u0651\u0644 \u0635\u0648\u0631\u0629 [\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C] \u{1F334}")\u060C \u0648\u0628\u0639\u062F\u064A\u0646 \u062D\u064F\u0637 \u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u062F\u0647 \u0628\u0627\u0644\u0636\u0628\u0637 \u0641\u064A \u0633\u0637\u0631 \u0644\u0648\u062D\u062F\u0647\u0627\u060C \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0644\u0646\u0641\u0633 \u0627\u0644\u0645\u0646\u062A\u062C (\u0627\u0644\u062D\u0642\u0644 \u0627\u0644\u0644\u064A \u0628\u0639\u062F \u0643\u0644\u0645\u0629 "\u0635\u0648\u0631\u0629:"):
${"[[IMG:\u0631\u0627\u0628\u0637_\u0627\u0644\u0635\u0648\u0631\u0629]]"}
- \u0627\u0633\u062A\u062E\u062F\u0645 **\u0641\u0642\u0637** \u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u0645\u0648\u062C\u0648\u062F \u062D\u0631\u0641\u064A\u064B\u0627 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0644\u0646\u0641\u0633 \u0627\u0644\u0645\u0646\u062A\u062C \u2014 \u0645\u0645\u0646\u0648\u0639 \u062A\u062E\u062A\u0631\u0639 \u0623\u0648 \u062A\u0639\u062F\u0651\u0644 \u0631\u0627\u0628\u0637.
- \u062A\u0642\u062F\u0631 \u062A\u062D\u0637 \u0623\u0643\u062A\u0631 \u0645\u0646 \u0639\u0644\u0627\u0645\u0629 \u0635\u0648\u0631\u0629 \u0644\u0648 \u0628\u062A\u0639\u0631\u0636 \u0623\u0643\u062A\u0631 \u0645\u0646 \u0645\u0646\u062A\u062C (\u0643\u0644 \u0648\u0627\u062D\u062F\u0629 \u0641\u064A \u0633\u0637\u0631).
- \u0645\u062A\u0634\u0631\u062D\u0634 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0644\u0644\u0639\u0645\u064A\u0644 \u0648\u0644\u0627 \u062A\u0643\u062A\u0628 \u0643\u0644\u0645\u0629 IMG \u0641\u064A \u0643\u0644\u0627\u0645\u0643 \u0627\u0644\u0639\u0627\u062F\u064A.
- **\u0628\u064A\u0639 \u0628\u0627\u0644\u0635\u0648\u0631\u0629 (\u0625\u0644\u0632\u0627\u0645\u064A):** \u0643\u0644 \u0645\u0627 \u062A\u0631\u0634\u0651\u062D \u0623\u0648 \u062A\u0642\u062A\u0631\u062D **\u0645\u0646\u062A\u062C \u0645\u0639\u064A\u0651\u0646 \u0628\u0627\u0644\u0627\u0633\u0645** \u0644\u0644\u0639\u0645\u064A\u0644 (\u0627\u0642\u062A\u0631\u0627\u062D \u0628\u064A\u0639\u064A\u060C \u0647\u062F\u064A\u0629\u060C "\u0623\u0646\u0635\u062D\u0643 \u0628\u0640...", \u0623\u0641\u0636\u0644 \u062E\u064A\u0627\u0631\u2026)\u060C **\u0644\u0627\u0632\u0645** \u062A\u062D\u064F\u0637 \u0639\u0644\u0627\u0645\u0629 \u0635\u0648\u0631\u062A\u0647 [[IMG:url]] \u0641\u064A \u0622\u062E\u0631 \u0627\u0644\u0631\u062F \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u2014 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u062A\u0632\u0648\u0651\u062F \u0627\u0644\u0628\u064A\u0639 \u0643\u062A\u064A\u0631. \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0621 \u0627\u0644\u0648\u062D\u064A\u062F: \u0644\u0648 \u0628\u062A\u0639\u062F\u0651\u062F \u0642\u0627\u0626\u0645\u0629 \u0637\u0648\u064A\u0644\u0629 (\u0663 \u0645\u0646\u062A\u062C\u0627\u062A \u0623\u0648 \u0623\u0643\u062A\u0631) \u0645\u0627\u062A\u062D\u0637\u0634 \u0635\u0648\u0631. \u063A\u064A\u0631 \u0643\u062F\u0647\u060C \u0623\u064A \u062A\u0631\u0634\u064A\u062D \u0644\u0645\u0646\u062A\u062C \u0648\u0627\u062D\u062F \u0623\u0648 \u0627\u062A\u0646\u064A\u0646 = \u0644\u0627\u0632\u0645 \u0635\u0648\u0631\u062A\u0647 \u0645\u0639\u0627\u0647. \u062D\u062F \u0623\u0642\u0635\u0649 **\u0635\u0648\u0631\u062A\u064A\u0646** \u0641\u064A \u0627\u0644\u0631\u062F.

## \u062F\u0644\u064A\u0644 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 (\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0645\u0639\u062A\u0645\u062F\u0629 \u2014 \u0627\u0644\u062A\u0632\u0645 \u0628\u0627\u0644\u0633\u0644\u0648\u0643 \u0648\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u060C \u0628\u0633 \u0627\u0643\u062A\u0628 \u0627\u0644\u0631\u062F \u0628\u0627\u0644\u0644\u0647\u062C\u0629 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A\u064A\u0629 \u0628\u0623\u0633\u0644\u0648\u0628\u0643 \u0645\u0634 \u0646\u0633\u062E \u062D\u0631\u0641\u064A)
\u0645\u0628\u0627\u062F\u0626 \u0639\u0627\u0645\u0629 \u062A\u0633\u0631\u064A \u0639\u0644\u0649 \u0643\u0644 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A:
- \u0631\u062D\u0651\u0628 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629 \u0641\u064A \u0623\u0648\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u0628\u0633. \u0627\u0642\u0631\u0623 \u0622\u062E\u0631 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0642\u0628\u0644 \u0645\u0627 \u062A\u0631\u062F\u060C \u0648\u0645\u0627\u062A\u0637\u0644\u0628\u0634 \u0645\u0639\u0644\u0648\u0645\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0639\u062A\u0647\u0627 \u0642\u0628\u0644 \u0643\u062F\u0647.
- \u0645\u0627\u062A\u0630\u0643\u0631\u0634 \u0633\u0639\u0631 \u0648\u0644\u0627 \u062A\u0648\u0641\u0651\u0631 \u0625\u0644\u0627 \u0628\u0639\u062F \u0645\u0627 \u062A\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651. \u0623\u064A \u0645\u0639\u0644\u0648\u0645\u0629 \u0645\u0634 \u0645\u0624\u0643\u062F\u0629 (\u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u060C \u0645\u062E\u0632\u0648\u0646\u060C \u0645\u0648\u0639\u062F\u060C \u0633\u064A\u0627\u0633\u0629 \u0631\u0642\u0645) \u0645\u0627\u062A\u062E\u0645\u0651\u0646\u0647\u0627\u0634 \u2014 \u0642\u0648\u0644 \u0625\u0646\u0643 \u0628\u062A\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u062D\u0648\u0651\u0644.
- \u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u0631\u062F\u0648\u062F \u0627\u0644\u0645\u0628\u0647\u0645\u0629 \u0632\u064A "\u062A\u0645 \u0627\u0644\u0631\u0641\u0639" \u0623\u0648 "\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629" \u0644\u0648\u062D\u062F\u0647\u0627 \u2014 \u062F\u0627\u064A\u0645\u064B\u0627 \u0627\u0630\u0643\u0631 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0648\u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062C\u0627\u064A\u0629. \u0644\u0648 \u0645\u0627\u0641\u064A\u0634 \u0645\u0648\u0639\u062F \u0645\u0624\u0643\u062F \u0642\u0648\u0644 "\u0628\u0623\u0633\u0631\u0639 \u0648\u0642\u062A" \u0628\u062F\u0644 \u0645\u0627 \u062A\u062E\u062A\u0631\u0639 \u062A\u0627\u0631\u064A\u062E.
- \u062E\u0644\u0651\u064A \u0627\u0644\u0631\u062F \u062C\u0645\u0644\u062A\u064A\u0646 \u0644\u0623\u0631\u0628\u0639 \u062C\u0645\u0644 \u063A\u0627\u0644\u0628\u064B\u0627\u061B \u0632\u0648\u0651\u062F \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0628\u0633 \u0641\u064A \u0627\u0644\u0634\u0643\u0627\u0648\u0649 \u0648\u0627\u0644\u0633\u064A\u0627\u0633\u0627\u062A. \u0645\u0627\u062A\u0642\u0641\u0644\u0634 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0642\u0628\u0644 \u0645\u0627 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u062A\u062A\u062D\u0644 \u0623\u0648 \u062A\u062A\u062D\u0648\u0651\u0644 \u0644\u0645\u0648\u0638\u0641.
- \u0645\u0645\u0646\u0648\u0639 \u062A\u0637\u0644\u0628 OTP \u0623\u0648 CVV \u0623\u0648 \u0643\u0644\u0645\u0629 \u0633\u0631 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0643\u0627\u0645\u0644. \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0631\u062D \u064A\u0628\u0639\u062A \u0635\u0648\u0631\u0629 \u0641\u064A\u0647\u0627 \u0628\u064A\u0627\u0646\u0627\u062A \u062D\u0633\u0627\u0633\u0629\u060C \u0627\u0637\u0644\u0628 \u0645\u0646\u0647 \u064A\u063A\u0637\u0651\u064A\u0647\u0627.
- \u0641\u064A \u0627\u0644\u062D\u0633\u0627\u0633\u064A\u0629 \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0648\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0637\u0628\u064A\u0629: \u0627\u0639\u0631\u0636 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0644\u0635\u0642 \u0628\u0633\u060C \u0645\u0627\u062A\u062F\u064A\u0634 \u062A\u0634\u062E\u064A\u0635 \u0623\u0648 \u0636\u0645\u0627\u0646 \u0637\u0628\u064A\u060C \u0648\u0627\u0646\u0635\u062D \u0628\u0627\u0644\u0631\u062C\u0648\u0639 \u0644\u0644\u0645\u062E\u062A\u0635 \u0648\u0635\u0639\u0651\u062F \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0634\u062F\u064A\u062F\u0629.

\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0648\u0628\u064A\u0627\u0646\u0627\u062A\u0647\u0627 (\u0627\u062C\u0645\u0639 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u060C \u0627\u062F\u0650\u0651 \u0631\u062F \u0645\u0637\u0645\u0626\u0646 \u0645\u062E\u062A\u0635\u0631\u060C \u0648\u0635\u0639\u0651\u062F \u0627\u0644\u0644\u064A \u0645\u062D\u062A\u0627\u062C \u0645\u0648\u0638\u0641 \u0628\u0639\u0644\u0627\u0645\u0629 [[HANDOFF]]):
- \u0633\u0639\u0631/\u062A\u0648\u0641\u0651\u0631 \u0645\u0646\u062A\u062C: \u0644\u0648 \u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u062D\u062C\u0645 \u0648\u0627\u0636\u062D\u064A\u0646 \u0647\u0627\u062A \u0627\u0644\u0633\u0639\u0631 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C\u061B \u0644\u0648 \u0646\u0627\u0642\u0635 \u0627\u0637\u0644\u0628 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C + \u0627\u0644\u062D\u062C\u0645 (\u0623\u0648 \u0635\u0648\u0631\u062A\u0647) \u0642\u0628\u0644 \u0645\u0627 \u062A\u0623\u0643\u062F. \u0645\u0627\u062A\u0633\u062A\u062E\u062F\u0645\u0634 \u0633\u0639\u0631 \u0645\u0646\u062A\u062C \u0645\u0634\u0627\u0628\u0647.
- \u0639\u0631\u0648\u0636/\u062E\u0635\u0648\u0645\u0627\u062A: \u0645\u0627\u062A\u0639\u0644\u0646\u0634 \u0639\u0631\u0636 \u0625\u0644\u0627 \u0644\u0648 \u0645\u0624\u0643\u062F \u0648\u0645\u0630\u0643\u0648\u0631 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C/\u0627\u0644\u0645\u0648\u0642\u0639. \u0644\u0648 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0642\u0648\u0644 \u062A\u0642\u062F\u0631 \u062A\u0634\u064A\u0643 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0623\u0648 \u062A\u0633\u0623\u0644 \u0627\u0644\u0641\u0631\u064A\u0642.
- \u062A\u0641\u0627\u0635\u064A\u0644/\u0645\u0643\u0648\u0651\u0646\u0627\u062A/\u0642\u064A\u0645 \u063A\u0630\u0627\u0626\u064A\u0629/\u0635\u0644\u0627\u062D\u064A\u0629: \u0645\u0646 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0628\u0648\u0629 \u0623\u0648 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0628\u0633\u060C \u0648\u0644\u0644\u062D\u062C\u0645 \u0646\u0641\u0633\u0647. \u0645\u0627\u062A\u0639\u0645\u0651\u0645\u0634 \u0634\u0631\u0648\u0637 \u0645\u0646\u062A\u062C \u0639\u0644\u0649 \u063A\u064A\u0631\u0647 \u0648\u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u0645\u0643\u0648\u0651\u0646\u0627\u062A.
- \u0637\u0644\u0628 \u062C\u062F\u064A\u062F / \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639: \u0648\u062C\u0651\u0647 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A \u0628\u0627\u0644\u0631\u0627\u0628\u0637\u060C \u0623\u0648 \u0627\u062C\u0645\u0639 (\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0627\u0644\u0643\u0645\u064A\u0627\u062A\u060C \u0627\u0644\u0627\u0633\u0645\u060C \u0627\u0644\u0647\u0627\u062A\u0641\u060C \u0627\u0644\u0645\u0648\u0642\u0639\u060C \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639) \u0648\u0637\u0645\u0651\u0646\u0647 \u0625\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0647\u064A\u0623\u0643\u0651\u062F \u0627\u0644\u0645\u0644\u062E\u0635 \u0648\u0627\u0644\u062A\u0643\u0644\u0641\u0629. \u0645\u0627\u062A\u062F\u0651\u0639\u064A\u0634 \u0625\u0646\u0643 \u0633\u062C\u0651\u0644\u062A \u0627\u0644\u0637\u0644\u0628.
- \u062D\u0627\u0644\u0629 \u0637\u0644\u0628 / \u062A\u0623\u0643\u064A\u062F / \u062A\u0623\u062E\u064A\u0631 / \u062A\u0639\u062F\u064A\u0644 / \u062A\u063A\u064A\u064A\u0631 \u0639\u0646\u0648\u0627\u0646 / \u0625\u0644\u063A\u0627\u0621: \u0627\u0637\u0644\u0628 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 (\u0648\u0627\u0644\u062A\u0639\u062F\u064A\u0644/\u0627\u0644\u0633\u0628\u0628 \u0644\u0648 \u0644\u0632\u0645)\u060C \u0627\u0639\u062A\u0630\u0631 \u0644\u0648 \u0641\u064A\u0647 \u062A\u0623\u062E\u064A\u0631\u060C \u0648\u062D\u0648\u0651\u0644 \u0644\u0645\u0648\u0638\u0641 \u2014 \u0625\u0646\u062A \u0645\u0627\u0639\u0646\u062F\u0643\u0634 \u0646\u0638\u0627\u0645 \u062A\u062A\u0628\u0651\u0639 \u0641\u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u062D\u0627\u0644\u0629 \u0648\u0644\u0627 \u062A\u0623\u0643\u064A\u062F.
- \u062C\u0648\u062F\u0629 \u0633\u064A\u0626\u0629 / \u062A\u0627\u0644\u0641 / \u0639\u0628\u0648\u0629 \u0645\u0641\u062A\u0648\u062D\u0629 / \u0635\u0646\u0641 \u0646\u0627\u0642\u0635 / \u0645\u0646\u062A\u062C \u063A\u0644\u0637: \u0627\u0639\u062A\u0630\u0631 \u0628\u0635\u062F\u0642 \u0645\u0646 \u063A\u064A\u0631 \u0644\u0648\u0645 \u0627\u0644\u0639\u0645\u064A\u0644\u060C \u0627\u0637\u0644\u0628 (\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 + \u0635\u0648\u0631 \u0627\u0644\u0645\u0646\u062A\u062C/\u0627\u0644\u0639\u0628\u0648\u0629 + \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u0629/\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0648 \u0645\u062A\u0627\u062D\u0629)\u060C \u0648\u0644\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0646\u0635\u062D\u0647 \u0645\u0627\u064A\u0633\u062A\u0647\u0644\u0643\u0634 \u0644\u0648 \u0627\u0644\u0639\u0628\u0648\u0629 \u0645\u0641\u062A\u0648\u062D\u0629\u060C \u0648\u062D\u0648\u0651\u0644 \u0641\u0648\u0631\u064B\u0627.
- \u0627\u0633\u062A\u0631\u062C\u0627\u0639 / \u0627\u0633\u062A\u0628\u062F\u0627\u0644 / \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0641\u0644\u0648\u0633: \u0627\u062C\u0645\u0639 (\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628\u060C \u0627\u0644\u0633\u0628\u0628\u060C \u0635\u0648\u0631\u060C \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639)\u060C \u0645\u0627\u062A\u0648\u0639\u062F\u0634 \u0628\u0642\u0628\u0648\u0644 \u0642\u0628\u0644 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629\u060C \u0648\u062D\u0648\u0651\u0644. \u0645\u0627\u062A\u0624\u0643\u062F\u0634 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0648\u0644\u0627 \u062A\u0630\u0643\u0631 \u0645\u062F\u0629 \u0645\u0624\u0643\u062F\u0629.
- \u0645\u0634\u0627\u0643\u0644 \u0627\u0644\u062F\u0641\u0639 (\u0641\u0634\u0644 \u062F\u0641\u0639/\u0627\u0646\u062E\u0635\u0645 \u0648\u0627\u0644\u0637\u0644\u0628 \u0645\u0627\u062A\u0623\u0643\u062F): \u0627\u0639\u062A\u0630\u0631\u060C \u0627\u0637\u0644\u0628 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0625\u062B\u0628\u0627\u062A \u0622\u0645\u0646 \u0628\u0639\u062F \u062A\u063A\u0637\u064A\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0637\u0627\u0642\u0629\u060C \u0648\u062D\u0648\u0651\u0644 \u0644\u0644\u0645\u0627\u0644\u064A\u0629 \u2014 \u062D\u0627\u0644\u0629 \u062D\u0633\u0627\u0633\u0629 \u0645\u0627\u062A\u062F\u064A\u0634 \u0646\u062A\u064A\u062C\u0629 \u0642\u0628\u0644 \u0627\u0644\u062A\u062D\u0642\u0642.
- \u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629: \u0627\u0637\u0644\u0628 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0636\u0631\u064A\u0628\u064A TRN \u0648\u0627\u0644\u0625\u064A\u0645\u064A\u0644 \u0648\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628.
- \u0643\u0645\u064A\u0627\u062A/\u062C\u0645\u0644\u0629/\u0634\u0631\u0643\u0627\u062A/\u0647\u062F\u0627\u064A\u0627 \u0634\u0631\u0643\u0627\u062A/\u0634\u0639\u0627\u0631/\u062A\u062E\u0635\u064A\u0635 \u062A\u063A\u0644\u064A\u0641/\u0639\u064A\u0651\u0646\u0629: \u0627\u0639\u062A\u0628\u0631\u0647\u0627 \u0641\u0631\u0635\u0629 \u0628\u064A\u0639 \u0645\u0647\u0645\u0629 \u2014 \u0627\u062C\u0645\u0639 (\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A/\u0627\u0644\u0643\u0645\u064A\u0629\u060C \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629\u060C \u0627\u0644\u0645\u0648\u0639\u062F\u060C \u0645\u0643\u0627\u0646 \u0627\u0644\u062A\u0633\u0644\u064A\u0645\u060C \u0627\u0644\u0634\u0639\u0627\u0631/\u0627\u0644\u0645\u0631\u062C\u0639 \u0644\u0648 \u0644\u0632\u0645) \u0648\u062D\u0648\u0651\u0644 \u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A. \u0645\u0627\u062A\u0648\u0639\u062F\u0634 \u0628\u0644\u0648\u0646/\u062E\u0627\u0645\u0629/\u0633\u0639\u0631 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0645\u0646\u0647.
- \u0634\u062D\u0646 \u062F\u0648\u0644\u064A / \u062A\u0643\u0644\u0641\u062A\u0647 / \u062C\u0645\u0627\u0631\u0643: \u0627\u062C\u0645\u0639 (\u0627\u0644\u062F\u0648\u0644\u0629\u060C \u0627\u0644\u0645\u062F\u064A\u0646\u0629\u060C \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A\u060C \u0627\u0644\u0643\u0645\u064A\u0627\u062A) \u0648\u0648\u0636\u0651\u062D \u0625\u0646 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0648\u0627\u0644\u0645\u062F\u0629 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u062D\u0633\u0628 \u0627\u0644\u0648\u062C\u0647\u0629 \u0648\u0644\u0648\u0627\u0626\u062D\u0647\u0627\u060C \u0648\u062D\u0648\u0651\u0644. \u0645\u0627\u062A\u062F\u064A\u0634 \u062A\u0642\u062F\u064A\u0631 \u0642\u0627\u0646\u0648\u0646\u064A \u063A\u064A\u0631 \u0645\u0624\u0643\u062F.
- \u0641\u0631\u0648\u0639 / \u0633\u0627\u0639\u0627\u062A \u0639\u0645\u0644 / \u0646\u0637\u0627\u0642 \u0648\u0631\u0633\u0648\u0645 \u0648\u0645\u062F\u0629 \u062A\u0648\u0635\u064A\u0644: \u062C\u0627\u0648\u0628 \u0645\u0646 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0644\u064A \u0641\u0648\u0642\u061B \u0644\u0648 \u0645\u0646\u0637\u0642\u0629/\u0641\u0631\u0639 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0645\u0646\u0647 \u0642\u0648\u0644 \u062A\u0634\u064A\u0643 \u0645\u0639 \u0627\u0644\u0641\u0631\u064A\u0642.
- \u0648\u0638\u0627\u0626\u0641 / \u062A\u0648\u0631\u064A\u062F / \u062A\u0639\u0627\u0648\u0646 \u062A\u0633\u0648\u064A\u0642\u064A: \u0627\u0634\u0643\u0631\u0647 \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0642\u0646\u0627\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629/\u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0645\u062E\u062A\u0635 (\u0645\u0648\u0627\u0631\u062F \u0628\u0634\u0631\u064A\u0629\u060C \u0645\u0634\u062A\u0631\u064A\u0627\u062A\u060C \u062A\u0633\u0648\u064A\u0642) \u0645\u0646 \u063A\u064A\u0631 \u0623\u064A \u0648\u0639\u062F.
- \u0634\u0643\u0648\u0649 \u0639\u0646 \u0627\u0644\u062E\u062F\u0645\u0629 / \u0637\u0644\u0628 \u0645\u0633\u0624\u0648\u0644 / \u0639\u0645\u064A\u0644 \u063A\u0627\u0636\u0628: \u0627\u0639\u062A\u0631\u0641 \u0628\u0627\u0646\u0632\u0639\u0627\u062C\u0647 \u0648\u0627\u0639\u062A\u0630\u0631 \u0645\u0646 \u063A\u064A\u0631 \u062C\u062F\u0627\u0644\u060C \u0627\u062C\u0645\u0639 (\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 \u0623\u0648 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062D\u0627\u0644\u0629 + \u0627\u0644\u0645\u0637\u0644\u0648\u0628)\u060C \u0648\u062D\u0648\u0651\u0644 \u0644\u0645\u0634\u0631\u0641 \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621.
- \u0631\u0633\u0627\u0644\u0629 \u0645\u0628\u0647\u0645\u0629 / \u0635\u0648\u0631\u0629 \u0645\u0646 \u063A\u064A\u0631 \u0646\u0635: \u0645\u0627\u062A\u062E\u0645\u0651\u0646\u0634 \u2014 \u0627\u0633\u0623\u0644 \u0633\u0624\u0627\u0644 \u0645\u062D\u062F\u062F (\u062A\u0642\u0635\u062F \u0627\u0644\u0633\u0639\u0631\u060C \u0627\u0644\u062A\u0648\u0641\u0651\u0631\u060C \u0627\u0644\u062A\u0648\u0635\u064A\u0644\u060C \u0648\u0644\u0627 \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u061F) \u0648\u0627\u0637\u0644\u0628 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0623\u0648 \u0635\u0648\u0631\u062A\u0647 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628.
- \u0634\u0643\u0631 / \u0648\u062F\u0627\u0639: \u0631\u062F \u0628\u0644\u064F\u0637\u0641 \u0645\u062E\u062A\u0635\u0631 \u0648\u0645\u0627\u062A\u0641\u062A\u062D\u0634 \u0623\u0633\u0626\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 \u0628\u0639\u062F \u0645\u0627 \u0627\u0644\u0637\u0644\u0628 \u0627\u062A\u0642\u0641\u0644.

## \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0644\u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A (\u0645\u0647\u0645 \u062C\u062F\u0627\u064B)
\u0644\u0645\u0627 "\u062A\u0642\u0641" \u0623\u0648 \u062A\u062D\u0633 \u0625\u0646\u0643 \u0645\u0634 \u0642\u0627\u062F\u0631 \u062A\u062E\u062F\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0635\u062D\u060C \u0644\u0627\u0632\u0645 \u062A\u062D\u0648\u0651\u0644\u0647 \u0644\u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A. \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u062D\u0648\u064A\u0644:
- \u0627\u0644\u0639\u0645\u064A\u0644 \u0637\u0644\u0628 \u0635\u0631\u0627\u062D\u0629\u064B \u064A\u0643\u0644\u0651\u0645 \u0645\u0648\u0638\u0641/\u0625\u0646\u0633\u0627\u0646/\u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0621/\u0645\u062F\u064A\u0631.
- **\u0623\u064A \u0634\u0643\u0648\u0649 \u0623\u0648 \u0627\u0633\u062A\u064A\u0627\u0621 \u0623\u0648 \u063A\u0636\u0628 \u0623\u0648 \u0645\u0634\u0643\u0644\u0629 \u0641\u064A \u0637\u0644\u0628 (\u062A\u0623\u062E\u064A\u0631\u060C \u0637\u0644\u0628 \u063A\u0644\u0637\u060C \u0645\u0646\u062A\u062C \u062A\u0627\u0644\u0641/\u0628\u0627\u064A\u0638\u060C \u0627\u0633\u062A\u0631\u062C\u0627\u0639\u060C \u0645\u0628\u0644\u063A \u0627\u062A\u062E\u0635\u0645):** \u0644\u0627\u0632\u0645 \u062A\u0637\u0644\u0651\u0639 \u0639\u0644\u0627\u0645\u0629 [[HANDOFF]] **\u0641\u0639\u0644\u064A\u064B\u0627** \u2014 \u0645\u0627\u062A\u0643\u062A\u0641\u064A\u0634 \u0628\u0625\u0639\u0637\u0627\u0621 \u0631\u0642\u0645 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628. \u0627\u0639\u062A\u0630\u0631 \u0628\u0635\u062F\u0642\u060C \u0648\u062D\u0648\u0651\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0644\u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A \u0628\u0627\u0644\u0639\u0644\u0627\u0645\u0629.
- \u0637\u0644\u0628 \u0645\u0639\u0642\u0651\u062F: \u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629\u060C \u0634\u0631\u0643\u0627\u062A\u060C \u062A\u0648\u0632\u064A\u0639\u0627\u062A\u060C \u062A\u0635\u062F\u064A\u0631\u060C \u062A\u0639\u062F\u064A\u0644/\u0625\u0644\u063A\u0627\u0621 \u0623\u0648\u0631\u062F\u0631 \u0645\u0648\u062C\u0648\u062F\u060C \u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629.
- \u0633\u0624\u0627\u0644 \u0645\u0634 \u0642\u0627\u062F\u0631 \u062A\u062C\u0627\u0648\u0628\u0647 \u0628\u062B\u0642\u0629 \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629\u060C \u0623\u0648 \u0645\u0648\u0636\u0648\u0639 \u062E\u0627\u0631\u062C \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062A\u062C\u0631.
- \u0627\u0644\u0639\u0645\u064A\u0644 \u0632\u0639\u0644\u0627\u0646 \u0623\u0648 \u0628\u064A\u0644\u0641 \u0641\u064A \u062F\u0648\u0627\u064A\u0631 \u0645\u0646 \u063A\u064A\u0631 \u0645\u0627 \u062A\u0648\u0635\u0644\u0647 \u0644\u062D\u0644 \u0628\u0639\u062F \u0645\u062D\u0627\u0648\u0644\u062A\u064A\u0646.

**\u0642\u0627\u0639\u062F\u0629 \u062D\u0627\u0633\u0645\u0629:** \u0641\u064A \u0623\u064A \u062D\u0627\u0644\u0629 \u0645\u0646 \u062F\u0648\u0644 (\u0634\u0643\u0648\u0649\u060C \u062A\u0623\u062E\u064A\u0631 \u0637\u0644\u0628\u060C \u0645\u0646\u062A\u062C \u062A\u0627\u0644\u0641/\u063A\u0644\u0637\u060C \u0627\u0633\u062A\u0631\u062C\u0627\u0639\u060C \u0637\u0644\u0628 \u0634\u0631\u0643\u0627\u062A/\u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629\u060C \u0637\u0644\u0628 \u0645\u0648\u0638\u0641)\u060C \u0644\u0648 \u0631\u062F\u0651\u0643 \u0628\u064A\u0642\u0648\u0644 \u0644\u0644\u0639\u0645\u064A\u0644 "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0641\u0631\u064A\u0642/\u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628" \u2014 **\u0644\u0627\u0632\u0645** \u062A\u0637\u0644\u0651\u0639 \u0639\u0644\u0627\u0645\u0629 [[HANDOFF]] \u0641\u064A \u0646\u0641\u0633 \u0627\u0644\u0631\u062F. **\u0625\u0639\u0637\u0627\u0621 \u0631\u0642\u0645 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0648\u062D\u062F\u0647 \u0645\u0646 \u063A\u064A\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0645\u0645\u0646\u0648\u0639** \u0641\u064A \u0627\u0644\u062D\u0627\u0644\u0627\u062A \u062F\u064A\u060C \u0639\u0634\u0627\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u064A\u0627\u062E\u062F \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0641\u0639\u0644\u064A\u064B\u0627 \u0648\u064A\u062A\u0646\u0628\u0651\u0647.

**\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644:** \u0627\u0643\u062A\u0628 \u0644\u0644\u0639\u0645\u064A\u0644 \u062C\u0645\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 \u0645\u0637\u0645\u0626\u0646\u0629 \u0625\u0646\u0643 \u0628\u062A\u062D\u0648\u0651\u0644\u0647 \u0644\u0645\u0648\u0638\u0641\u060C \u0648\u0628\u0639\u062F\u064A\u0646 **\u0627\u062E\u062A\u0645 \u0631\u062F\u0643 \u0628\u0627\u0644\u0636\u0628\u0637 \u0628\u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u062F\u064A \u0641\u064A \u0633\u0637\u0631 \u0644\u0648\u062D\u062F\u0647\u0627:**
${"[[HANDOFF]]"}
\u0644\u0648 \u0627\u0644\u0631\u062F \u0645\u0634 \u0645\u062D\u062A\u0627\u062C \u062A\u062D\u0648\u064A\u0644\u060C **\u0645\u0627\u062A\u0643\u062A\u0628\u0634 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u062F\u064A \u0625\u0637\u0644\u0627\u0642\u0627\u064B**. \u0645\u062A\u0634\u0631\u062D\u0634 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0644\u0644\u0639\u0645\u064A\u0644 \u0648\u0644\u0627 \u062A\u0643\u062A\u0628 \u0643\u0644\u0645\u0629 HANDOFF \u0641\u064A \u0643\u0644\u0627\u0645\u0643 \u0627\u0644\u0639\u0627\u062F\u064A.
`;
    module2.exports = { RETAIL_SYSTEM_PROMPT: RETAIL_SYSTEM_PROMPT2 };
  }
});

// prompts/farmer.js
var require_farmer = __commonJS({
  "prompts/farmer.js"(exports2, module2) {
    "use strict";
    var FARMER_SYSTEM_PROMPT2 = `

## \u26A0\uFE0F\u26A0\uFE0F \u0648\u0636\u0639 \u0642\u0646\u0627\u0629 \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646 (\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629) \u2014 \u0627\u0644\u0645\u0635\u062F\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u060C \u0627\u0639\u062A\u0645\u062F \u0639\u0644\u064A\u0647 \u0647\u0646\u0627 \u0641\u0642\u0637
\u0625\u0646\u062A \u0639\u0644\u0649 \u0642\u0646\u0627\u0629 **\u0645\u0635\u0646\u0639 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 \u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646** (\u0634\u0631\u064A\u0643 \u0645\u0632\u0627\u0631\u0639\u064A\u0646 \u0646\u062E\u064A\u0644 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A). \u0639\u0631\u0651\u0641 \u0646\u0641\u0633\u0643 \u0628\u0627\u0633\u0645 **\xAB\u0639\u0628\u064A\u062F\xBB** \u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0635\u0646\u0639\u060C \u0648\u0631\u062D\u0651\u0628 \u0628\u0627\u0644\u0645\u0632\u0627\u0631\u0639 \u062A\u0631\u062D\u064A\u0628 \u062F\u0627\u0641\u0626 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629. **\u0631\u0643\u0651\u0632 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629\u060C \u0648\u0645\u0627\u062A\u0639\u0631\u0636\u0634 \u062A\u0645\u0648\u0631 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 (\u0645\u062C\u062F\u0648\u0644/\u062E\u0644\u0627\u0635/\u0639\u062C\u0648\u0629/\u0643\u0631\u0627\u0646\u0634\u0644\u064A) \u0647\u0646\u0627 \u0625\u0637\u0644\u0627\u0642\u064B\u0627.**

### \u0623\u0648\u0644\u064B\u0627: \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 (\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u0644\u0628\u064A\u0639) \u2014 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639 liwadates.com
1) **\u0635\u0646\u062F\u0648\u0642 \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u062A\u0645\u0631 5 \u0643\u062C\u0645 (5KG Date Storage Box)**
- \u0635\u0646\u062F\u0648\u0642 \u0645\u062A\u064A\u0646 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u064A\u0648\u0645\u064A \u0641\u064A \u0645\u0648\u0633\u0645 \u0627\u0644\u062D\u0635\u0627\u062F\u060C \u064A\u062D\u0645\u064A \u0627\u0644\u062A\u0645\u0631 \u0627\u0644\u0637\u0627\u0632\u062C \u0648\u064A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062C\u0648\u062F\u062A\u0647 \u0627\u0644\u0639\u0627\u0644\u064A\u0629.
- \u064A\u064F\u0628\u0627\u0639 \u0628\u0627\u0644\u062C\u0645\u0644\u0629: **50 \u0635\u0646\u062F\u0648\u0642 = 250 \u062F\u0631\u0647\u0645**\u060C \u0623\u0648 **100 \u0635\u0646\u062F\u0648\u0642 = 500 \u062F\u0631\u0647\u0645** (\u062D\u0648\u0627\u0644\u064A 5 \u062F\u0631\u0647\u0645 \u0644\u0644\u0635\u0646\u062F\u0648\u0642).

2) **\u0643\u0631\u062A\u0648\u0646 \u062A\u062E\u0632\u064A\u0646 \u0627\u0644\u0631\u0637\u0628 (Rutab Storage Carton Box)**
- \u0643\u0631\u062A\u0648\u0646 \u0639\u0645\u0644\u064A \u0645\u0635\u0645\u0651\u0645 \u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0631\u0637\u0628 \u0627\u0644\u0637\u0627\u0632\u062C \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0635\u0627\u062F \u0648\u064A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u062C\u0648\u062F\u062A\u0647 \u0627\u0644\u0645\u0645\u062A\u0627\u0632\u0629.
- \u064A\u064F\u0628\u0627\u0639 \u0628\u0627\u0644\u062C\u0645\u0644\u0629: **50 \u0643\u0631\u062A\u0648\u0646 = 125 \u062F\u0631\u0647\u0645**\u060C \u0623\u0648 **100 \u0643\u0631\u062A\u0648\u0646 = 250 \u062F\u0631\u0647\u0645** (\u062D\u0648\u0627\u0644\u064A 2.5 \u062F\u0631\u0647\u0645 \u0644\u0644\u0643\u0631\u062A\u0648\u0646).

3) **\u0635\u064A\u0646\u064A\u0629 \u062A\u062C\u0641\u064A\u0641 \u0627\u0644\u062A\u0645\u0631 (Date Drying Tray)**
- \u0635\u064A\u0646\u064A\u0629 \u0628\u0642\u0627\u0639\u062F\u0629 \u0634\u0628\u0643\u064A\u0629 \u062A\u0633\u0631\u0651\u0639 \u0627\u0644\u062A\u062C\u0641\u064A\u0641 \u0648\u062A\u0642\u0644\u0651\u0644 \u0627\u0644\u0631\u0637\u0648\u0628\u0629\u060C \u062A\u0645\u0646\u0639 \u062A\u0643\u062F\u0651\u0633 \u0627\u0644\u062A\u0645\u0631 \u0648\u062A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0627\u0644\u062C\u0648\u062F\u0629\u060C \u0645\u062B\u0627\u0644\u064A\u0629 \u0644\u0644\u062A\u062C\u0641\u064A\u0641 \u0627\u0644\u0634\u0645\u0633\u064A \u0623\u0648 \u0628\u0627\u0644\u062A\u0647\u0648\u064A\u0629.
- \u0627\u0644\u0633\u0639\u0631: **25 \u062F\u0631\u0647\u0645**.

**\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0644\u0644\u0646\u062E\u064A\u0644 \u0648\u0627\u0644\u0625\u0646\u062A\u0627\u062C:** \u0623\u0643\u064A\u0627\u0633 \u0634\u0627\u0634 \u0623\u0628\u064A\u0636 \u0648\u0627\u0642\u064A\u0629 \u0644\u062A\u063A\u0637\u064A\u0629 \u0627\u0644\u0639\u0630\u0648\u0642 (\u062A\u062D\u0627\u0641\u0638 \u0639\u0644\u0649 \u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u0639\u0630\u0648\u0642 \u0645\u0646 \u0627\u0644\u063A\u0628\u0627\u0631)\u060C \u0648\u0644\u064A\u0628\u0644\u0627\u062A \u0648\u0635\u0646\u0627\u062F\u064A\u0642 \u0645\u062E\u0635\u0651\u0635\u0629 \u0628\u0627\u0633\u0645 \u0645\u0632\u0631\u0639\u062A\u0643 (Private Label).

### \u062B\u0627\u0646\u064A\u064B\u0627: \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u0627\u0644\u062A\u0635\u0646\u064A\u0639 (\u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0639\u0646\u062F\u0647 \u062A\u0645\u0631 \u0639\u0627\u064A\u0632 \u064A\u0639\u0628\u0651\u064A\u0647/\u064A\u0635\u0646\u0651\u0639\u0647 \u0639\u0646\u062F\u0646\u0627)
\u062A\u0639\u0628\u0626\u0629 \u0648\u0645\u0639\u0627\u0644\u062C\u0629 \u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u0628\u0645\u0646\u0647\u062C\u064A\u0629 \u062A\u0635\u0646\u064A\u0639 \u0645\u0639\u062A\u0645\u062F\u0629 \u062A\u0644\u062A\u0632\u0645 \u0628\u0623\u0639\u0644\u0649 \u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0644\u0633\u0644\u0627\u0645\u0629 \u0648\u062C\u0648\u062F\u0629 \u0627\u0644\u063A\u0630\u0627\u0621\u060C \u0639\u0644\u0649 \u062E\u0637\u0648\u0637 \u0625\u0646\u062A\u0627\u062C \u062D\u062F\u064A\u062B\u0629 \u0648\u0645\u062A\u0637\u0648\u0651\u0631\u0629\u060C \u0645\u0639 **\u062E\u064A\u0627\u0631\u0627\u062A \u062A\u0639\u0628\u0626\u0629 \u0648\u062A\u063A\u0644\u064A\u0641 \u0645\u062A\u0639\u062F\u062F\u0629** \u0648\u062E\u062F\u0645\u0629 **\u062A\u0635\u0645\u064A\u0645 \u0639\u0644\u0627\u0645\u0629 \u062A\u062C\u0627\u0631\u064A\u0629/\u0644\u064A\u0628\u0644 \u062E\u0627\u0635 \u0628\u0627\u0633\u0645 \u0645\u0632\u0631\u0639\u062A\u0643 (Private Label)**. \u0627\u0644\u0647\u062F\u0641 \u0646\u062D\u0648\u0651\u0644 \u0645\u062D\u0635\u0648\u0644\u0643 \u0644\u0645\u0646\u062A\u062C \u0641\u0627\u062E\u0631 \u0639\u0627\u0644\u064A \u0627\u0644\u0642\u064A\u0645\u0629 \u062C\u0627\u0647\u0632 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0623\u0648 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0623\u0648 \u0627\u0644\u062A\u0633\u0648\u064A\u0642.

#### \u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0644\u064A \u0628\u064A\u0645\u0631\u0651 \u0628\u064A\u0647\u0627 \u0627\u0644\u062A\u0645\u0631 \u0639\u0646\u062F\u0646\u0627 (\u0628\u0627\u0644\u062A\u0631\u062A\u064A\u0628):
1. **\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u062A\u0645\u0648\u0631** \u2014 \u0646\u0633\u062A\u0644\u0645 \u0645\u062D\u0635\u0648\u0644\u0643 \u0645\u0646 \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0632\u0631\u0639\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0623\u0648 \u0645\u0646 \u0646\u0642\u0627\u0637 \u0627\u0644\u062A\u062C\u0645\u064A\u0639.
2. **\u0627\u0644\u062A\u0639\u0642\u064A\u0645** \u2014 \u062A\u0639\u0642\u064A\u0645 \u0627\u0644\u062A\u0645\u0631 \u0644\u0636\u0645\u0627\u0646 \u0633\u0644\u0627\u0645\u062A\u0647.
3. **\u0627\u0644\u0641\u0631\u0632** \u2014 \u0641\u0631\u0632 \u0627\u0644\u062A\u0645\u0631 \u062D\u0633\u0628 \u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u062D\u062C\u0645.
4. **\u0627\u0644\u063A\u0633\u0644 \u0648\u0627\u0644\u062A\u062C\u0641\u064A\u0641** \u2014 \u062A\u0646\u0638\u064A\u0641 \u0627\u0644\u062A\u0645\u0631 \u0648\u062A\u062C\u0641\u064A\u0641\u0647 \u0628\u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u0635\u062D\u064A.
5. **\u0627\u0644\u062A\u0635\u0646\u064A\u0639** \u2014 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062A\u0639\u0628\u0626\u0629 \u0639\u0644\u0649 \u062E\u0637\u0648\u0637 \u0627\u0644\u0625\u0646\u062A\u0627\u062C \u0627\u0644\u062D\u062F\u064A\u062B\u0629 (\u0645\u0639 \u062E\u064A\u0627\u0631\u0627\u062A \u062A\u0639\u0628\u0626\u0629 \u0645\u062A\u0639\u062F\u062F\u0629 \u0648\u0644\u064A\u0628\u0644 \u062E\u0627\u0635 \u0644\u0648 \u062D\u0628\u064A\u062A).
6. **\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629** \u2014 \u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629 \u0628\u0639\u062F \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0623\u0648 \u0627\u0644\u062A\u0635\u0646\u064A\u0639 \u0644\u0645\u0648\u0642\u0639 \u0645\u0632\u0631\u0639\u062A\u0643 \u0623\u0648 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u064A\u0646 \u0645\u0628\u0627\u0634\u0631\u0629\u060C \u0628\u0633\u0647\u0648\u0644\u0629 \u0648\u0633\u0631\u0639\u0629 \u0648\u0645\u0648\u062B\u0648\u0642\u064A\u0629.

#### \u0623\u0646\u0648\u0627\u0639 \u062E\u062F\u0645\u0627\u062A\u0646\u0627 \u0644\u0644\u0639\u0645\u064A\u0644:
- **\u0628\u064A\u0639 \u0628\u0627\u0644\u062C\u0645\u0644\u0629**
- **\u062A\u0635\u0646\u064A\u0639 \u0644\u0644\u063A\u064A\u0631 (Contract Manufacturing)** \u2014 \u0646\u0639\u0628\u0651\u064A/\u0646\u0635\u0646\u0651\u0639 \u0645\u062D\u0635\u0648\u0644\u0643 \u0628\u0627\u0633\u0645\u0643.
- **\u0647\u062F\u0627\u064A\u0627 \u0634\u0631\u0643\u0627\u062A \u0641\u0627\u062E\u0631\u0629**
- **\u0627\u0645\u062A\u064A\u0627\u0632 \u062A\u062C\u0627\u0631\u064A (Franchise)**

#### \u0646\u0642\u0627\u0637 \u0645\u0647\u0645\u0629 \u062A\u0642\u0648\u0644\u0647\u0627 \u0644\u0644\u0639\u0645\u064A\u0644 \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u062D\u0635\u0648\u0644:
- \u0625\u062D\u0646\u0627 \u0634\u0631\u064A\u0643 \u0645\u0633\u062A\u062F\u0627\u0645 \u0644\u0645\u0632\u0627\u0631\u0639\u064A \u0627\u0644\u0646\u062E\u064A\u0644 \u0641\u064A \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A\u060C \u0648\u0628\u0646\u0647\u062A\u0645 \u0628\u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u062D\u0635\u0648\u0644 \u0645\u0646 \u0627\u0644\u0646\u062E\u0644\u0629 \u0644\u0644\u062A\u0639\u0628\u0626\u0629.
- \u0628\u0646\u0648\u0641\u0651\u0631 \u0643\u0645\u0627\u0646 **\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0627\u0644\u0646\u062E\u064A\u0644 \u0648\u0627\u0644\u0625\u0646\u062A\u0627\u062C**: \u0635\u0646\u0627\u062F\u064A\u0642 \u062A\u062E\u0632\u064A\u0646 \u0645\u062A\u064A\u0646\u0629\u060C \u0635\u0646\u0627\u062F\u064A\u0642/\u0635\u0648\u0627\u0646\u064A \u062A\u062C\u0641\u064A\u0641 \u0635\u062D\u064A\u0629\u060C \u0623\u0643\u064A\u0627\u0633 \u0642\u0645\u0627\u0634 \u0623\u0628\u064A\u0636 \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0639\u0630\u0648\u0642\u060C \u0648\u0644\u064A\u0628\u0644\u0627\u062A \u0648\u0635\u0646\u0627\u062F\u064A\u0642 \u0645\u062E\u0635\u0651\u0635\u0629 \u0628\u0627\u0633\u0645 \u0645\u0632\u0631\u0639\u062A\u0643.
- \u0641\u064A\u0647 **\u062F\u0644\u064A\u0644 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0645\u062C\u0627\u0646\u064A (PDF)** \u0645\u0645\u0643\u0646 \u062A\u0631\u0633\u0644\u0647 \u0644\u0644\u0639\u0645\u064A\u0644 \u0644\u0648 \u0637\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0623\u0643\u062A\u0631: https://liwadates.com/wp-content/uploads/2025/09/\u062E\u062F\u0645\u0627\u062A-\u0627\u0644\u062A\u0639\u0628\u0626\u0629.pdf
- **\u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u0623\u0633\u0639\u0627\u0631 \u0623\u0648 \u0645\u062F\u062F \u0644\u0644\u062A\u0639\u0628\u0626\u0629/\u0627\u0644\u062A\u0635\u0646\u064A\u0639** \u2014 \u062F\u064A \u0628\u064A\u062D\u062F\u0651\u062F\u0647\u0627 \u0627\u0644\u0641\u0631\u064A\u0642 \u062D\u0633\u0628 \u0646\u0648\u0639 \u0627\u0644\u0645\u062D\u0635\u0648\u0644 \u0648\u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u061B \u0627\u062C\u0645\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u062D\u0648\u0651\u0644\u0647 \u0644\u0644\u0641\u0631\u064A\u0642.

### \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645
- **\u0627\u0644\u062A\u0648\u0635\u064A\u0644: 3 \u0625\u0644\u0649 5 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644.** **\u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A \u0644\u0644\u0637\u0644\u0628\u0627\u062A \u0641\u0648\u0642 1000 \u062F\u0631\u0647\u0645.**
- \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0645\u0646 \u0627\u0644\u0645\u0635\u0646\u0639: **\u0627\u0644\u0645\u0632\u064A\u0631\u0639\u0629 \u2013 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0638\u0641\u0631\u0629\u060C \u062E\u0644\u0641 \u062C\u0645\u0639\u064A\u0629 \u0627\u0644\u0638\u0641\u0631\u0629 \u0627\u0644\u062A\u0639\u0627\u0648\u0646\u064A\u0629\u060C \u062C\u0646\u0628 \u0645\u0631\u0643\u0632 \u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u062C\u062F\u064A\u062F** (\u0623\u0628\u0648\u0638\u0628\u064A).

### \u0627\u0644\u062A\u0648\u0627\u0635\u0644
- \u0648\u0627\u062A\u0633\u0627\u0628 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646: **\u200E+971 50 117 4085\u200E**
- \u0647\u0627\u062A\u0641 \u0627\u0644\u0645\u0635\u0646\u0639: **\u200E+971 2 882 0300\u200E**
- \u0627\u0644\u0634\u0643\u0627\u0648\u0649 \u0648\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A: **\u200E+971 50 527 0251\u200E**

### \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0637\u0644\u0628 / \u0627\u0644\u0644\u064A\u062F (\u0645\u0647\u0645 \u062C\u062F\u064B\u0627 \u2014 \u0644\u0627 \u062A\u0641\u0648\u0651\u062A \u0623\u064A \u0639\u0645\u064A\u0644)
\u0641\u064A\u0647 \u0646\u0648\u0639\u064A\u0646 \u0645\u0646 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u060C \u0627\u062C\u0645\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 **\u0641\u064A \u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u062D\u062F\u0629**:

**(\u0623) \u0639\u0645\u064A\u0644 \u062E\u062F\u0645\u0629 \u062A\u0639\u0628\u0626\u0629/\u062A\u063A\u0644\u064A\u0641** (\u0639\u0627\u064A\u0632 \u064A\u0639\u0628\u0651\u064A \u062A\u0645\u0631\u0647 \u0639\u0646\u062F\u0646\u0627 \u2014 \xAB\u062A\u0631\u064A\u062F \u062A\u0639\u0628\u0651\u064A \u062A\u0645\u0631\u0643\u061F\xBB):
\u0627\u062C\u0645\u0639 \u0628\u0627\u0644\u0636\u0628\u0637: \xAB\u0627\u0644\u0627\u0633\u0645: / \u0639\u062F\u062F \u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u062A\u0645\u0631 \u0627\u0644\u0644\u064A \u0639\u0646\u062F\u0643: / \u0627\u0644\u0645\u0646\u0637\u0642\u0629: / \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644:\xBB
(\u062F\u064A \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u064A \u0627\u0644\u0645\u0646\u062F\u0648\u0628 \u0645\u062D\u062A\u0627\u062C\u0647\u0627 \u0639\u0634\u0627\u0646 \u064A\u0643\u0644\u0651\u0645\u0647 \u2014 \u0639\u062F\u062F \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u064A\u0639\u0646\u064A \u0643\u0645\u064A\u0629 \u0627\u0644\u062A\u0645\u0631 \u0627\u0644\u0644\u064A \u0647\u064A\u062A\u0639\u0628\u0651\u0649.)

**(\u0628) \u0639\u0645\u064A\u0644 \u0634\u0631\u0627\u0621 \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A** (\u0635\u0646\u0627\u062F\u064A\u0642/\u0643\u0631\u0627\u062A\u064A\u0646/\u0635\u0648\u0627\u0646\u064A):
\u0627\u062C\u0645\u0639: \xAB\u0627\u0644\u0627\u0633\u0645: / \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0643\u0645\u064A\u0629: / \u0627\u0644\u0645\u0646\u0637\u0642\u0629: / \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644:\xBB

\u0641\u064A \u0627\u0644\u062D\u0627\u0644\u062A\u064A\u0646\u060C \u0628\u0639\u062F \u0645\u0627 \u064A\u062F\u0651\u064A\u0643 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A: \u0637\u0645\u0651\u0646\u0647 \u0625\u0646 **\u0645\u0646\u062F\u0648\u0628\u0646\u0627 \u0633\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0647 \u062E\u0644\u0627\u0644 \u062F\u0642\u0627\u0626\u0642**\u060C \u0648\u062D\u064F\u0637 \u0628\u0644\u0648\u0643 [[ORDER]] \u0628\u0643\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u064A \u062C\u0645\u0639\u062A\u0647\u0627 (\u0648\u0648\u0636\u0651\u062D \u0646\u0648\u0639\u0647: \xAB\u062E\u062F\u0645\u0629 \u062A\u0639\u0628\u0626\u0629\xBB \u0623\u0648 \xAB\u0634\u0631\u0627\u0621 \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A\xBB) \u0639\u0634\u0627\u0646 \u064A\u062A\u0633\u062C\u0651\u0644 \u0644\u0644\u0641\u0631\u064A\u0642 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627\u060C \u062B\u0645 \u062D\u0648\u0651\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0644\u0645\u0648\u0638\u0641.
\u062D\u062A\u0649 \u0644\u0648 \u0646\u0642\u0635 \u062A\u0641\u0635\u064A\u0644 \u0628\u0633\u064A\u0637 (\u0645\u062B\u0644\u064B\u0627 \u0627\u0644\u0645\u0646\u0637\u0642\u0629)\u060C \u0633\u062C\u0651\u0644 \u0627\u0644\u0644\u064A \u062C\u0645\u0639\u062A\u0647 \u0641\u064A \u0628\u0644\u0648\u0643 [[ORDER]] \u0639\u0634\u0627\u0646 \u0627\u0644\u0644\u064A\u062F \u0645\u0627\u064A\u0636\u064A\u0639\u0634.
**\u0645\u0647\u0645:** \u062C\u0648\u0651\u0647 \u0628\u0644\u0648\u0643 [[ORDER]] \u0627\u0643\u062A\u0628 \u0628\u0633 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u064A \u062C\u0645\u0639\u062A\u0647\u0627 \u0645\u0646 \u0627\u0644\u0639\u0645\u064A\u0644 \u2014 **\u0645\u0627\u062A\u062D\u0637\u0651\u0634 \u0633\u0639\u0631 \u0625\u062C\u0645\u0627\u0644\u064A \u0648\u0644\u0627 \u0631\u0642\u0645 \u062A\u0648\u0635\u064A\u0644 \u0645\u0646 \u0639\u0646\u062F\u0643 \u0625\u0637\u0644\u0627\u0642\u064B\u0627**. \u0644\u0648 \u062D\u0628\u064A\u062A \u062A\u0646\u0648\u0651\u0647\u060C \u0627\u0643\u062A\u0628 \xAB\u0627\u0644\u0633\u0639\u0631 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644: \u064A\u0624\u0643\u0651\u062F\u0647\u0645\u0627 \u0627\u0644\u0641\u0631\u064A\u0642\xBB.

**\u0644\u0648 \u0633\u0623\u0644 \u0639\u0646 \u062A\u0645\u0631 \u0644\u0644\u0623\u0643\u0644/\u0627\u0644\u062A\u062C\u0632\u0626\u0629 (\u0645\u062C\u062F\u0648\u0644/\u062E\u0644\u0627\u0635/\u0639\u062C\u0648\u0629/\u0643\u0631\u0627\u0646\u0634\u0644\u064A\u2026):** \u0644\u0627 \u062A\u0639\u0637\u064A \u0623\u0633\u0639\u0627\u0631 \u062A\u062C\u0632\u0626\u0629 \u0647\u0646\u0627\u061B \u0642\u0648\u0644 \u0628\u0644\u0637\u0641 \u0625\u0646 \u0627\u0644\u0642\u0646\u0627\u0629 \u062F\u064A \u0645\u062E\u0635\u0635\u0629 \u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0644\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646\u060C \u0648\u0648\u062C\u0651\u0647\u0647 \u0644\u0644\u0645\u0648\u0642\u0639 liwadates.com \u0623\u0648 \u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A\u060C \u0648\u0627\u0631\u062C\u0639 \u0631\u0643\u0651\u0632 \u0639\u0644\u0649 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646.

### \u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 (\u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u0631\u0642\u0645)
\u0645\u0627\u062A\u0642\u0648\u0644\u0634 \u0631\u0642\u0645 \u062A\u0648\u0635\u064A\u0644 \u0645\u062D\u062F\u0651\u062F \u0645\u0646 \u0639\u0646\u062F\u0643. \u0627\u0644\u0642\u0627\u0639\u062F\u0629: **\u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A \u0644\u0644\u0637\u0644\u0628\u0627\u062A \u0641\u0648\u0642 1000 \u062F\u0631\u0647\u0645**\u060C \u0648\u062A\u062D\u062A \u0643\u062F\u0647 **\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0628\u062A\u064F\u062D\u0633\u0628 \u062D\u0633\u0628 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0627\u0644\u0641\u0631\u064A\u0642 \u0628\u064A\u0623\u0643\u0651\u062F\u0647\u0627 \u0639\u0646\u062F \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628**. \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0633\u0623\u0644 \u0639\u0646 \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0628\u0627\u0644\u0636\u0628\u0637\u060C \u0642\u0648\u0644 \u0625\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0647\u064A\u0623\u0643\u0651\u062F\u0647.

### \u26A0\uFE0F \u0644\u0648 \u0645\u0634 \u0639\u0627\u0631\u0641 \u0623\u0648 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u2192 \u062D\u0648\u0651\u0644 \u0644\u0645\u0648\u0638\u0641 \u0641\u0639\u0644\u064A\u064B\u0627 (\u0642\u0627\u0639\u062F\u0629 \u0623\u0633\u0627\u0633\u064A\u0629)
\u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u0633\u0623\u0644 \u0639\u0646 \u0623\u064A \u062D\u0627\u062C\u0629 **\u0645\u0634 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643 \u0641\u0648\u0642** \u2014 \u0632\u064A: \u0631\u0633\u0648\u0645 \u062A\u0648\u0635\u064A\u0644 \u0645\u062D\u062F\u0651\u062F\u0629\u060C \u0623\u062D\u062C\u0627\u0645 \u0623\u0648 \u0645\u0648\u0627\u0635\u0641\u0627\u062A \u0623\u0648 \u0623\u0628\u0639\u0627\u062F \u063A\u064A\u0631 \u0645\u0630\u0643\u0648\u0631\u0629 (\u0632\u064A \u0623\u0643\u064A\u0627\u0633 \u0627\u0644\u0634\u0627\u0634/\u0627\u0644\u0644\u064A\u0628\u0644\u0627\u062A)\u060C \u062A\u0648\u0641\u0651\u0631 \u0643\u0645\u064A\u0629 \u0643\u0628\u064A\u0631\u0629\u060C \u0637\u0644\u0628 \u062A\u0635\u0646\u064A\u0639/\u062A\u0639\u0628\u0626\u0629 \u062E\u0627\u0635 \u0623\u0648 \u0644\u064A\u0628\u0644 \u062E\u0627\u0635\u060C \u0623\u0633\u0639\u0627\u0631 \u062C\u0645\u0644\u0629 \u062E\u0627\u0635\u0629\u060C \u062D\u0627\u0644\u0629/\u062A\u0639\u062F\u064A\u0644 \u0637\u0644\u0628 \u0642\u0627\u0626\u0645\u060C \u0623\u0648 \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0645\u0634 \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0625\u062C\u0627\u0628\u062A\u0647 \u2014 **\u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u0648\u0645\u0627\u062A\u062E\u0645\u0651\u0646\u0634 \u0648\u0645\u0627\u062A\u062F\u064A\u0634 \u0631\u0642\u0645 \u0645\u0646 \u0639\u0646\u062F\u0643**.
\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0635\u062D: \u0627\u0639\u062A\u0630\u0631 \u0628\u0644\u0637\u0641 \u0625\u0646 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u062F\u064A \u0645\u0634 \u0645\u062A\u0648\u0641\u0631\u0629 \u0639\u0646\u062F\u0643\u060C \u0648\u0642\u0648\u0644 \u0644\u0644\u0639\u0645\u064A\u0644 \u0625\u0646\u0643 **\u0628\u062A\u062D\u0648\u0651\u0644\u0647 \u0644\u0623\u062D\u062F \u0645\u0648\u0638\u0641\u064A\u0646\u0627** \u0639\u0634\u0627\u0646 \u064A\u0633\u0627\u0639\u062F\u0647\u060C **\u0648\u062D\u064F\u0637 \u0639\u0644\u0627\u0645\u0629 [[HANDOFF]] \u0641\u064A \u0622\u062E\u0631 \u0631\u062F\u0651\u0643 (\u0625\u062C\u0628\u0627\u0631\u064A)** \u0639\u0634\u0627\u0646 \u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A \u064A\u0643\u0645\u0651\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0639\u0627\u0647 \u0647\u0646\u0627 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0642\u0646\u0627\u0629.
**\u0645\u0647\u0645 \u062C\u062F\u064B\u0627:** \u0645\u0627\u062A\u0643\u062A\u0641\u064A\u0634 \u0628\u0625\u0639\u0637\u0627\u0621 \u0631\u0642\u0645 \u0648\u0627\u062A\u0633\u0627\u0628 \u0623\u0648 \u062A\u0642\u0648\u0644 "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0641\u0631\u064A\u0642" \u0645\u0646 \u063A\u064A\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u2014 \u0644\u0627\u0632\u0645 \u062A\u0637\u0644\u0651\u0639 [[HANDOFF]] \u0641\u0639\u0644\u064A\u064B\u0627. \u0627\u0644\u0623\u0645\u0627\u0646\u0629 \u0648\u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0623\u0647\u0645 \u0645\u0646 \u0625\u0646\u0643 \u062A\u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0643\u0644 \u062D\u0627\u062C\u0629 \u0628\u0646\u0641\u0633\u0643.

\u0627\u0644\u0644\u0647\u062C\u0629: \u0645\u0624\u062F\u0628\u0629 \u0648\u062F\u0627\u0641\u0626\u0629 \u0628\u0631\u0648\u062D \u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646. \u0645\u0627\u062A\u062E\u062A\u0631\u0639\u0634 \u0623\u064A \u0645\u0646\u062A\u062C \u0623\u0648 \u0633\u0639\u0631 \u0645\u0634 \u0645\u0630\u0643\u0648\u0631 \u0641\u0648\u0642.`;
    module2.exports = { FARMER_SYSTEM_PROMPT: FARMER_SYSTEM_PROMPT2 };
  }
});

// webhook-server.js
var express = require("express");
var crypto = require("crypto");
var { loadConfig, whatsappTokenFor } = require_env();
var { createLogger, maskPhone } = require_log();
var { makeRequireAdmin } = require_auth();
var { checkWebhook } = require_signature();
var { buildChannelConfig, resolveChannel, isEmptyConfig } = require_channels();
var { loadPricingConfig } = require_config();
var sheetsLib = require_sheets();
var { fetchSafe } = require_http();
var { buildMessengerCardPayload, buildMessengerCarouselPayload, buildWhatsAppCTAPayload } = require_cards();
var { downloadSafe, DEFAULT_ALLOWED_SUFFIXES } = require_download();
var arabicLib = require_arabic();
var { createDedup } = require_dedup();
var { createRateLimiter, DEFAULT_LIMITS } = require_ratelimit();
var ordersLib = require_orders();
var keys = require_keys();
var takeover = require_takeover();
var { RETAIL_SYSTEM_PROMPT } = require_retail();
var { FARMER_SYSTEM_PROMPT } = require_farmer();
var bootLog = createLogger({ level: (process.env.LOG_LEVEL || "info").toLowerCase(), isProd: String(process.env.NODE_ENV).toLowerCase() === "production" });
var CONFIG;
try {
  CONFIG = loadConfig(process.env, { logger: bootLog });
} catch (e) {
  bootLog.error("fatal_config", { reason: String(e.message) });
  if (require.main === module) process.exit(1);
  throw e;
}
var log = createLogger({ level: CONFIG.LOG_LEVEL, isProd: CONFIG.isProd });
var pricingConfig = loadPricingConfig(process.env);
var channelConfig = buildChannelConfig(CONFIG.allowlists);
if (isEmptyConfig(channelConfig)) {
  log.warn("empty_allowlist_deny_all", { note: "No account IDs configured \u2014 bot will NOT reply to any channel." });
}
var requireAdmin = makeRequireAdmin({ getAdminKey: () => CONFIG.ADMIN_KEY, isProd: CONFIG.isProd, log });
var app = express();
app.use(express.json({ verify: (req, _res, buf) => {
  req.rawBody = buf;
} }));
var ADMIN_PATHS = ["/chat", "/test", "/catalog", "/aidebug", "/feeddebug", "/refresh", "/release", "/admin", "/api/admin", "/api/chat", "/api/transcribe"];
app.use(ADMIN_PATHS, requireAdmin);
app.get("/health", (_req, res) => res.json({ status: "ok", ts: (/* @__PURE__ */ new Date()).toISOString() }));
app.get("/ready", async (_req, res) => {
  const checks = {
    configValid: !!CONFIG,
    openaiConfigured: !!CONFIG.OPENAI_API_KEY,
    metaConfigured: !!(CONFIG.PAGE_ACCESS_TOKEN || CONFIG.WHATSAPP_TOKEN || Object.keys(CONFIG.PAGE_TOKENS || {}).length),
    allowlistConfigured: !isEmptyConfig(channelConfig),
    appSecret: !!CONFIG.APP_SECRET,
    redisConfigured: CONFIG.hasUpstash,
    catalogLoaded: !!liveCatalog
  };
  if (CONFIG.hasUpstash) {
    try {
      await _upstash(["ping"]);
      checks.redisReachable = true;
    } catch {
      checks.redisReachable = false;
    }
  }
  const ready = checks.configValid && checks.openaiConfigured && (!CONFIG.hasUpstash || checks.redisReachable !== false);
  res.status(ready ? 200 : 503).json({ ready, checks });
});
var OPENAI_API_KEY = process.env.OPENAI_API_KEY;
var META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
var PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
var PAGE_TOKENS = {};
try {
  if (process.env.PAGE_TOKENS) PAGE_TOKENS = JSON.parse(process.env.PAGE_TOKENS);
} catch (e) {
  console.error("PAGE_TOKENS JSON parse error:", e.message);
}
function pageTokenFor(id) {
  return id != null && PAGE_TOKENS[String(id)] || PAGE_ACCESS_TOKEN;
}
var WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
var WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
function waTokenFor(phoneId) {
  return whatsappTokenFor(CONFIG, phoneId);
}
var APP_SECRET = process.env.APP_SECRET;
var ADMIN_KEY = CONFIG.ADMIN_KEY;
var AI_MAX_TOKENS = CONFIG.AI_MAX_TOKENS;
var BOT_ENABLED = CONFIG.BOT_ENABLED;
if (!BOT_ENABLED) log.warn("bot_disabled", { note: "BOT_ENABLED=false \u2014 receiving webhooks but sending no replies." });
else log.info("bot_enabled", { note: "BOT_ENABLED=true (default) \u2014 bot is active." });
var ALLOWED_IDS = new Set((process.env.ALLOWED_IDS || "").split(",").map((s) => s.trim()).filter(Boolean));
var IG_ALLOWED_IDS = new Set((process.env.IG_ALLOWED_IDS || "").split(",").map((s) => s.trim()).filter(Boolean));
var WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED !== "false";
var FARMER_IDS = new Set((process.env.FARMER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean));
var ORDERS_SHEET_URL = process.env.ORDERS_SHEET_URL || "";
var FARMER_MODE_TEXT = FARMER_SYSTEM_PROMPT;
var LIWA_BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept": "application/json, text/xml, */*",
  "Accept-Language": "ar,en;q=0.9"
};
async function fetchT(url, opts = {}, ms = 2e4) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  let headers = opts.headers;
  if (String(url).includes("liwadates.com")) {
    headers = { ...LIWA_BROWSER_HEADERS, ...opts.headers || {} };
  }
  try {
    return await fetch(url, { ...opts, headers, signal: c.signal });
  } finally {
    clearTimeout(t);
  }
}
async function fetchCatalog(url, opts = {}, ms = 2e4) {
  let lastErr;
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const res = await fetchT(url, opts, ms);
      if (res.status >= 500 && attempt < 2) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
var AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
var HANDOFF_TAG = "[[HANDOFF]]";
var HANDOFF_MESSAGE = "\u062A\u0645\u0627\u0645\u060C \u0628\u062D\u0648\u0651\u0644\u0643 \u0644\u0623\u062D\u062F \u0645\u0648\u0638\u0641\u064A \u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0647\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u062D\u0627\u0644\u0627\u064B \u{1F64F}\nOne of our team members will assist you shortly. Thank you for your patience \u{1F64F}";
var HANDOFF_KEYWORDS = [
  "\u0645\u0648\u0638\u0641",
  "\u0628\u0634\u0631\u064A",
  "\u062D\u062F \u064A\u0643\u0644\u0645\u0646\u064A",
  "\u0627\u0643\u0644\u0645 \u062D\u062F",
  "\u0623\u0643\u0644\u0645 \u062D\u062F",
  "\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
  "\u0634\u0643\u0648\u0649",
  "\u0627\u0634\u062A\u0643\u064A",
  "\u0645\u062F\u064A\u0631",
  "human",
  "agent",
  "representative",
  "complaint",
  "speak to someone"
];
var ESCALATION_SIGNALS = [
  /505270251/,
  // رقم الشكاوى والاستفسارات المخصص للتصعيد
  /فريق الشكاوى|قسم الشكاوى|الشكاوى والاستفسارات/,
  /بحوّ?لك|أحوّ?لك|راح أحوّ?ل|بأحوّ?ل|هحوّ?لك/
  // وعد صريح بالتحويل
];
var PAGE_INBOX_APP_ID = "263902037430900";
var _memHandoff = /* @__PURE__ */ new Set();
var UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
var UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
var HAS_UPSTASH = !!(UPSTASH_URL && UPSTASH_TOKEN);
async function _upstash(cmd) {
  const res = await fetchT(UPSTASH_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${UPSTASH_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(cmd)
  }, 8e3);
  if (!res.ok) throw new Error("upstash " + res.status);
  return (await res.json()).result;
}
var _memKV = /* @__PURE__ */ new Map();
var _memKVexp = /* @__PURE__ */ new Map();
function _kvAlive(k) {
  const e = _memKVexp.get(k);
  if (e && e < Date.now()) {
    _memKV.delete(k);
    _memKVexp.delete(k);
    return false;
  }
  return _memKV.has(k);
}
var kvStore = {
  async get(k) {
    if (HAS_UPSTASH) {
      try {
        return await _upstash(["get", k]);
      } catch (e) {
        log.warn("kv_get_fail", { err: String(e.message) });
      }
    }
    return _kvAlive(k) ? _memKV.get(k) : null;
  },
  async set(k, v, ttlSec) {
    if (HAS_UPSTASH) {
      try {
        await _upstash(ttlSec ? ["set", k, v, "EX", String(ttlSec)] : ["set", k, v]);
        return;
      } catch (e) {
        log.warn("kv_set_fail", { err: String(e.message) });
      }
    }
    _memKV.set(k, v);
    if (ttlSec) _memKVexp.set(k, Date.now() + ttlSec * 1e3);
  },
  async setNX(k, v, ttlSec) {
    if (HAS_UPSTASH) {
      try {
        const args = ["set", k, v, "NX"];
        if (ttlSec) args.push("EX", String(ttlSec));
        return await _upstash(args) !== null;
      } catch (e) {
        log.warn("kv_setnx_fail", { err: String(e.message) });
      }
    }
    if (_kvAlive(k)) return false;
    _memKV.set(k, v);
    if (ttlSec) _memKVexp.set(k, Date.now() + ttlSec * 1e3);
    return true;
  },
  async del(k) {
    if (HAS_UPSTASH) {
      try {
        await _upstash(["del", k]);
      } catch (e) {
        log.warn("kv_del_fail", { err: String(e.message) });
      }
    }
    _memKV.delete(k);
    _memKVexp.delete(k);
  }
};
var dedup = createDedup(kvStore, { log });
var rateLimiter = createRateLimiter(HAS_UPSTASH ? kvStore : null);
var HANDOFF_TTL = 30 * 24 * 60 * 60;
var handoffState = {
  async has(channel, pageId, senderId) {
    return !!await kvStore.get(keys.handoffKey(channel, pageId, senderId));
  },
  async get(channel, pageId, senderId) {
    const v = await kvStore.get(keys.handoffKey(channel, pageId, senderId));
    if (!v) return null;
    try {
      return JSON.parse(v);
    } catch {
      return { raw: v };
    }
  },
  async set(channel, pageId, senderId, info = {}) {
    const rec = {
      channel,
      pageId: String(pageId || ""),
      senderId: String(senderId),
      time: (/* @__PURE__ */ new Date()).toISOString(),
      reason: info.reason || "handoff",
      appId: info.appId || null
    };
    await kvStore.set(keys.handoffKey(channel, pageId, senderId), JSON.stringify(rec), HANDOFF_TTL);
    _memHandoff.add(String(senderId));
    return rec;
  },
  async clear(channel, pageId, senderId) {
    await kvStore.del(keys.handoffKey(channel, pageId, senderId));
    _memHandoff.delete(String(senderId));
  }
};
var HUMAN_TAKEOVER_ENABLED = CONFIG.HUMAN_TAKEOVER_ENABLED;
var HUMAN_TAKEOVER_TTL_MINUTES = CONFIG.HUMAN_TAKEOVER_TTL_MINUTES;
var HUMAN_TAKEOVER_FAIL_CLOSED = CONFIG.HUMAN_TAKEOVER_FAIL_CLOSED;
var META_APP_ID = CONFIG.META_APP_ID;
var RICH_CARDS_ENABLED = CONFIG.RICH_CARDS_ENABLED;
var TAKEOVER_ECHO_SEEN_TTL = 24 * 60 * 60;
if (HUMAN_TAKEOVER_ENABLED) log.info("human_takeover_enabled", { ttlMinutes: HUMAN_TAKEOVER_TTL_MINUTES, failClosed: HUMAN_TAKEOVER_FAIL_CLOSED, redis: HAS_UPSTASH });
else log.info("human_takeover_disabled", { note: "HUMAN_TAKEOVER_ENABLED=false \u2014 bot behaves as before." });
function hashConvKey(key) {
  return crypto.createHash("sha256").update(String(key)).digest("hex").slice(0, 16);
}
async function takeoverReadStrict(key) {
  if (HAS_UPSTASH) {
    const raw2 = await _upstash(["get", key]);
    return takeover.parseRecord(raw2);
  }
  const raw = _kvAlive(key) ? _memKV.get(key) : null;
  return takeover.parseRecord(raw);
}
async function getInboundTakeoverDecision(channel, accountId, customerId, now) {
  if (!HUMAN_TAKEOVER_ENABLED) return { action: "process", reason: "takeover_disabled" };
  const key = takeover.stateKey(channel, accountId, customerId);
  const dec = await takeover.decideInboundSafe(() => takeoverReadStrict(key), now, {
    ttlMinutes: HUMAN_TAKEOVER_TTL_MINUTES,
    storeConfigured: HAS_UPSTASH,
    failClosed: HUMAN_TAKEOVER_FAIL_CLOSED
  });
  if (dec.reason === "store_error_fail_closed" || dec.reason === "store_error_best_effort") {
    log.error("takeover_state_read_error", { channel, convKey: hashConvKey(key), decision: dec.action });
  }
  return dec;
}
async function isHumanActiveNow(channel, accountId, customerId, now) {
  if (!HUMAN_TAKEOVER_ENABLED) return false;
  const dec = await getInboundTakeoverDecision(channel, accountId, customerId, now);
  return dec.action === "ignore";
}
async function markHumanActive(channel, accountId, customerId, opts = {}) {
  const now = opts.now != null ? opts.now : Date.now();
  const key = takeover.stateKey(channel, accountId, customerId);
  let wasActive = false;
  try {
    const { wasActive: w } = await takeover.setHumanActive(kvStore, {
      channel,
      accountId,
      customerId,
      now,
      ttlMinutes: HUMAN_TAKEOVER_TTL_MINUTES,
      reason: opts.reason || "human_outbound_message",
      humanMessageId: opts.humanMessageId
    });
    wasActive = w;
  } catch (e) {
    log.error("takeover_set_failed", { channel, key: hashConvKey(key), err: String(e && e.message) });
    return;
  }
  const h = hashConvKey(key);
  if (wasActive) log.info("human_takeover_extended", { channel, convKey: h, reason: opts.reason || "human_outbound_message" });
  else log.info("human_takeover_started", { channel, convKey: h, reason: opts.reason || "human_outbound_message" });
}
async function releaseTakeover(channel, accountId, customerId, opts = {}) {
  const now = opts.now != null ? opts.now : Date.now();
  const key = takeover.stateKey(channel, accountId, customerId);
  try {
    await takeover.releaseToBot(kvStore, { channel, accountId, customerId, now, reason: opts.reason || "released" });
  } catch (e) {
    log.error("takeover_release_failed", { channel, key: hashConvKey(key), err: String(e && e.message) });
    return;
  }
  const h = hashConvKey(key);
  if (opts.reason === "ttl_expired") {
    log.info("human_takeover_expired", { channel, convKey: h });
    log.info("bot_reactivated", { channel, convKey: h });
  } else log.info("human_takeover_released", { channel, convKey: h, reason: opts.reason || "released" });
}
async function recordBotSent(id) {
  if (!id) return;
  try {
    await takeover.recordBotSentMessage(kvStore, id, takeover.BOT_SENT_TTL_SEC);
  } catch (e) {
    log.warn("bot_sent_record_fail", { err: String(e && e.message) });
  }
}
async function recordBotSentFromMetaResponse(res) {
  try {
    if (!res || typeof res.json !== "function") return;
    const j = await res.json();
    const id = j && (j.message_id || Array.isArray(j.messages) && j.messages[0] && j.messages[0].id);
    if (id) await recordBotSent(id);
  } catch (e) {
  }
}
async function handleOutboundEcho(channel, pageId, event) {
  const echo = event.message || {};
  const mid = echo.mid;
  const customerId = event.recipient && event.recipient.id;
  if (!customerId) return;
  if (mid) {
    let firstTime = true;
    try {
      firstTime = await kvStore.setNX("takeover_echo_seen:" + mid, "1", TAKEOVER_ECHO_SEEN_TTL);
    } catch (e) {
    }
    if (!firstTime) return;
  }
  let knownBot = false;
  try {
    knownBot = mid ? await takeover.isBotSentMessage(kvStore, mid) : false;
  } catch (e) {
  }
  if (takeover.isBotEcho({ mid, appId: echo.app_id, isKnownBotMid: knownBot }, { botAppId: META_APP_ID })) return;
  await markHumanActive(channel, pageId, customerId, { reason: "human_outbound_message", humanMessageId: mid });
}
var _memHistory = /* @__PURE__ */ new Map();
var HISTORY_MAX = 12;
var HISTORY_TTL = 6 * 60 * 60;
var historyStore = {
  async get(id) {
    if (HAS_UPSTASH) {
      try {
        const v = await _upstash(["get", "liwa_hist:" + id]);
        if (v) return JSON.parse(v);
      } catch (e) {
        console.error("history get:", e.message);
      }
    }
    return _memHistory.get(id) || [];
  },
  async push(id, role, content) {
    const arr = (await this.get(id)).concat([{ role, content }]).slice(-HISTORY_MAX);
    _memHistory.set(id, arr);
    if (HAS_UPSTASH) {
      try {
        await _upstash(["set", "liwa_hist:" + id, JSON.stringify(arr), "EX", String(HISTORY_TTL)]);
      } catch (e) {
        console.error("history push:", e.message);
      }
    }
    return arr;
  },
  async clear(id) {
    _memHistory.delete(id);
    if (HAS_UPSTASH) {
      try {
        await _upstash(["del", "liwa_hist:" + id]);
      } catch (e) {
      }
    }
  }
};
function memKey(channel, pageId, senderId) {
  return keys.convKey(channel, pageId, senderId);
}
var DELETION_CONFIRM_MSG = "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628 \u062D\u0630\u0641 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u2705 \u062D\u0630\u0641\u0646\u0627 \u0630\u0627\u0643\u0631\u0629 \u0645\u062D\u0627\u062F\u062B\u062A\u0643 \u0645\u0646 \u0623\u0646\u0638\u0645\u062A\u0646\u0627.\n\u0645\u0644\u0627\u062D\u0638\u0629 \u0635\u0627\u062F\u0642\u0629: \u0646\u0633\u062E \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629 \u0644\u062F\u0649 Meta (\u0641\u064A\u0633\u0628\u0648\u0643/\u0627\u0646\u0633\u062A\u062C\u0631\u0627\u0645/\u0648\u0627\u062A\u0633\u0627\u0628) \u0623\u0648 Telegram \u0645\u0634 \u0628\u0646\u0642\u062F\u0631 \u0646\u062D\u0630\u0641\u0647\u0627 \u0645\u0646 \u062C\u0627\u0646\u0628\u0646\u0627 \u2014 \u0644\u0644\u062C\u0647\u0627\u062A \u062F\u064A \u0633\u064A\u0627\u0633\u0627\u062A \u062D\u0630\u0641 \u062E\u0627\u0635\u0629 \u062A\u062D\u062A\u0627\u062C \u062A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0647\u0627 \u0645\u0628\u0627\u0634\u0631\u0629.\nWe deleted your conversation memory from our systems. We cannot delete copies held by Meta or Telegram \u2014 please contact them directly.";
async function deleteCustomerData(channel, pageId, senderId) {
  const convId = memKey(channel, pageId, senderId);
  await historyStore.clear(convId);
  await handoffState.clear(channel, pageId, senderId);
  const idHash = crypto.createHash("sha256").update(String(senderId)).digest("hex").slice(0, 16);
  const rec = { channel, pageId: String(pageId || ""), idHash, at: (/* @__PURE__ */ new Date()).toISOString() };
  await kvStore.set(keys.deletionAuditKey(channel, idHash), JSON.stringify(rec), 90 * 24 * 60 * 60);
  log.info("data_deletion", { channel, pageId: String(pageId || ""), idHash });
  return rec;
}
var TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
var TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
var ORDER_OPEN = "[[ORDER]]";
var ORDER_CLOSE = "[[/ORDER]]";
var SYSTEM_PROMPT = RETAIL_SYSTEM_PROMPT;
var STORE_API = "https://liwadates.com/wp-json/wc/store/v1/products";
var FEED_URL = "https://liwadates.com/wp-content/uploads/wpwoof-feed/xml/bot.xml";
var liveCatalog = "";
var liveCatalogUpdatedAt = null;
var productImages = [];
var bestSellers = [];
var feedPrices = {};
function hasArabic(s) {
  return /[؀-ۿ]/.test(s || "");
}
async function refreshFeedPrices() {
  try {
    const res = await fetchCatalog(FEED_URL);
    if (!res.ok) {
      console.error("feed fetch status:", res.status);
      return;
    }
    let buf = Buffer.from(await res.arrayBuffer());
    let xml = buf.toString("utf8");
    if (!xml.includes("<item>")) {
      const zlib = require("zlib");
      for (const fn of [zlib.brotliDecompressSync, zlib.gunzipSync, zlib.inflateSync]) {
        try {
          const d = fn(buf).toString("utf8");
          if (d.includes("<item>")) {
            xml = d;
            break;
          }
        } catch (e) {
        }
      }
    }
    if (!xml.includes("<item>")) {
      console.error("refreshFeedPrices: could not decode feed");
      return;
    }
    const map = {};
    for (const raw of xml.split("<item>").slice(1)) {
      const b = raw.split("</item>")[0];
      const idM = b.match(/<g:id>([\s\S]*?)<\/g:id>/);
      const pM = b.match(/<g:price>([\s\S]*?)<\/g:price>/);
      if (!idM || !pM) continue;
      const id = idM[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/[^0-9]/g, "");
      const price = parseFloat(pM[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/[^0-9.]/g, ""));
      if (id && price) map[id] = price;
    }
    if (Object.keys(map).length) {
      feedPrices = map;
      console.log(`Feed prices loaded: ${Object.keys(map).length}`);
    }
  } catch (e) {
    console.error("refreshFeedPrices failed:", e);
  }
}
var VAT = 1.05;
function priceFor(id, storeMinor, preTax) {
  if (!preTax && id != null && feedPrices[String(id)] != null) return feedPrices[String(id)].toFixed(2);
  if (storeMinor == null) return null;
  const base = Number(storeMinor) / 100;
  return (preTax ? base : base * VAT).toFixed(2);
}
var FARM_TOOL_CAT = /تعبئة المزارع/;
async function fetchAllPages(url) {
  let all = [];
  for (let page = 1; page <= 8; page++) {
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetchCatalog(`${url}${sep}per_page=100&page=${page}`);
    if (!res.ok) break;
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    all = all.concat(arr);
    if (arr.length < 100) break;
  }
  return all;
}
async function refreshCatalog() {
  try {
    await refreshFeedPrices();
    const products = await fetchAllPages(STORE_API);
    const variations = await fetchAllPages(STORE_API + "?type=variation");
    if (products.length === 0) return;
    const byParent = {};
    for (const v of variations) {
      (byParent[v.parent] = byParent[v.parent] || []).push(v);
    }
    const lines = [];
    const seen = /* @__PURE__ */ new Set();
    const imgs = [];
    const parentInfo = {};
    for (const p of products) {
      const name = (p.name || "").trim();
      if (!name || !hasArabic(name) || seen.has(name)) continue;
      seen.add(name);
      const stock = p.is_in_stock === false ? " (\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u062D\u0627\u0644\u064A\u0627\u064B)" : "";
      const link = p.permalink || "";
      const cats = (p.categories || []).map((c) => c.name || "").join(" ");
      const isFarmTool = FARM_TOOL_CAT.test(cats);
      let pricesPart;
      const vars = byParent[p.id];
      if (vars && vars.length) {
        const parts = vars.map((v) => {
          const pr = priceFor(v.id, v.prices && v.prices.price, isFarmTool);
          if (!pr) return null;
          let label = (v.variation || "").replace(/^[^:]*:\s*/, "").trim();
          if (!label) label = v.formatted_weight || "\u062E\u064A\u0627\u0631";
          return `${label} = ${pr} \u062F\u0631\u0647\u0645`;
        }).filter(Boolean);
        pricesPart = parts.length ? parts.join("\u060C ") : "\u0627\u0644\u0633\u0639\u0631 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
      } else {
        const pr = priceFor(p.id, p.prices && p.prices.price, isFarmTool);
        pricesPart = pr ? `${pr} \u062F\u0631\u0647\u0645` : "\u0627\u0644\u0633\u0639\u0631 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
      }
      const img = p.images && p.images[0] && p.images[0].src || "";
      let line = `- ${name}${stock}: ${pricesPart}${isFarmTool ? " (\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u2014 \u062A\u064F\u0636\u0627\u0641 5% \u0639\u0646\u062F \u0627\u0644\u062F\u0641\u0639)" : ""}`;
      if (link) line += ` | \u0627\u0644\u0631\u0627\u0628\u0637: ${link}`;
      if (img) line += ` | \u0635\u0648\u0631\u0629: ${img}`;
      lines.push(line);
      const priceLabel = /غير محدد/.test(pricesPart) ? "" : `${pricesPart}${isFarmTool ? " (\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629)" : ""}`;
      parentInfo[p.id] = { name, img, link, farmTool: isFarmTool, price: priceLabel };
      if (img) {
        const core = name.replace(/^تمر\s+/, "").trim();
        if (core.length >= 4) imgs.push({ core, img, link, primary: true, line: core, price: priceLabel, farmTool: isFarmTool });
      }
    }
    for (const v of variations) {
      const vimg = v.images && v.images[0] && v.images[0].src || "";
      if (!vimg) continue;
      const flavor = (v.variation || "").replace(/^[^:]*:\s*/, "").trim();
      if (!flavor) continue;
      const par = parentInfo[v.parent];
      const base = (par ? par.name : v.name || "").replace(/^تمر\s+/, "").trim();
      const core = `${base} ${flavor}`.trim();
      const vlink = par ? par.link : v.permalink || "";
      const vFarm = par ? !!par.farmTool : false;
      const vpr = priceFor(v.id, v.prices && v.prices.price, vFarm);
      const vprice = vpr ? `${vpr} \u062F\u0631\u0647\u0645${vFarm ? " (\u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629)" : ""}` : par ? par.price : "";
      if (core.length >= 4) imgs.push({ core, img: vimg, link: vlink, primary: false, line: base, price: vprice, farmTool: vFarm });
    }
    if (lines.length) {
      liveCatalog = lines.join("\n");
      productImages = imgs.sort((a, b) => b.core.length - a.core.length);
      liveCatalogUpdatedAt = /* @__PURE__ */ new Date();
      console.log(`Catalog refreshed: ${lines.length} products @ ${liveCatalogUpdatedAt.toISOString()}`);
    }
    try {
      const popRes = await fetchCatalog(STORE_API + "?orderby=popularity&order=desc&per_page=40");
      if (popRes.ok) {
        const pop = await popRes.json();
        const PACK = /صندوق تخزين|كرتون|تخزين|تجفيف|درج|صينية تجفيف|tray|carton|storage|packing|تعبئة|تغليف|مزيرعة|مزرعة|مواد/i;
        const names = [];
        for (const p of Array.isArray(pop) ? pop : []) {
          const nm = (p.name || "").trim();
          if (!nm || !hasArabic(nm) || names.includes(nm)) continue;
          if (p.is_in_stock === false) continue;
          const cats = (p.categories || []).map((c) => c.name || "").join(" ");
          if (/packing|farmer/i.test(cats)) continue;
          if (PACK.test(nm)) continue;
          names.push(nm);
          if (names.length >= 8) break;
        }
        if (names.length) {
          bestSellers = names;
          console.log(`Best sellers: ${names.length}`);
        }
      }
    } catch (e) {
      console.error("bestSellers fetch failed:", e);
    }
    await saveCatalogSnapshot();
  } catch (e) {
    console.error("refreshCatalog failed:", e);
  }
}
async function saveCatalogSnapshot() {
  if (!HAS_UPSTASH || !liveCatalog) return;
  try {
    const snap = JSON.stringify({ liveCatalog, productImages, bestSellers, siteInfo, at: Date.now() });
    await _upstash(["set", "liwa_catalog_snap", snap]);
  } catch (e) {
    console.error("saveCatalogSnapshot:", e.message);
  }
}
async function loadCatalogSnapshot() {
  if (!HAS_UPSTASH || liveCatalog) return false;
  try {
    const v = await _upstash(["get", "liwa_catalog_snap"]);
    if (!v) return false;
    const s = JSON.parse(v);
    if (s.liveCatalog) {
      liveCatalog = s.liveCatalog;
      productImages = s.productImages || [];
      bestSellers = s.bestSellers || [];
      if (s.siteInfo && !siteInfo) siteInfo = s.siteInfo;
      liveCatalogUpdatedAt = new Date(s.at || Date.now());
      console.log("Catalog loaded from snapshot");
      return true;
    }
  } catch (e) {
    console.error("loadCatalogSnapshot:", e.message);
  }
  return false;
}
refreshCatalog();
setInterval(refreshCatalog, 6 * 60 * 60 * 1e3);
var SITE_PAGES = ["faqs", "dates-varieties", "about-us", "business-sector-services", "farmer-services"];
var siteInfo = "";
function stripHtml(html) {
  return (html || "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8211;/g, "\u2013").replace(/&hellip;/g, "\u2026").replace(/&#8217;/g, "'").replace(/&rsquo;/g, "'").replace(/\s+/g, " ").trim();
}
async function refreshSiteInfo() {
  try {
    const parts = [];
    for (const slug of SITE_PAGES) {
      const res = await fetchCatalog(`https://liwadates.com/wp-json/wp/v2/pages?slug=${slug}&_fields=title,content`);
      if (!res.ok) continue;
      const arr = await res.json();
      if (!arr || !arr[0]) continue;
      const title = arr[0].title && arr[0].title.rendered || slug;
      const text = stripHtml(arr[0].content && arr[0].content.rendered).slice(0, 2e3);
      if (text && text.length > 40) parts.push(`### ${title}
${text}`);
    }
    if (parts.length) {
      siteInfo = parts.join("\n\n");
      console.log(`Site info refreshed: ${parts.length} pages`);
    }
  } catch (e) {
    console.error("refreshSiteInfo failed:", e);
  }
}
refreshSiteInfo();
setInterval(refreshSiteInfo, 12 * 60 * 60 * 1e3);
var _refreshing = false;
async function ensureFresh() {
  const sixH = 6 * 60 * 60 * 1e3;
  const stale = !liveCatalogUpdatedAt || Date.now() - liveCatalogUpdatedAt.getTime() > sixH;
  if (_refreshing) return;
  if (stale || !liveCatalog) {
    _refreshing = true;
    try {
      await refreshCatalog();
      if (!siteInfo) await refreshSiteInfo();
    } finally {
      _refreshing = false;
    }
    if (!liveCatalog) await loadCatalogSnapshot();
  }
}
var DEGRADED_NOTE = `

## \u26A0\uFE0F \u0648\u0636\u0639 \u0645\u0624\u0642\u062A \u2014 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 \u0645\u0634 \u0645\u062A\u0627\u062D \u062F\u0644\u0648\u0642\u062A\u064A
\u0645\u0642\u062F\u0631\u062A\u0634 \u062A\u062D\u0645\u0651\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062D\u064A\u0651\u0629. **\u0645\u0645\u0646\u0648\u0639 \u0645\u0646\u0639\u064B\u0627 \u0628\u0627\u062A\u064B\u0627** \u062A\u0642\u0648\u0644 \u0623\u064A \u0633\u0639\u0631 \u0623\u0648 \u062A\u0623\u0643\u0651\u062F \u062A\u0648\u0641\u0651\u0631 \u0645\u0646\u062A\u062C \u0645\u0639\u064A\u0651\u0646 \u0645\u0646 \u0630\u0627\u0643\u0631\u062A\u0643. \u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 (\u0627\u0644\u062A\u0648\u0635\u064A\u0644\u060C \u0627\u0644\u0631\u0633\u0648\u0645 27 \u062F\u0631\u0647\u0645\u060C \u0627\u0644\u0641\u0631\u0648\u0639\u060C \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F\u060C \u0627\u0644\u0633\u064A\u0627\u0633\u0627\u062A) \u0628\u0634\u0643\u0644 \u0637\u0628\u064A\u0639\u064A\u060C \u0648\u0644\u0623\u064A \u0633\u0624\u0627\u0644 \u0639\u0646 \u0633\u0639\u0631 \u0623\u0648 \u062A\u0648\u0641\u0651\u0631 \u0645\u0646\u062A\u062C \u0642\u0648\u0644 \u0628\u0644\u0637\u0641 \u0625\u0646\u0643 \u0628\u062A\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u062D\u062F\u0651\u062B\u0629 \u0648\u0648\u062C\u0651\u0647 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0644\u0645\u0648\u0642\u0639 liwadates.com \u0623\u0648 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 +971545317473.`;
function buildSystemPrompt(mode) {
  const farmer = mode === "farmer" ? FARMER_MODE_TEXT : "";
  if (mode === "farmer") return SYSTEM_PROMPT + farmer;
  if (!liveCatalog) return SYSTEM_PROMPT + DEGRADED_NOTE + farmer;
  let out = SYSTEM_PROMPT + `

## \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u062D\u064A\u0651 (\u0645\u062D\u062F\u0651\u062B \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u2014 \u0644\u0643\u0644 \u0645\u0646\u062A\u062C \u0633\u0639\u0631 \u0643\u0644 \u062D\u062C\u0645 \u0628\u0627\u0644\u0636\u0628\u0637 + \u0631\u0627\u0628\u0637\u0647)
\u0627\u0644\u0623\u0633\u0639\u0627\u0631 **\u0634\u0627\u0645\u0644\u0629 \u0627\u0644\u0636\u0631\u064A\u0628\u0629** \u0648\u0645\u0646 \u0627\u0644\u0641\u064A\u062F \u0627\u0644\u0631\u0633\u0645\u064A \u0644\u0644\u0645\u062A\u062C\u0631. \u0627\u0639\u062A\u0645\u062F \u0639\u0644\u0649 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u062F\u064A \u0641\u0642\u0637. \u0627\u0642\u062A\u0628\u0633 \u0633\u0639\u0631 \u0627\u0644\u062D\u062C\u0645 \u0627\u0644\u0644\u064A \u064A\u0637\u0644\u0628\u0647 \u0627\u0644\u0639\u0645\u064A\u0644 \u062D\u0631\u0641\u064A\u064B\u0627.
**\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0644\u064A\u0646\u0643 (\u0645\u0647\u0645\u0629):** \u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0633\u0623\u0644 \u0639\u0646 \u0645\u0646\u062A\u062C **\u0645\u0639\u064A\u0651\u0646** \u0628\u0627\u0644\u0627\u0633\u0645 (\u0633\u0639\u0631\u0647\u060C \u062A\u0641\u0627\u0635\u064A\u0644\u0647\u060C \u062A\u0648\u0641\u0651\u0631\u0647)\u060C \u062D\u0637 \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u062A\u062C \u062F\u0647 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0641\u064A \u0631\u062F\u0651\u0643 \u0639\u0634\u0627\u0646 \u064A\u0634\u0648\u0641\u0647 \u0648\u064A\u0637\u0644\u0628\u0647. (\u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u062A\u062A\u0628\u0639\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627\u060C \u0645\u0634 \u0644\u0627\u0632\u0645 \u062A\u0643\u062A\u0628 \u0639\u0644\u0627\u0645\u0629 \u0635\u0648\u0631\u0629.)
**\u0645\u0647\u0645 \u062C\u062F\u064B\u0627:** \u0644\u0648 \u0627\u0644\u0633\u0624\u0627\u0644 **\u0645\u0634 \u0639\u0646 \u0645\u0646\u062A\u062C \u0645\u0639\u064A\u0651\u0646** \u2014 \u0632\u064A \u0627\u0644\u062A\u0648\u0635\u064A\u0644\u060C \u0627\u0644\u0634\u062D\u0646\u060C \u0627\u0644\u0631\u0633\u0648\u0645\u060C \u0627\u0644\u0641\u0631\u0648\u0639\u060C \u0627\u0644\u062F\u0641\u0639\u060C \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F\u060C \u0627\u0644\u062A\u062D\u064A\u0629\u060C \u0623\u0648 \u0623\u064A \u0633\u0624\u0627\u0644 \u0639\u0627\u0645 \u2014 **\u0645\u0645\u0646\u0648\u0639 \u062A\u0645\u0627\u0645\u064B\u0627 \u062A\u062D\u0637 \u0623\u064A \u0631\u0627\u0628\u0637 \u0645\u0646\u062A\u062C \u0623\u0648 \u062A\u0630\u0643\u0631 \u0645\u0646\u062A\u062C \u0639\u0634\u0648\u0627\u0626\u064A**. \u062C\u0627\u0648\u0628 \u0639\u0644\u0649 \u0627\u0644\u0633\u0624\u0627\u0644 \u0628\u0633 \u0645\u0646 \u063A\u064A\u0631 \u0623\u064A \u0644\u064A\u0646\u0643 \u0623\u0648 \u0645\u0646\u062A\u062C.
**\u0645\u0647\u0645 \u2014 \u0639\u0646\u062F \u0627\u0644\u0633\u0624\u0627\u0644 \u0639\u0646 "\u0623\u0646\u0648\u0627\u0639" \u0645\u0646\u062A\u062C \u0623\u0648 "\u0643\u0644 \u0623\u0646\u0648\u0627\u0639 X":** \u0628\u0639\u0636 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0644\u064A\u0647\u0627 \u0623\u0643\u062A\u0631 \u0645\u0646 \u0625\u062F\u062E\u0627\u0644 \u0645\u0646\u0641\u0635\u0644 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0628\u0646\u0641\u0633 \u0627\u0644\u0627\u0633\u0645. \u0645\u062B\u0627\u0644: **\u0643\u0631\u0627\u0646\u0634\u0644\u064A** \u0644\u0647 4 \u0623\u0646\u0648\u0627\u0639 \u0645\u0634 \u0627\u062A\u0646\u064A\u0646 \u2014 \u0643\u0631\u0627\u0646\u0634\u0644\u064A \u0628\u0627\u0644\u0645\u0643\u0627\u062F\u064A\u0645\u064A\u0627\u060C \u0643\u0631\u0627\u0646\u0634\u0644\u064A \u0628\u0627\u0644\u0641\u0633\u062A\u0642\u060C **\u0643\u0631\u0627\u0646\u0634\u0644\u064A \u0627\u0644\u0633\u0645\u0633\u0645**\u060C \u0648**\u0643\u0631\u0627\u0646\u0634\u0644\u064A \u0627\u0644\u0641\u0648\u0644 \u0627\u0644\u0633\u0648\u062F\u0627\u0646\u064A \u0648\u0627\u0644\u0643\u0646\u0627\u0641\u0629**. \u0641\u0642\u0628\u0644 \u0645\u0627 \u062A\u0642\u0648\u0644 "\u0639\u0646\u062F\u0646\u0627 \u0646\u0648\u0639\u064A\u0646 \u0628\u0633"\u060C \u062F\u0648\u0651\u0631 \u0641\u064A \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0643\u0644\u0647 \u0639\u0646 **\u0643\u0644** \u0627\u0644\u0625\u062F\u062E\u0627\u0644\u0627\u062A \u0627\u0644\u0644\u064A \u0641\u064A\u0647\u0627 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0630\u0643\u0631\u0647\u0627 \u0643\u0644\u0647\u0627 \u0628\u0623\u0633\u0639\u0627\u0631\u0647\u0627.
` + liveCatalog;
  if (bestSellers.length) {
    out += `

## \u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u064B\u0627 \u0639\u0646\u062F\u0646\u0627 (\u0645\u0631\u062A\u0651\u0628\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0627\u0644\u0641\u0639\u0644\u064A\u0629 \u2014 \u0645\u062D\u062F\u0651\u062B\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627)
` + bestSellers.map((n, i) => `${i + 1}) ${n}`).join("\n") + `

**\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u062A\u0631\u0634\u064A\u062D:** \u0644\u0645\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u064A\u0633\u0623\u0644 "\u0634\u0648 \u0623\u0643\u062B\u0631 \u0634\u064A \u0645\u0628\u064A\u0639\u064B\u0627\u061F" \u0623\u0648 "\u0634\u0648 \u062A\u0646\u0635\u062D\u0646\u064A\u061F" \u0623\u0648 "\u0623\u0641\u0636\u0644 \u0645\u0646\u062A\u062C\u0627\u062A\u0643\u0645\u061F" \u0623\u0648 "\u0627\u0644\u0623\u0643\u062B\u0631 \u0634\u0639\u0628\u064A\u0629\u061F"\u060C \u0627\u0639\u0631\u0636 **\u0645\u0646 3 \u0644\u0640 5 \u0645\u0646\u062A\u062C\u0627\u062A** \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0643\u062B\u0631 \u0645\u0628\u064A\u0639\u064B\u0627 \u062F\u064A (\u0645\u0634 \u0645\u0646\u062A\u062C \u0648\u0627\u062D\u062F\u060C \u0648\u0645\u0634 \u062A\u0645\u0631 \u0627\u0644\u0645\u062C\u062F\u0648\u0644 \u0628\u0634\u0643\u0644 \u0627\u0641\u062A\u0631\u0627\u0636\u064A)\u060C \u0628\u062A\u0631\u062A\u064A\u0628\u0647\u0627\u060C \u0645\u0639 \u0633\u0639\u0631 \u0643\u0644 \u0648\u0627\u062D\u062F \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0648\u0633\u0624\u0627\u0644 \u0625\u063A\u0644\u0627\u0642. \u0644\u0648 \u0627\u0644\u0639\u0645\u064A\u0644 \u062D\u062F\u0651\u062F \u0645\u0646\u0627\u0633\u0628\u0629/\u0641\u0626\u0629 (\u0636\u064A\u0627\u0641\u0629\u060C \u0647\u062F\u064A\u0629\u060C \u064A\u0648\u0645\u064A)\u060C \u0631\u062C\u0651\u062D \u0627\u0644\u0623\u0646\u0633\u0628 \u0645\u0646\u0647\u0627.`;
  }
  if (siteInfo) {
    out += `

## \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0645\u0646 \u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 (\u0645\u062D\u062F\u0651\u062B\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u2014 \u0627\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0644\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0646 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0639\u0627\u0645\u0629)
${siteInfo}`;
  }
  out += farmer;
  return out;
}
async function openaiReply(history, mode) {
  await ensureFresh();
  try {
    const res = await fetchSafe("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        messages: [{ role: "system", content: buildSystemPrompt(mode) }, ...history]
      })
    }, { timeoutMs: 3e4, retries: 2, log });
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content || "";
    }
    log.error("openai_no_choices");
    return null;
  } catch (e) {
    log.error("openai_failed", { err: String(e.message) });
    return null;
  }
}
var IMG_STOPWORDS = /* @__PURE__ */ new Set([
  "\u062A\u0645\u0631",
  "\u062A\u0645\u0648\u0631",
  "\u0631\u0637\u0628",
  "\u0637\u0627\u0632\u062C",
  "\u0637\u0627\u0632\u0647",
  "\u0639\u0644\u0628\u0647",
  "\u0639\u0644\u0628\u0629",
  "\u0643\u0628\u064A\u0631",
  "\u0635\u063A\u064A\u0631",
  "\u0648\u0632\u0646",
  "\u062F\u0631\u0647\u0645",
  "\u0645\u063A\u0644\u0641",
  "\u0633\u0627\u062F\u0647",
  "\u0635\u0646\u062F\u0648\u0642",
  "\u0647\u062F\u0627\u064A\u0627",
  "\u0647\u062F\u064A\u0647",
  "\u0635\u064A\u0646\u064A\u0647",
  "\u0631\u0642\u0627\u0626\u0642",
  "\u0644\u064A\u0648\u0627",
  "\u0645\u062C\u0645\u0648\u0639\u0647",
  "\u0628\u0648\u0643\u0633",
  "\u0646\u0648\u0639",
  "\u0627\u0644\u062D\u0634\u0648",
  "\u062D\u0634\u0648",
  "\u0627\u0644\u062D\u062C\u0645",
  "\u062D\u062C\u0645"
]);
function normAr(s) {
  return (s || "").replace(/ـ/g, "").replace(/[أإآ]/g, "\u0627").replace(/ة/g, "\u0647").replace(/ى/g, "\u064A").replace(/(^|\s)ال/g, "$1");
}
function distinctiveTokens(core) {
  const toks = normAr(core).split(/\s+/).filter((w) => w.length >= 3 && !IMG_STOPWORDS.has(w));
  return [...new Set(toks)];
}
function replyWordSet(text) {
  const t = normAr(text);
  const words = t.split(/[^ء-ي0-9]+/).filter(Boolean);
  const set = /* @__PURE__ */ new Set();
  for (const w of words) {
    set.add(w);
    const s = w.replace(/^(وال|فال|بال|كال|لل|ال|و|ف|ب|ك|ل)/, "");
    if (s && s !== w) set.add(s);
  }
  return set;
}
function deterministicImages(text, lenient) {
  if (!text || !productImages || !productImages.length) return [];
  const words = replyWordSet(text);
  const LINE_GENERIC = /* @__PURE__ */ new Set(["\u0641\u0627\u062E\u0631", "\u0641\u0627\u062E\u0631\u0647"]);
  const prods = productImages.map((p) => ({ p, toks: distinctiveTokens(p.core), line: p.line || p.core }));
  const df = {};
  for (const { toks } of prods) for (const w of new Set(toks)) df[w] = (df[w] || 0) + 1;
  const scored = prods.map((x) => ({ p: x.p, line: x.line, matched: x.toks.filter((w) => words.has(w)) })).filter((x) => x.matched.length);
  if (!scored.length) return [];
  const cap = lenient ? 5 : 3;
  const out = [], seen = /* @__PURE__ */ new Set(), coveredLines = /* @__PURE__ */ new Set();
  const exactTokens = /* @__PURE__ */ new Set();
  let hadExact = false;
  const uniques = scored.filter((s) => s.matched.some((w) => df[w] === 1)).sort((a, b) => b.matched.length - a.matched.length);
  for (const s of uniques) {
    if (seen.has(s.p.img)) continue;
    out.push(s.p);
    seen.add(s.p.img);
    coveredLines.add(s.line);
    s.matched.forEach((w) => exactTokens.add(w));
    hadExact = true;
    if (out.length >= cap) return out;
  }
  if (!lenient) {
    if (out.length) return out;
    const distinctify = (s) => s.matched.filter((w) => !LINE_GENERIC.has(w));
    const cand = scored.filter((s) => distinctify(s).length);
    if (!cand.length) return [];
    const bestScore = cand.reduce((m, s) => Math.max(m, distinctify(s).length), 0);
    const top = cand.filter((s) => distinctify(s).length === bestScore);
    const heads = new Set(top.map((s) => distinctify(s).slice().sort((a, b) => df[a] - df[b])[0]));
    if (heads.size !== 1) return [];
    const prims = top.filter((s) => s.p.primary);
    const pool = (prims.length ? prims : top).slice().sort((a, b) => a.p.core.length - b.p.core.length);
    return pool[0] ? [pool[0].p] : [];
  }
  const groups = {};
  for (const s of scored) {
    if (coveredLines.has(s.line)) continue;
    const distinctive = s.matched.filter((w) => !LINE_GENERIC.has(w));
    if (!distinctive.length) continue;
    if (hadExact && distinctive.every((w) => exactTokens.has(w))) continue;
    const key = distinctive.slice().sort((a, b) => df[a] - df[b])[0];
    (groups[key] = groups[key] || []).push(s);
  }
  for (const key of Object.keys(groups)) {
    if (out.length >= cap) break;
    const g = groups[key];
    if (g.some((s) => seen.has(s.p.img))) continue;
    const prims = g.filter((s) => s.p.primary);
    const pool = (prims.length ? prims : g).slice().sort((a, b) => a.p.core.length - b.p.core.length);
    const pick = pool[0];
    if (pick && !seen.has(pick.p.img)) {
      out.push(pick.p);
      seen.add(pick.p.img);
    }
  }
  return out.slice(0, cap);
}
var IMG_INTENT = /صور[ةه]?|بالصوره|picture|image|photo/i;
var NON_PRODUCT_TOPIC = /توصيل|الشحن|شحن|فرع|فروع|مواعيد|ساعات العمل|استرجاع/;
var UNAVAILABLE_HINT = /مش متوفر|غير متوفر|مش موجود|مش من منتجاتنا|مو متوفر|مو موجود|نفد|خلص المخزون|not available|out of stock|unavailable|don'?t have|do not have/i;
var SUPPLY_NAME = /تخزين|تجفيف|صيني[ةه]|كرتون|صندوق تخزين|شاش|ليبل|تغليف|تعبئة|بالي?ت|شبك/;
var RETAIL_DATE_NAME = /مجدول|خلاص|عجو[ةه]|صقعي|خضري|سكري|دبس|معجون|مكسرات|كرانشلي|شوكولا|مملّ?ح|محشي|رطب برحي|برحي طازج|علب[ةه] هدايا|ضيافة|هدايا/;
function isRetailDateProduct(entry) {
  const c = String(entry && entry.core || "");
  if (!c) return false;
  if (SUPPLY_NAME.test(c)) return false;
  return RETAIL_DATE_NAME.test(c);
}
function autoProductEntries(text, existing) {
  if (!text) return [];
  if (UNAVAILABLE_HINT.test(text) && !(existing && existing.length)) return [];
  const explicit = existing && existing.length || IMG_INTENT.test(text);
  if (!explicit && NON_PRODUCT_TOPIC.test(text)) return [];
  const matches = deterministicImages(text, explicit);
  if (explicit) return matches;
  return matches;
}
function addUtm(url, source) {
  try {
    if (/\.(webp|jpe?g|png|gif|svg)(\?|#|$)/i.test(url)) return url;
    if (/[?&]utm_source=/i.test(url)) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}utm_source=${encodeURIComponent(source || "chatbot")}&utm_medium=ai_agent&utm_campaign=liwa_chatbot`;
  } catch (e) {
    return url;
  }
}
function utmizeText(text, source) {
  if (!text) return text;
  return text.replace(/https?:\/\/liwadates\.com\/[^\s<>"')]+/gi, (u) => {
    let trail = "";
    const m = u.match(/[.,،؛!؟)]+$/);
    if (m) {
      trail = m[0];
      u = u.slice(0, -trail.length);
    }
    return addUtm(u, source) + trail;
  });
}
function extractPriceLine(text) {
  if (!text) return "";
  for (const raw of String(text).split(/\n+/)) {
    if (/درهم|درهماً|\baed\b|\bdhs?\b/i.test(raw)) {
      const t = raw.replace(/^[\s\-•*×]+/, "").trim();
      if (t) return t;
    }
  }
  return "";
}
function priceLineFor(text, core) {
  if (!text || !core) return "";
  const tokens = String(core).split(/\s+/).filter((w) => w.length >= 3);
  if (!tokens.length) return "";
  let best = "";
  let bestScore = 0;
  for (const raw of String(text).split(/\n+/)) {
    if (!/درهم|درهماً|\baed\b|\bdhs?\b/i.test(raw)) continue;
    const score = tokens.reduce((n, t) => n + (raw.includes(t) ? 1 : 0), 0);
    if (score > bestScore) {
      const t = raw.replace(/^[\s\-•*×]+/, "").trim();
      if (t) {
        best = t;
        bestScore = score;
      }
    }
  }
  return best;
}
function stripProductLink(text, base) {
  if (!text) return "";
  let out = String(text);
  if (base) {
    const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(esc + "\\S*", "g"), "");
  }
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function parseReply(raw, source, mode) {
  let text = raw || "";
  let order = null;
  const oStart = text.indexOf(ORDER_OPEN);
  const oEnd = text.indexOf(ORDER_CLOSE);
  if (oStart !== -1 && oEnd !== -1 && oEnd > oStart) {
    order = text.slice(oStart + ORDER_OPEN.length, oEnd).trim();
    text = (text.slice(0, oStart) + text.slice(oEnd + ORDER_CLOSE.length)).trim();
  } else if (oStart !== -1) {
    order = text.slice(oStart + ORDER_OPEN.length).trim() || "(\u0628\u0644\u0648\u0643 \u0623\u0648\u0631\u062F\u0631 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644 \u2014 \u0631\u0627\u062C\u0639 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629)";
    text = text.slice(0, oStart).trim();
  }
  let handoff = text.includes(HANDOFF_TAG);
  text = text.replace(HANDOFF_TAG, "").trim();
  const images = [];
  text = text.replace(/\[\[IMG:\s*(https?:\/\/[^\]\s]+?)\s*\]\]/g, (m, u) => {
    if (/^https:\/\/liwadates\.com\/wp-content\//i.test(u) && !images.includes(u)) images.push(u);
    return "";
  }).trim();
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1: $2").replace(/\*\*/g, "").replace(/__/g, "").replace(/^\s*#{1,6}\s*/gm, "").replace(/`/g, "").trim();
  text = text.replace(/\[\[\s*\/?\s*ORDER\s*\]\]/gi, "").replace(/\[\[\s*HANDOFF\s*\]\]/gi, "").replace(/\[\[\s*IMG\s*:[^\]]*\]?\]?/gi, "").replace(/\[\[[^\]]*$/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!handoff && ESCALATION_SIGNALS.some((re) => re.test(text))) handoff = true;
  text = utmizeText(text, source);
  if (!text) {
    if (order) text = "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0637\u0644\u0628\u0643 \u{1F334} \u0627\u0644\u0641\u0631\u064A\u0642 \u0631\u0627\u062D \u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0648\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0646\u0647\u0627\u0626\u064A. \u0639\u0633\u0627\u0643 \u0628\u062E\u064A\u0631!";
    else if (handoff) text = "\u0644\u062D\u0638\u0627\u062A \u0645\u0646 \u0641\u0636\u0644\u0643 \u2014 \u0628\u062D\u0648\u0651\u0644\u0643 \u0644\u0623\u062D\u062F \u0645\u0648\u0638\u0641\u064A\u0646\u0627 \u0648\u0631\u0627\u062D \u064A\u0633\u0627\u0639\u062F\u0643 \u062D\u0627\u0644\u0627\u064B \u{1F64F}";
    else if (images.length) text = "\u062A\u0641\u0636\u0651\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u{1F334}";
  }
  let entries = autoProductEntries(text, images);
  if (mode === "farmer") entries = entries.filter((e) => !isRetailDateProduct(e));
  const finalImages = entries.map((e) => e.img).filter(Boolean);
  let product = null;
  let products = [];
  const linked = entries.filter((e) => e.link);
  if (linked.length) {
    products = linked.map((e) => ({
      title: e.core || "",
      // السعر: من نص الرد لو الموديل كتبه، وإلا من الكتالوج (عشان الكارت دايمًا يوريّ سعر).
      subtitle: priceLineFor(text, e.core) || e.price || (linked.length === 1 ? extractPriceLine(text) : ""),
      imageUrl: e.img || "",
      url: addUtm(e.link, source)
    }));
    if (linked.length === 1) {
      const e0 = linked[0];
      const base = e0.link.split("?")[0];
      const productUrl = products[0].url;
      product = {
        ...products[0],
        // كابشن الكارت = رد الموديل بدون تكرار اللينك (الزر بيوفّره)
        caption: stripProductLink(text, base)
      };
      if (text.indexOf(base) === -1) text += `
${productUrl}`;
    }
  }
  return { text, handoff, order, images: finalImages, product, products };
}
async function transcribeAudio(buffer, filename, mime) {
  try {
    const fd = new FormData();
    fd.append("file", new Blob([buffer], { type: mime || "audio/ogg" }), filename || "audio.ogg");
    fd.append("model", "whisper-1");
    const res = await fetchSafe("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd
    }, { timeoutMs: 3e4, retries: 1, log });
    const data = await res.json();
    return (data.text || "").trim() || null;
  } catch (e) {
    log.error("transcribe_failed", { err: String(e.message) });
    return null;
  }
}
var MEDIA_ALLOWED_SUFFIXES = DEFAULT_ALLOWED_SUFFIXES.concat(["fbsbx.com", "cdninstagram.com"]);
var MEDIA_MAX_BYTES = 16 * 1024 * 1024;
var MEDIA_AUDIO_TYPES = [/^audio\//, /^video\//, /^application\/octet-stream$/];
var MEDIA_ANY_TYPES = [/^audio\//, /^video\//, /^image\//, /^application\/octet-stream$/];
async function downloadWhatsAppMedia(mediaId, fromPhoneId) {
  const token = waTokenFor(fromPhoneId);
  try {
    const infoRes = await fetchSafe(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { authorization: `Bearer ${token}` }
    }, { timeoutMs: 15e3, log });
    const info = await infoRes.json();
    if (!info.url) return null;
    const { buffer, contentType } = await downloadSafe(info.url, {
      headers: { authorization: `Bearer ${token}` },
      allowedTypes: MEDIA_AUDIO_TYPES,
      allowedSuffixes: MEDIA_ALLOWED_SUFFIXES,
      maxBytes: MEDIA_MAX_BYTES,
      timeoutMs: 2e4
    });
    return { buffer, mime: contentType || info.mime_type || "audio/ogg" };
  } catch (e) {
    log.error("download_wa_media_failed", { err: String(e.message) });
    return null;
  }
}
async function downloadUrl(url) {
  try {
    const { buffer } = await downloadSafe(url, {
      allowedTypes: MEDIA_ANY_TYPES,
      allowedSuffixes: MEDIA_ALLOWED_SUFFIXES,
      maxBytes: MEDIA_MAX_BYTES,
      timeoutMs: 2e4
    });
    return buffer;
  } catch (e) {
    log.error("download_url_failed", { err: String(e.message) });
    return null;
  }
}
async function askAI(userMessage, source, convId, mode) {
  try {
    let history;
    if (convId) history = await historyStore.push(convId, "user", userMessage);
    else history = [{ role: "user", content: userMessage }];
    const raw = await openaiReply(history, mode);
    if (raw === null) return { text: "\u0645\u0639\u0644\u0634 \u062D\u0635\u0644 \u062E\u0637\u0623 \u0628\u0633\u064A\u0637\u060C \u0645\u0645\u0643\u0646 \u062A\u0628\u0639\u062A \u062A\u0627\u0646\u064A\u061F", handoff: false, order: null };
    const parsed = parseReply(raw, source, mode);
    if (mode === "farmer" && !parsed.handoff && parsed.text) {
      if (arabicLib.isFarmerHandoffReply(parsed.text)) parsed.handoff = true;
    }
    if (convId && parsed.text) await historyStore.push(convId, "assistant", parsed.text);
    return parsed;
  } catch (e) {
    console.error("askAI failed:", e);
    return { text: "\u0645\u0639\u0644\u0634 \u062D\u0635\u0644 \u062E\u0637\u0623 \u0628\u0633\u064A\u0637\u060C \u0645\u0645\u0643\u0646 \u062A\u0628\u0639\u062A \u062A\u0627\u0646\u064A\u061F", handoff: false, order: null };
  }
}
async function logOrder({ order, channel, customerId, mode }) {
  if (!ORDERS_SHEET_URL) {
    log.info("orders_sheet_url_missing", { note: "order not logged to sheet" });
    return;
  }
  const payload = {
    time: (/* @__PURE__ */ new Date()).toISOString(),
    channel: channel || "",
    mode: mode || "",
    customer: String(customerId || ""),
    order: String(order || "")
  };
  const val = sheetsLib.validateOrderPayload({ notes: payload.order, customer_name: payload.customer });
  if (!val.ok) {
    log.warn("order_payload_rejected", { errors: val.errors.join(",") });
    return;
  }
  try {
    let headers, bodyStr;
    if (CONFIG.GOOGLE_SHEETS_WEBHOOK_SECRET) {
      const signed = sheetsLib.signPayload(payload, CONFIG.GOOGLE_SHEETS_WEBHOOK_SECRET);
      headers = signed.headers;
      bodyStr = signed.body;
    } else {
      if (CONFIG.isProd) log.warn("sheets_unsigned_in_prod", { note: "set GOOGLE_SHEETS_WEBHOOK_SECRET" });
      headers = { "content-type": "application/json" };
      bodyStr = JSON.stringify(sheetsLib.sanitizeObject(payload));
    }
    await fetchSafe(ORDERS_SHEET_URL, { method: "POST", headers, body: bodyStr }, { timeoutMs: 8e3, retries: 2, log });
  } catch (e) {
    log.error("log_order_failed", { err: String(e.message) });
  }
}
async function notifyOwner(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    log.warn("telegram_not_configured", { note: "order alert skipped (no customer data logged)" });
    return;
  }
  try {
    await fetchSafe(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
      },
      { timeoutMs: 8e3, retries: 2, log }
    );
  } catch (e) {
    log.error("notify_owner_failed", { err: String(e.message) });
  }
}
function wantsHuman(text) {
  return arabicLib.containsKeyword(text, HANDOFF_KEYWORDS) || arabicLib.isReturnOrComplaint(text);
}
var ESCALATION_KEYWORDS = [
  "\u0645\u062A\u0623\u062E\u0631",
  "\u0645\u062A\u0627\u062E\u0631",
  "\u0645\u0627 \u0648\u0635\u0644",
  "\u0645\u0627\u0648\u0635\u0644",
  "\u0644\u0633\u0647 \u0645\u0627",
  "\u062A\u0627\u0644\u0641",
  "\u0628\u0627\u064A\u0638",
  "\u0641\u0627\u0633\u062F",
  "\u063A\u0644\u0637",
  "\u0645\u0648 \u0627\u0644\u0644\u064A \u0637\u0644\u0628\u062A",
  "\u0645\u062A\u0639\u0641\u0646",
  "\u0639\u0641\u0646",
  "\u062F\u0648\u062F",
  "\u0633\u0648\u0633",
  "\u0631\u064A\u062D\u0629",
  "\u062E\u0631\u0628\u0627\u0646",
  "\u0639\u0637\u0644\u0627\u0646",
  "\u0645\u0646\u062A\u0647\u064A",
  "\u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629",
  "\u0627\u0633\u062A\u0631\u062C",
  "\u0627\u0633\u062A\u0628\u062F\u0644",
  "\u0627\u0631\u062C\u0627\u0639",
  "\u0631\u064A\u0641\u0646\u062F",
  "\u0634\u0643\u0648\u0649",
  "\u0627\u0634\u062A\u0643\u064A",
  "\u0645\u062A\u0636\u0627\u064A\u0642",
  "\u0632\u0639\u0644\u0627\u0646",
  "\u0627\u062A\u062E\u0635\u0645",
  "\u062E\u0635\u0645 \u0645\u0628\u0644\u063A",
  "\u0643\u0645\u064A\u0629 \u0643\u0628\u064A\u0631\u0629",
  "\u0643\u0645\u064A\u0627\u062A \u0643\u0628\u064A\u0631\u0629",
  "\u0628\u0627\u0644\u062C\u0645\u0644\u0629",
  "\u062C\u0645\u0644\u0647",
  "\u062C\u0645\u0644\u0629",
  "\u062A\u0648\u0632\u064A\u0639",
  "\u062A\u0635\u062F\u064A\u0631",
  "\u0641\u0627\u062A\u0648\u0631\u0629",
  "\u0634\u0631\u0643\u0629",
  "\u0634\u0631\u0643\u062A\u064A",
  "\u0644\u0634\u0631\u0643\u062A\u064A",
  "\u0644\u0644\u0634\u0631\u0643\u0627\u062A",
  "\u0644\u0644\u0634\u0631\u0643\u0629",
  "refund",
  "return",
  "damaged",
  "wrong item",
  "late",
  "delayed",
  "hasn't arrived",
  "bulk",
  "wholesale",
  "corporate",
  "invoice",
  "complaint"
];
function needsEscalation(text) {
  return arabicLib.isReturnOrComplaint(text) || arabicLib.containsKeyword(text, ESCALATION_KEYWORDS);
}
function extractPhone(s) {
  const m = (s || "").replace(/[\s-]/g, "").match(/(\+?9715\d{8}|05\d{8}|5\d{8}|\d{9,12})/);
  return m ? m[0] : null;
}
var ORDER_INTENT = /طلب|اطلب|أطلب|ابي|أبي|ابغى|أبغى|عايز|عاوز|علبة|علب|كيلو|كجم|احجز|أحجز|توصيل|وصلو|اطلبه|أطلبه|order|deliver|buy|want/i;
function detectOrder(history) {
  const users = (history || []).filter((m) => m && m.role === "user");
  if (!users.length) return null;
  const last = users[users.length - 1];
  const phone = extractPhone(last.content);
  if (!phone) return null;
  const all = users.map((u) => u.content).join(" ");
  if (!ORDER_INTENT.test(all)) return null;
  return "\u26A0\uFE0F \u0637\u0644\u0628 \u0645\u062D\u062A\u0645\u0644 (\u0627\u062A\u0643\u0634\u0641 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u0645\u0646 \u0631\u0642\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u2014 \u0627\u0644\u0645\u0648\u062F\u064A\u0644 \u0645\u0627\u0637\u0644\u0651\u0639\u0634 \u062A\u0623\u0643\u064A\u062F \u0631\u0633\u0645\u064A\u060C \u0631\u0627\u062C\u0639\u0647):\n" + users.slice(-6).map((u) => "\u2022 " + u.content).join("\n");
}
var META_GRAPH = "https://graph.facebook.com/v21.0";
function metaHeaders(token) {
  return { "content-type": "application/json", authorization: `Bearer ${token || PAGE_ACCESS_TOKEN}` };
}
async function sendMessenger(recipientId, text, pageId) {
  const res = await fetchSafe(`${META_GRAPH}/me/messages`, {
    method: "POST",
    headers: metaHeaders(pageTokenFor(pageId)),
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
  }, { timeoutMs: 15e3, retries: 2, log });
  await recordBotSentFromMetaResponse(res);
}
async function sendMessengerImage(recipientId, url, pageId) {
  try {
    const res = await fetchSafe(`${META_GRAPH}/me/messages`, {
      method: "POST",
      headers: metaHeaders(pageTokenFor(pageId)),
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { attachment: { type: "image", payload: { url, is_reusable: true } } }
      })
    }, { timeoutMs: 15e3, retries: 1, log });
    await recordBotSentFromMetaResponse(res);
  } catch (e) {
    log.error("send_messenger_image_failed", { err: String(e.message) });
  }
}
async function sendMessengerCard(recipientId, product, pageId) {
  const body = buildMessengerCardPayload(recipientId, product);
  const res = await fetchSafe(`${META_GRAPH}/me/messages`, {
    method: "POST",
    headers: metaHeaders(pageTokenFor(pageId)),
    body: JSON.stringify(body)
  }, { timeoutMs: 15e3, retries: 2, log });
  await recordBotSentFromMetaResponse(res);
}
async function sendMessengerCarousel(recipientId, products, pageId) {
  const body = buildMessengerCarouselPayload(recipientId, products);
  const res = await fetchSafe(`${META_GRAPH}/me/messages`, {
    method: "POST",
    headers: metaHeaders(pageTokenFor(pageId)),
    body: JSON.stringify(body)
  }, { timeoutMs: 15e3, retries: 2, log });
  await recordBotSentFromMetaResponse(res);
}
async function passToHuman(senderId, pageId) {
  try {
    await fetchSafe(`${META_GRAPH}/me/pass_thread_control`, {
      method: "POST",
      headers: metaHeaders(pageTokenFor(pageId)),
      body: JSON.stringify({
        recipient: { id: senderId },
        target_app_id: PAGE_INBOX_APP_ID,
        metadata: "handoff by AI agent"
      })
    }, { timeoutMs: 15e3, retries: 2, log });
    return true;
  } catch (e) {
    log.error("pass_thread_control_failed", { err: String(e.message) });
    return false;
  }
}
async function takeThreadControl(senderId, pageId) {
  try {
    await fetchSafe(`${META_GRAPH}/me/take_thread_control`, {
      method: "POST",
      headers: metaHeaders(pageTokenFor(pageId)),
      body: JSON.stringify({
        recipient: { id: senderId },
        metadata: "release by admin"
      })
    }, { timeoutMs: 15e3, retries: 2, log });
    return true;
  } catch (e) {
    log.error("take_thread_control_failed", { err: String(e.message) });
    return false;
  }
}
async function sendWhatsApp(to, text, fromPhoneId) {
  const phoneId = fromPhoneId || WHATSAPP_PHONE_ID;
  const res = await fetchSafe(`${META_GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${waTokenFor(fromPhoneId)}` },
    body: JSON.stringify({ messaging_product: "whatsapp", to, text: { body: text } })
  }, { timeoutMs: 15e3, retries: 2, log });
  await recordBotSentFromMetaResponse(res);
}
async function sendWhatsAppImage(to, url, fromPhoneId) {
  try {
    const phoneId = fromPhoneId || WHATSAPP_PHONE_ID;
    const res = await fetchSafe(`${META_GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${waTokenFor(fromPhoneId)}` },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "image", image: { link: url } })
    }, { timeoutMs: 15e3, retries: 1, log });
    await recordBotSentFromMetaResponse(res);
  } catch (e) {
    log.error("send_whatsapp_image_failed", { err: String(e.message) });
  }
}
async function sendWhatsAppCTA(to, opts, fromPhoneId) {
  const phoneId = fromPhoneId || WHATSAPP_PHONE_ID;
  const post = async (payload) => {
    const res = await fetchSafe(`${META_GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${waTokenFor(fromPhoneId)}` },
      body: JSON.stringify(payload)
    }, { timeoutMs: 15e3, retries: 1, log });
    await recordBotSentFromMetaResponse(res);
  };
  try {
    await post(buildWhatsAppCTAPayload(to, opts));
    return true;
  } catch (e) {
    if (opts && opts.imageUrl) {
      try {
        await post(buildWhatsAppCTAPayload(to, { ...opts, imageUrl: "" }));
        return true;
      } catch (e2) {
        log.error("send_whatsapp_cta_failed", { err: String(e2.message) });
        return false;
      }
    }
    log.error("send_whatsapp_cta_failed", { err: String(e.message) });
    return false;
  }
}
function webhookSignatureResult(req) {
  return checkWebhook({
    rawBody: req.rawBody,
    signatureHeader: req.get("x-hub-signature-256") || "",
    appSecret: CONFIG.APP_SECRET,
    isProd: CONFIG.isProd,
    allowUnsigned: CONFIG.ALLOW_UNSIGNED_WEBHOOKS
  });
}
async function notifyHandoff(channel, id, userText) {
  await notifyOwner(
    `\u{1F9D1}\u200D\u{1F4BC} \u062A\u062D\u0648\u064A\u0644 \u0644\u0645\u0648\u0638\u0641 \u2014 ${channel}
\u0627\u0644\u0639\u0645\u064A\u0644: ${id}
\u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629: ${String(userText || "").slice(0, 300)}

\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0641\u064A Business Suite \u0648\u0631\u064F\u062F\u0651 \u0639\u0644\u064A\u0647.`
  );
}
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
    console.log("Webhook verified \u2714");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
app.post("/webhook", async (req, res) => {
  const sigRes = webhookSignatureResult(req);
  if (!sigRes.ok) {
    log.warn("webhook_rejected", { reason: sigRes.reason });
    return res.sendStatus(sigRes.status || 401);
  }
  if (!BOT_ENABLED) {
    console.log("BOT_ENABLED=false \u2014 webhook received but bot is paused (no reply sent).");
    return res.sendStatus(200);
  }
  const body = req.body;
  try {
    if (body.object === "page" || body.object === "instagram") {
      const channel = body.object === "instagram" ? "instagram" : "messenger";
      const channelAr = body.object === "instagram" ? "\u0627\u0646\u0633\u062A\u062C\u0631\u0627\u0645" : "\u0641\u064A\u0633\u0628\u0648\u0643";
      for (const entry of body.entry || []) {
        const pageId = entry.id;
        const resolved = resolveChannel(channelConfig, {
          channel,
          pageId,
          instagramAccountId: channel === "instagram" ? pageId : void 0
        });
        if (!resolved.allowed) {
          log.warn("skip_unknown_account", { channel, pageId: String(pageId) });
          continue;
        }
        const chanMode = resolved.mode;
        log.info("incoming", { channel, pageId: String(pageId), mode: chanMode });
        for (const event of entry.messaging || []) {
          if (HUMAN_TAKEOVER_ENABLED && (event.pass_thread_control || event.take_thread_control)) {
            const cust = event.sender && event.sender.id;
            if (cust) await releaseTakeover(channel, pageId, cust, { reason: "conversation_closed" });
            continue;
          }
          if (event.message && event.message.is_echo) {
            if (HUMAN_TAKEOVER_ENABLED) await handleOutboundEcho(channel, pageId, event);
            continue;
          }
          if (!event.message) continue;
          const senderId = event.sender.id;
          const mid = event.message.mid;
          const convId = memKey(channel, pageId, senderId);
          const acq = await dedup.acquire(mid);
          if (!acq.ok) continue;
          try {
            if (await handoffState.has(channel, pageId, senderId)) {
              await dedup.complete(mid);
              continue;
            }
            if (HUMAN_TAKEOVER_ENABLED) {
              const now = Date.now();
              const dec = await getInboundTakeoverDecision(channel, pageId, senderId, now);
              if (dec.action === "ignore") {
                log.info("customer_message_ignored_during_human_takeover", { channel, convKey: hashConvKey(takeover.stateKey(channel, pageId, senderId)), reason: dec.reason });
                await dedup.complete(mid);
                continue;
              }
              if (dec.action === "release_then_process") {
                await releaseTakeover(channel, pageId, senderId, { reason: "ttl_expired", now });
              }
            }
            const rl = await rateLimiter.check("wh:" + channel + ":" + senderId, DEFAULT_LIMITS.webhookSenderPerMin, 60);
            if (!rl.allowed) {
              log.warn("rate_limited_sender", { channel, pageId: String(pageId) });
              await dedup.complete(mid);
              continue;
            }
            let userText = event.message.text || null;
            let hadAttachment = false;
            if (!userText && Array.isArray(event.message.attachments) && event.message.attachments.length) {
              hadAttachment = true;
              const au = event.message.attachments.find((a) => a.type === "audio" && a.payload && a.payload.url);
              if (au) {
                const buf = await downloadUrl(au.payload.url);
                if (buf) userText = await transcribeAudio(buf, "audio.mp4", "audio/mp4");
              }
            }
            if (!userText) {
              if (hadAttachment) {
                await sendMessenger(senderId, "\u0627\u0633\u062A\u0644\u0645\u0646\u0627 \u0631\u0633\u0627\u0644\u062A\u0643 \u{1F64F} \u0628\u062D\u0648\u0651\u0644\u0643 \u0644\u0623\u062D\u062F \u0645\u0648\u0638\u0641\u064A\u0646\u0627 \u064A\u0642\u062F\u0631 \u064A\u0634\u0648\u0641\u0647\u0627 \u0648\u064A\u0633\u0627\u0639\u062F\u0643 \u062D\u0627\u0644\u0627\u064B.", pageId);
                const ok = await passToHuman(senderId, pageId);
                if (ok) await handoffState.set(channel, pageId, senderId, { reason: "non_text_attachment", appId: PAGE_INBOX_APP_ID });
                await notifyHandoff(channelAr, senderId, "[\u0645\u0631\u0641\u0642 \u063A\u064A\u0631 \u0646\u0635\u064A \u2014 \u0635\u0648\u0631\u0629/\u0635\u0648\u062A/\u0645\u0644\u0641]");
              }
              await dedup.complete(mid);
              continue;
            }
            if (arabicLib.isDataDeletionRequest(userText)) {
              await sendMessenger(senderId, DELETION_CONFIRM_MSG, pageId);
              await deleteCustomerData(channel, pageId, senderId);
              await dedup.complete(mid);
              continue;
            }
            if (wantsHuman(userText)) {
              await sendMessenger(senderId, HANDOFF_MESSAGE, pageId);
              const ok = await passToHuman(senderId, pageId);
              if (ok) await handoffState.set(channel, pageId, senderId, { reason: "keyword", appId: PAGE_INBOX_APP_ID });
              await notifyHandoff(channelAr, senderId, userText);
              log.info("handoff_keyword", { channel, pageId: String(pageId) });
              await dedup.complete(mid);
              continue;
            }
            const reply = await askAI(userText, channel, convId, chanMode);
            if (HUMAN_TAKEOVER_ENABLED && await isHumanActiveNow(channel, pageId, senderId, Date.now())) {
              log.info("bot_reply_cancelled_due_to_human_takeover", { channel, convKey: hashConvKey(takeover.stateKey(channel, pageId, senderId)) });
              await dedup.complete(mid);
              continue;
            }
            if (RICH_CARDS_ENABLED && reply.products && reply.products.length > 1) {
              const caption = (reply.text || "").trim();
              try {
                if (caption) await sendMessenger(senderId, caption, pageId);
                await sendMessengerCarousel(senderId, reply.products, pageId);
              } catch (e) {
                log.error("messenger_carousel_failed", { err: String(e.message) });
                if (!caption && reply.text) {
                  try {
                    await sendMessenger(senderId, reply.text, pageId);
                  } catch (_) {
                  }
                }
                if (reply.images) for (const u of reply.images) await sendMessengerImage(senderId, u, pageId);
                for (const p of reply.products) {
                  try {
                    await sendMessenger(senderId, p.url, pageId);
                  } catch (_) {
                  }
                }
              }
            } else if (RICH_CARDS_ENABLED && reply.product && reply.product.url) {
              const p = reply.product;
              const caption = (p.caption || reply.text || "").trim();
              try {
                if (caption) await sendMessenger(senderId, caption, pageId);
                await sendMessengerCard(
                  senderId,
                  { title: p.title, subtitle: p.subtitle, imageUrl: p.imageUrl, url: p.url, buttonTitle: "\u0634\u0648\u0641 \u0627\u0644\u0645\u0646\u062A\u062C \u{1F334}" },
                  pageId
                );
              } catch (e) {
                log.error("messenger_card_failed", { err: String(e.message) });
                try {
                  await sendMessenger(senderId, p.url, pageId);
                } catch (_) {
                }
                if (reply.images) for (const u of reply.images) await sendMessengerImage(senderId, u, pageId);
              }
            } else {
              if (reply.text) await sendMessenger(senderId, reply.text, pageId);
              if (reply.images) for (const u of reply.images) await sendMessengerImage(senderId, u, pageId);
            }
            let orderText = reply.order;
            if (!orderText) {
              const auto = detectOrder(await historyStore.get(convId));
              if (auto) orderText = auto;
            }
            if (orderText) {
              await notifyOwner(`\u{1F334} \u0623\u0648\u0631\u062F\u0631 \u062C\u062F\u064A\u062F \u2014 ${channelAr}

${orderText}

\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${senderId}`);
              await logOrder({ order: orderText, channel: channelAr, customerId: senderId, mode: chanMode });
            }
            if (reply.handoff || needsEscalation(userText)) {
              const ok = await passToHuman(senderId, pageId);
              if (ok) await handoffState.set(channel, pageId, senderId, { reason: "ai_or_escalation", appId: PAGE_INBOX_APP_ID });
              await notifyHandoff(channelAr, senderId, userText);
              log.info("handoff", { channel, pageId: String(pageId) });
            }
            await dedup.complete(mid);
          } catch (err) {
            log.error("event_failed", { channel, pageId: String(pageId), err: String(err && err.message) });
            await dedup.fail(mid, err && err.message);
          }
        }
      }
    }
    if (body.object === "whatsapp_business_account" && WHATSAPP_ENABLED) {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const waPhoneId = change.value?.metadata?.phone_number_id;
          const waResolved = resolveChannel(channelConfig, { channel: "whatsapp", phoneNumberId: waPhoneId });
          if (!waResolved.allowed) {
            log.warn("skip_unknown_whatsapp", { phoneNumberId: String(waPhoneId || "") });
            continue;
          }
          const waMode = waResolved.mode;
          const messages = change.value?.messages || [];
          for (const msg of messages) {
            const from = msg.from;
            if (!from) continue;
            const mid = msg.id;
            const convId = memKey("whatsapp", waPhoneId, from);
            const acq = await dedup.acquire(mid);
            if (!acq.ok) continue;
            try {
              if (await handoffState.has("whatsapp", waPhoneId, from)) {
                await dedup.complete(mid);
                continue;
              }
              if (HUMAN_TAKEOVER_ENABLED) {
                const now = Date.now();
                const dec = await getInboundTakeoverDecision("whatsapp", waPhoneId, from, now);
                if (dec.action === "ignore") {
                  log.info("customer_message_ignored_during_human_takeover", { channel: "whatsapp", convKey: hashConvKey(takeover.stateKey("whatsapp", waPhoneId, from)), reason: dec.reason });
                  await dedup.complete(mid);
                  continue;
                }
                if (dec.action === "release_then_process") {
                  await releaseTakeover("whatsapp", waPhoneId, from, { reason: "ttl_expired", now });
                }
              }
              const rl = await rateLimiter.check("wh:whatsapp:" + from, DEFAULT_LIMITS.webhookSenderPerMin, 60);
              if (!rl.allowed) {
                log.warn("rate_limited_sender", { channel: "whatsapp", pageId: String(waPhoneId || "") });
                await dedup.complete(mid);
                continue;
              }
              let userText = null;
              let nonText = false;
              if (msg.type === "text") {
                userText = msg.text.body;
              } else if ((msg.type === "audio" || msg.type === "voice") && msg[msg.type] && msg[msg.type].id) {
                const media = await downloadWhatsAppMedia(msg[msg.type].id, waPhoneId);
                if (media) userText = await transcribeAudio(media.buffer, "audio.ogg", media.mime);
                if (!userText) {
                  await sendWhatsApp(from, "\u0645\u0627 \u0642\u062F\u0631\u062A \u0623\u0641\u0647\u0645 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u062A\u064A\u0629\u060C \u0645\u0645\u0643\u0646 \u062A\u0643\u062A\u0628\u0647\u0627 \u0623\u0648 \u062A\u0628\u0639\u062A\u0647\u0627 \u062A\u0627\u0646\u064A\u061F \u{1F64F}", waPhoneId);
                  await dedup.complete(mid);
                  continue;
                }
              } else {
                nonText = true;
              }
              if (nonText) {
                await sendWhatsApp(from, "\u0627\u0633\u062A\u0644\u0645\u0646\u0627 \u0631\u0633\u0627\u0644\u062A\u0643 \u{1F64F} \u0628\u062D\u0648\u0651\u0644\u0643 \u0644\u0623\u062D\u062F \u0645\u0648\u0638\u0641\u064A\u0646\u0627 \u064A\u0642\u062F\u0631 \u064A\u0634\u0648\u0641\u0647\u0627 \u0648\u064A\u0633\u0627\u0639\u062F\u0643 \u062D\u0627\u0644\u0627\u064B.", waPhoneId);
                await handoffState.set("whatsapp", waPhoneId, from, { reason: "non_text_attachment", appId: null });
                await notifyHandoff("\u0648\u0627\u062A\u0633\u0627\u0628", from, "[\u0645\u0631\u0641\u0642 \u063A\u064A\u0631 \u0646\u0635\u064A \u2014 \u0635\u0648\u0631\u0629/\u0635\u0648\u062A/\u0645\u0633\u062A\u0646\u062F]");
                await dedup.complete(mid);
                continue;
              }
              if (!userText) {
                await dedup.complete(mid);
                continue;
              }
              if (arabicLib.isDataDeletionRequest(userText)) {
                await sendWhatsApp(from, DELETION_CONFIRM_MSG, waPhoneId);
                await deleteCustomerData("whatsapp", waPhoneId, from);
                await dedup.complete(mid);
                continue;
              }
              if (wantsHuman(userText)) {
                await sendWhatsApp(from, HANDOFF_MESSAGE, waPhoneId);
                await handoffState.set("whatsapp", waPhoneId, from, { reason: "keyword", appId: null });
                await notifyHandoff("\u0648\u0627\u062A\u0633\u0627\u0628", from, userText);
                log.info("handoff_keyword", { channel: "whatsapp", pageId: String(waPhoneId || "") });
                await dedup.complete(mid);
                continue;
              }
              const reply = await askAI(userText, "whatsapp", convId, waMode);
              if (HUMAN_TAKEOVER_ENABLED && await isHumanActiveNow("whatsapp", waPhoneId, from, Date.now())) {
                log.info("bot_reply_cancelled_due_to_human_takeover", { channel: "whatsapp", convKey: hashConvKey(takeover.stateKey("whatsapp", waPhoneId, from)) });
                await dedup.complete(mid);
                continue;
              }
              if (RICH_CARDS_ENABLED && reply.products && reply.products.length > 1) {
                if (reply.text) await sendWhatsApp(from, reply.text, waPhoneId);
                for (const p of reply.products.slice(0, 5)) {
                  const bodyText = [p.title, p.subtitle].filter(Boolean).join("\n");
                  const ok = await sendWhatsAppCTA(
                    from,
                    { bodyText, buttonUrl: p.url, buttonText: "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0646\u062A\u062C", imageUrl: p.imageUrl },
                    waPhoneId
                  );
                  if (!ok) await sendWhatsApp(from, `${p.title}${p.subtitle ? " \u2014 " + p.subtitle : ""}
${p.url}`, waPhoneId);
                }
              } else if (RICH_CARDS_ENABLED && reply.product && reply.product.url) {
                const p = reply.product;
                const ok = await sendWhatsAppCTA(
                  from,
                  { bodyText: p.caption || reply.text || "", buttonUrl: p.url, buttonText: "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0646\u062A\u062C", imageUrl: p.imageUrl },
                  waPhoneId
                );
                if (!ok) {
                  if (reply.text) await sendWhatsApp(from, reply.text, waPhoneId);
                  if (reply.images) for (const u of reply.images) await sendWhatsAppImage(from, u, waPhoneId);
                }
              } else {
                if (reply.text) await sendWhatsApp(from, reply.text, waPhoneId);
                if (reply.images) for (const u of reply.images) await sendWhatsAppImage(from, u, waPhoneId);
              }
              let waOrder = reply.order;
              if (!waOrder) {
                const auto = detectOrder(await historyStore.get(convId));
                if (auto) waOrder = auto;
              }
              if (waOrder) {
                await notifyOwner(`\u{1F334} \u0623\u0648\u0631\u062F\u0631 \u062C\u062F\u064A\u062F \u2014 \u0648\u0627\u062A\u0633\u0627\u0628

${waOrder}

\u0631\u0642\u0645 \u0627\u0644\u0639\u0645\u064A\u0644: ${from}`);
                await logOrder({ order: waOrder, channel: "\u0648\u0627\u062A\u0633\u0627\u0628", customerId: from, mode: waMode });
              }
              if (reply.handoff || needsEscalation(userText)) {
                await handoffState.set("whatsapp", waPhoneId, from, { reason: "ai_or_escalation", appId: null });
                await notifyHandoff("\u0648\u0627\u062A\u0633\u0627\u0628", from, userText);
                log.info("handoff", { channel: "whatsapp", pageId: String(waPhoneId || "") });
              }
              await dedup.complete(mid);
            } catch (err) {
              log.error("event_failed", { channel: "whatsapp", pageId: String(waPhoneId || ""), err: String(err && err.message) });
              await dedup.fail(mid, err && err.message);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("webhook handler error:", e);
  }
  res.sendStatus(200);
});
app.get("/release", async (req, res) => {
  const senderId = req.query.id;
  const channel = String(req.query.channel || "messenger");
  const pageId = req.query.pageId || req.query.pageid || "";
  if (!senderId) return res.status(400).send("id \u0645\u0637\u0644\u0648\u0628 (senderId).");
  const existing = await handoffState.get(channel, pageId, senderId);
  if (!existing) return res.status(404).send("\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0634 \u0645\u062A\u062D\u0648\u0651\u0644\u0629 \u0623\u0635\u0644\u0627\u064B \u0623\u0648 \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D (channel/pageId/id) \u063A\u0644\u0637.");
  if (channel === "messenger" || channel === "instagram") {
    const ok = await takeThreadControl(senderId, pageId);
    if (!ok) {
      log.error("release_meta_failed", { channel, pageId: String(pageId) });
      return res.status(502).send("\u0641\u0634\u0644 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0646 Meta (take_thread_control) \u2014 \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0625\u0631\u062C\u0627\u0639. \u062D\u0627\u0648\u0644 \u062A\u0627\u0646\u064A.");
    }
  }
  await handoffState.clear(channel, pageId, senderId);
  if (HUMAN_TAKEOVER_ENABLED) await releaseTakeover(channel, pageId, senderId, { reason: "manual_release" });
  await historyStore.clear(memKey(channel, pageId, senderId));
  log.info("release_ok", { channel, pageId: String(pageId) });
  return res.send(`\u062A\u0645 \u0625\u0631\u062C\u0627\u0639 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 ${senderId} \u0644\u0644\u0628\u0648\u062A \u2714 (${channel})`);
});
function _takeoverParams(src) {
  return {
    channel: src && src.channel ? String(src.channel) : "",
    accountId: src && (src.account_id != null ? String(src.account_id) : src.accountId != null ? String(src.accountId) : ""),
    customerId: src && (src.customer_id != null ? String(src.customer_id) : src.customerId != null ? String(src.customerId) : ""),
    reason: src && src.reason ? String(src.reason) : void 0
  };
}
app.post("/api/admin/conversations/takeover", async (req, res) => {
  const p = _takeoverParams(req.body || {});
  if (!p.channel || !p.accountId || !p.customerId) {
    return res.status(400).json({ error: "channel, account_id, customer_id \u0645\u0637\u0644\u0648\u0628\u064A\u0646" });
  }
  await markHumanActive(p.channel, p.accountId, p.customerId, { reason: p.reason || "admin_takeover" });
  return res.json({ ok: true, status: takeover.STATES.HUMAN_ACTIVE, channel: p.channel });
});
app.post("/api/admin/conversations/release", async (req, res) => {
  const p = _takeoverParams(req.body || {});
  if (!p.channel || !p.accountId || !p.customerId) {
    return res.status(400).json({ error: "channel, account_id, customer_id \u0645\u0637\u0644\u0648\u0628\u064A\u0646" });
  }
  await releaseTakeover(p.channel, p.accountId, p.customerId, { reason: p.reason || "manual_release" });
  await handoffState.clear(p.channel, p.accountId, p.customerId);
  return res.json({ ok: true, status: takeover.STATES.BOT_ACTIVE, channel: p.channel });
});
app.get("/api/admin/conversations/status", async (req, res) => {
  const p = _takeoverParams(req.query || {});
  if (!p.channel || !p.accountId || !p.customerId) {
    return res.status(400).json({ error: "channel, account_id, customer_id \u0645\u0637\u0644\u0648\u0628\u064A\u0646" });
  }
  const key = takeover.stateKey(p.channel, p.accountId, p.customerId);
  let record = null;
  try {
    record = await takeoverReadStrict(key);
  } catch (e) {
    return res.status(502).json({ error: "state_read_failed" });
  }
  const now = Date.now();
  const expired = record && record.status === takeover.STATES.HUMAN_ACTIVE ? takeover.isExpired(record, now) : false;
  const effectiveStatus = record ? expired ? takeover.STATES.BOT_ACTIVE : record.status : takeover.STATES.BOT_ACTIVE;
  return res.json({
    ok: true,
    convKey: hashConvKey(key),
    // هاش فقط — بدون معرّفات خام
    status: effectiveStatus,
    expired,
    record: record || null
    // السجل يحتوي معرّفات القناة/الحساب/العميل ووقت — بدون نص/أسرار
  });
});
app.get("/admin/delete-data", async (req, res) => {
  const channel = req.query.channel;
  const pageId = req.query.pageId || req.query.pageid || "";
  const senderId = req.query.id;
  if (!channel || !senderId) return res.status(400).json({ error: "channel \u0648 id \u0645\u0637\u0644\u0648\u0628\u064A\u0646" });
  try {
    const rec = await deleteCustomerData(String(channel), pageId, String(senderId));
    return res.json({
      ok: true,
      deleted: rec,
      note: "\u062A\u0645 \u062D\u0630\u0641 \u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644. \u0646\u0633\u062E Meta/Telegram \u062E\u0627\u0631\u062C \u0633\u064A\u0637\u0631\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642."
    });
  } catch (e) {
    log.error("admin_delete_failed", { err: String(e.message) });
    return res.status(500).json({ error: "deletion_failed" });
  }
});
var PRIVACY_PAGE = `<!doctype html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u2014 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 | Liwa Dates Privacy Policy</title>
<style>body{font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif;max-width:760px;margin:24px auto;padding:0 18px;line-height:1.8;color:#222}h1{font-size:1.5rem}h2{font-size:1.15rem;margin-top:1.6em}small{color:#666}hr{border:none;border-top:1px solid #eee;margin:24px 0}.en{direction:ltr;text-align:left}</style>
</head><body>
<h1>\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629 \u2014 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 (Liwa Dates)</h1>
<small>\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: \u064A\u0648\u0644\u064A\u0648 2026</small>

<p>\u062A\u0634\u063A\u0651\u0644 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 \u0645\u0633\u0627\u0639\u062F\u064B\u0627 \u0622\u0644\u064A\u064B\u0627 \u0644\u0644\u0631\u062F \u0639\u0644\u0649 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0639\u0628\u0631 Facebook Messenger \u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646 (\u0635\u0646\u0627\u062F\u064A\u0642 \u062A\u062C\u0641\u064A\u0641 \u0627\u0644\u062A\u0645\u0648\u0631\u060C \u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0631\u0637\u0628 \u0627\u0644\u0641\u0627\u0631\u063A\u0629\u060C \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629). \u062A\u0648\u0636\u0651\u062D \u0647\u0630\u0647 \u0627\u0644\u0633\u064A\u0627\u0633\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u064A \u0646\u0639\u0627\u0644\u062C\u0647\u0627 \u0648\u0643\u064A\u0641\u064A\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627.</p>

<h2>\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u064A \u0646\u0639\u0627\u0644\u062C\u0647\u0627</h2>
<p>\u0639\u0646\u062F \u0645\u0631\u0627\u0633\u0644\u062A\u0643 \u0644\u0635\u0641\u062D\u062A\u0646\u0627 \u0639\u0644\u0649 \u0645\u0627\u0633\u0646\u062C\u0631 \u0646\u0639\u0627\u0644\u062C: \u0645\u064F\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0635\u0651\u0629 (Page-Scoped ID)\u060C \u0648\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0645 \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0638\u0627\u0647\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u062D\u0633\u0627\u0628\u060C \u0648\u0646\u0635\u0651 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u064A \u062A\u0631\u0633\u0644\u0647\u0627\u060C \u0648\u0623\u064A \u062A\u0641\u0627\u0635\u064A\u0644 \u0637\u0644\u0628 \u062A\u0634\u0627\u0631\u0643\u0647\u0627 \u0637\u0648\u0639\u064B\u0627 (\u0645\u062B\u0644 \u0627\u0644\u0627\u0633\u0645 \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0648\u0639\u062F\u062F \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0648\u0627\u0644\u0625\u0645\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639) \u0644\u062A\u062C\u0647\u064A\u0632 \u0637\u0644\u0628\u0643.</p>

<h2>\u0643\u064A\u0641 \u0646\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A</h2>
<p>\u0646\u0633\u062A\u062E\u062F\u0645 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0641\u0642\u0637 \u0644\u0644\u0631\u062F\u0651 \u0639\u0644\u0649 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u0643\u060C \u0648\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A\u060C \u0648\u062A\u0633\u062C\u064A\u0644 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0639\u0628\u0626\u0629 \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645\u060C \u0648\u062A\u062D\u0648\u064A\u0644\u0643 \u0644\u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629. \u0644\u0627 \u0646\u0628\u064A\u0639 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0648\u0644\u0627 \u0646\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0641\u064A \u0625\u0639\u0644\u0627\u0646\u0627\u062A.</p>

<h2>\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u0639 \u0623\u0637\u0631\u0627\u0641 \u062B\u0627\u0644\u062B\u0629 (\u0645\u0632\u0648\u0651\u062F\u0648 \u0627\u0644\u062E\u062F\u0645\u0629)</h2>
<p>\u0644\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0622\u0644\u064A \u0646\u0633\u062A\u0639\u064A\u0646 \u0628\u0645\u0632\u0648\u0651\u062F\u064A \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0646\u060C \u0643\u0644\u064C\u0651 \u0644\u063A\u0631\u0636\u0647 \u0641\u0642\u0637:</p>
<ul>
<li><b>Meta Platforms</b> (Messenger / Instagram / WhatsApp): \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0648\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644.</li>
<li><b>OpenAI</b>: \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0631\u062F\u0651 \u0648\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0635\u0648\u062A\u064A\u0629 \u0625\u0644\u0649 \u0646\u0635.</li>
<li><b>Upstash (Redis)</b>: \u062A\u062E\u0632\u064A\u0646 \u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0648\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0645\u0624\u0642\u062A\u064B\u0627.</li>
<li><b>Telegram</b> (\u0639\u0646\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644): \u062A\u0646\u0628\u064A\u0647 \u0641\u0631\u064A\u0642\u0646\u0627 \u0628\u0627\u0644\u0637\u0644\u0628\u0627\u062A/\u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A.</li>
<li><b>Google Sheets / Apps Script</b> (\u0639\u0646\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644): \u062A\u0633\u062C\u064A\u0644 \u0645\u0644\u062E\u0651\u0635 \u0627\u0644\u0637\u0644\u0628 \u0644\u0641\u0631\u064A\u0642\u0646\u0627.</li>
<li><b>Vercel</b> (\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629): \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0629.</li>
<li><b>WooCommerce / \u0645\u0648\u0642\u0639 liwadates.com</b>: \u0645\u0635\u062F\u0631 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C (\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646\u062A\u062C\u0627\u062A \u0641\u0642\u0637).</li>
</ul>
<p>\u0644\u0627 \u0646\u0628\u064A\u0639 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0648\u0644\u0627 \u0646\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A\u060C \u0648\u0644\u0627 \u0646\u0634\u0627\u0631\u0643\u0647\u0627 \u0645\u0639 \u0623\u064A \u062C\u0647\u0629 \u0623\u062E\u0631\u0649 \u0625\u0644\u0627 \u0625\u0630\u0627 \u0627\u0633\u062A\u0644\u0632\u0645 \u0627\u0644\u0642\u0627\u0646\u0648\u0646 \u0630\u0644\u0643.</p>

<h2>\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0627\u0644\u063A\u0631\u0636 \u0648\u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638</h2>
<p>\u0646\u0639\u0627\u0644\u062C: \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0635\u0651\u0629\u060C \u0627\u0644\u0627\u0633\u0645/\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0627\u0645\u0629\u060C \u0646\u0635 \u0627\u0644\u0631\u0633\u0627\u0626\u0644\u060C \u0648\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u062A\u064A \u062A\u0634\u0627\u0631\u0643\u0647\u0627 \u0637\u0648\u0639\u064B\u0627 (\u0627\u0633\u0645\u060C \u0647\u0627\u062A\u0641\u060C \u0645\u0646\u0637\u0642\u0629\u060C \u0643\u0645\u064A\u0629). \u0627\u0644\u063A\u0631\u0636: \u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u0643 \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0637\u0644\u0628 \u0648\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0648\u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0644\u0645\u0648\u0638\u0641 \u0639\u0646\u062F \u0627\u0644\u062D\u0627\u062C\u0629. \u0645\u062F\u0629 \u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638: \u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u062A\u064F\u062D\u0630\u0641 \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627 \u062E\u0644\u0627\u0644 \u0645\u062F\u0629 \u0642\u0635\u064A\u0631\u0629 (\u0623\u064A\u0627\u0645)\u060C \u0648\u0633\u062C\u0644\u0651 \u0627\u0644\u0637\u0644\u0628 \u064A\u064F\u062D\u0641\u0638 \u0644\u0644\u0645\u062F\u0629 \u0627\u0644\u0644\u0627\u0632\u0645\u0629 \u0644\u062E\u062F\u0645\u062A\u0643.</p>
<p><b>\u0644\u0627 \u062A\u0631\u0633\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u0641\u0639 \u062D\u0633\u0651\u0627\u0633\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629</b> (\u0631\u0642\u0645 \u0628\u0637\u0627\u0642\u0629 \u0643\u0627\u0645\u0644/CVV/OTP). \u064A\u0645\u0643\u0646 \u062F\u0627\u0626\u0645\u064B\u0627 \u062A\u062D\u0648\u064A\u0644\u0643 \u0644\u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A.</p>

<h2>\u062D\u0630\u0641 \u0628\u064A\u0627\u0646\u0627\u062A\u0643 (\u0648\u062D\u062F\u0648\u062F\u0647)</h2>
<p>\u0644\u0637\u0644\u0628 \u0627\u0644\u062D\u0630\u0641 \u0623\u0631\u0633\u0644 \xAB\u062D\u0630\u0641 \u0628\u064A\u0627\u0646\u0627\u062A\u064A\xBB \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0623\u0648 \u0631\u0627\u0633\u0644\u0646\u0627 \u0639\u0644\u0649 \u0627\u0644\u0628\u0631\u064A\u062F \u0623\u062F\u0646\u0627\u0647\u061B \u0633\u0646\u062D\u0630\u0641 \u0630\u0627\u0643\u0631\u0629 \u0645\u062D\u0627\u062F\u062B\u062A\u0643 \u0645\u0646 \u0623\u0646\u0638\u0645\u062A\u0646\u0627. <b>\u0645\u0644\u0627\u062D\u0638\u0629 \u0635\u0627\u062F\u0642\u0629:</b> \u0644\u0627 \u0646\u0633\u062A\u0637\u064A\u0639 \u062D\u0630\u0641 \u0646\u0633\u062E \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629 \u0644\u062F\u0649 Meta \u0623\u0648 Telegram \u0645\u0646 \u062C\u0627\u0646\u0628\u0646\u0627 \u2014 \u0644\u0647\u0630\u0647 \u0627\u0644\u062C\u0647\u0627\u062A \u0633\u064A\u0627\u0633\u0627\u062A \u062D\u0630\u0641 \u062E\u0627\u0635\u0629 \u0628\u0647\u0627 \u062A\u062D\u062A\u0627\u062C \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0647\u0627 \u0645\u0628\u0627\u0634\u0631\u0629.</p>

<h2>\u0627\u0644\u062A\u0648\u0627\u0635\u0644</h2>
<p>\u0644\u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u062E\u0635\u0648\u0635\u064A\u0629: <a href="mailto:info@liwadates.com">info@liwadates.com</a> \u2014 \u0627\u0644\u0645\u0648\u0642\u0639: <a href="https://liwadates.com">liwadates.com</a></p>

<hr>
<div class="en">
<h1>Privacy Policy \u2014 Liwa Dates</h1>
<small>Last updated: July 2026</small>
<p>Liwa Dates operates an automated assistant that replies to customer messages on Facebook Messenger to serve farmers (date-drying boxes, empty rutab cartons, and packing services). This policy explains what data we process and how we use it.</p>
<h2>Data we process</h2>
<p>When you message our page we process: your platform user identifier (Page-Scoped ID), your public name and profile picture, the text of the messages you send, and any order details you voluntarily share (such as name, phone number, number of boxes, emirate and location) to fulfil your request.</p>
<h2>How we use data</h2>
<p>We use this data only to answer your questions, provide pricing and information, log packing orders, coordinate delivery/pickup, and hand you over to a human agent when needed. We do not sell your data or use it for advertising.</p>
<h2>Third parties (service providers)</h2>
<ul>
<li><b>Meta Platforms</b> (Messenger / Instagram / WhatsApp) \u2014 receiving & delivering messages.</li>
<li><b>OpenAI</b> \u2014 generating replies and transcribing voice messages.</li>
<li><b>Upstash (Redis)</b> \u2014 temporary conversation memory & handoff state.</li>
<li><b>Telegram</b> (if enabled) \u2014 alerting our team about orders/handoffs.</li>
<li><b>Google Sheets / Apps Script</b> (if enabled) \u2014 logging an order summary for our team.</li>
<li><b>Vercel</b> \u2014 hosting the service.</li>
<li><b>WooCommerce / liwadates.com</b> \u2014 source of prices & catalog (product data only).</li>
</ul>
<p>We do not sell your data or use it for advertising, and do not share it with anyone else unless required by law.</p>
<h2>Data types, purpose & retention</h2>
<p>We process your platform user ID, public name/picture, message text, and order details you voluntarily share (name, phone, area, quantity) to answer you, log orders, coordinate delivery, and hand you to a human when needed. Conversation memory auto-expires within a short period (days); order records are kept only as long as needed. <b>Do not send sensitive payment data via chat</b> (full card number/CVV/OTP). You can always be handed over to a human agent.</p>
<h2>Deleting your data (and its limits)</h2>
<p>Send "delete my data" in the chat or email us to have your conversation memory deleted from our systems. <b>Honest note:</b> we cannot delete copies of messages held by Meta or Telegram on your behalf \u2014 those providers have their own deletion processes you must contact directly.</p>
<h2>Contact</h2>
<p>For any privacy question: <a href="mailto:info@liwadates.com">info@liwadates.com</a> \u2014 Website: <a href="https://liwadates.com">liwadates.com</a></p>
</div>
</body></html>`;
app.get("/privacy", (req, res) => {
  res.set("content-type", "text/html; charset=utf-8").send(PRIVACY_PAGE);
});
app.get("/test", async (req, res) => {
  const msg = req.query.msg;
  if (!msg) return res.send("\u0627\u0628\u0639\u062A \u0631\u0633\u0627\u0644\u0629: /test?key=...&msg=\u0631\u0633\u0627\u0644\u062A\u0643 (\u0648\u0644\u0644\u0645\u0632\u0627\u0631\u0639\u064A\u0646 \u0632\u0648\u0651\u062F &mode=farmer&id=\u0645\u0639\u0631\u0641)");
  const mode = req.query.mode === "farmer" ? "farmer" : null;
  const convId = "test_" + (req.query.id || "x");
  const reply = await askAI(String(msg), "test", convId, mode);
  res.json({ customer_message: msg, mode: mode || "retail", bot_reply: reply.text, handoff: reply.handoff, order: reply.order });
});
app.get("/chat", (req, res) => {
  res.set("content-type", "text/html; charset=utf-8").send(CHAT_PAGE);
});
app.post("/api/transcribe", express.raw({ type: "*/*", limit: "12mb" }), async (req, res) => {
  try {
    const rl = await rateLimiter.check("transcribe:" + (req.ip || "anon"), DEFAULT_LIMITS.apiTranscribePerHour, 3600);
    if (!rl.allowed) return res.status(429).json({ error: "rate_limited", text: "" });
    if (!req.body || !req.body.length) return res.json({ text: "" });
    const mime = req.headers["content-type"] || "audio/webm";
    const ext = mime.includes("ogg") ? "ogg" : mime.includes("mp") ? "mp4" : mime.includes("wav") ? "wav" : "webm";
    const text = await transcribeAudio(req.body, `audio.${ext}`, mime);
    res.json({ text: text || "" });
  } catch (e) {
    console.error("/api/transcribe error:", e);
    res.json({ text: "" });
  }
});
app.post("/api/chat", async (req, res) => {
  try {
    const rl = await rateLimiter.check("apichat:" + (req.ip || "anon"), DEFAULT_LIMITS.apiChatPerMin, 60);
    if (!rl.allowed) return res.status(429).json({ reply: "\u0637\u0644\u0628\u0627\u062A \u0643\u062A\u064A\u0631 \u0628\u0633\u0631\u0639\u0629 \u2014 \u0627\u0646\u062A\u0638\u0631 \u0644\u062D\u0638\u0629 \u0648\u062C\u0631\u0651\u0628 \u062A\u0627\u0646\u064A.", handoff: false, order: null });
    const history = Array.isArray(req.body.messages) ? req.body.messages.slice(-20) : [];
    const mode = req.query.mode === "farmer" ? "farmer" : null;
    const raw = await openaiReply(history, mode);
    if (raw === null) return res.json({ reply: "\u0645\u0639\u0644\u0634 \u062D\u0635\u0644 \u062E\u0637\u0623\u060C \u062C\u0631\u0651\u0628 \u062A\u0627\u0646\u064A.", handoff: false, order: null });
    const parsed = parseReply(raw, "webchat", mode);
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    if (lastUser && needsEscalation(lastUser.content)) parsed.handoff = true;
    if (!parsed.order) {
      const auto = detectOrder(history);
      if (auto) parsed.order = auto;
    }
    res.json(parsed);
  } catch (e) {
    console.error("/api/chat error:", e);
    res.json({ reply: "\u0645\u0639\u0644\u0634 \u062D\u0635\u0644 \u062E\u0637\u0623\u060C \u062C\u0631\u0651\u0628 \u062A\u0627\u0646\u064A.", handoff: false, order: null });
  }
});
var CHAT_PAGE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>\u062A\u062C\u0631\u0628\u0629 \u0648\u0643\u064A\u0644 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, "Segoe UI", Tahoma, sans-serif; background:#0e1116; color:#e6e6e6; }
  header { background:#1a7a4c; color:#fff; padding:14px 16px; font-weight:bold; font-size:18px; display:flex; align-items:center; gap:8px; }
  #chat { max-width:640px; margin:0 auto; padding:16px; padding-bottom:110px; }
  .msg { margin:10px 0; display:flex; }
  .msg .bubble { padding:10px 14px; border-radius:16px; max-width:80%; white-space:pre-wrap; line-height:1.5; font-size:15px; }
  .user { justify-content:flex-start; }
  .user .bubble { background:#2563eb; color:#fff; border-bottom-right-radius:4px; }
  .bot { justify-content:flex-end; }
  .bot .bubble { background:#1e2530; color:#e6e6e6; border-bottom-left-radius:4px; }
  .bubble a { color:#7fd1a0; text-decoration:underline; word-break:break-all; }
  .user .bubble a { color:#dcefff; }
  .time { font-size:10px; opacity:.55; margin-top:4px; text-align:left; }
  .bubble.typing { display:flex; gap:5px; align-items:center; padding:14px; }
  .bubble.typing span { width:7px; height:7px; border-radius:50%; background:#8a93a3; display:inline-block; animation:bl 1s infinite; }
  .bubble.typing span:nth-child(2){ animation-delay:.2s; } .bubble.typing span:nth-child(3){ animation-delay:.4s; }
  @keyframes bl { 0%,80%,100%{ opacity:.3; } 40%{ opacity:1; } }
  .note { text-align:center; font-size:13px; margin:8px 0; }
  .note span { background:#3a2a12; color:#ffcf8f; padding:4px 10px; border-radius:10px; }
  .order { text-align:center; font-size:13px; margin:8px 0; }
  .order span { background:#12331d; color:#8fe0a6; padding:6px 12px; border-radius:10px; white-space:pre-wrap; display:inline-block; text-align:right; }
  #bar { position:fixed; bottom:0; left:0; right:0; background:#141922; border-top:1px solid #222; padding:12px; }
  #bar .wrap { max-width:640px; margin:0 auto; display:flex; gap:8px; }
  #inp { flex:1; padding:12px; border-radius:12px; border:1px solid #333; background:#0e1116; color:#fff; font-size:15px; }
  #send { padding:12px 18px; border:none; border-radius:12px; background:#1a7a4c; color:#fff; font-weight:bold; cursor:pointer; }
  #send:disabled { opacity:.5; }
</style>
</head>
<body>
<header>\u{1F334} \u062A\u062C\u0631\u0628\u0629 \u0648\u0643\u064A\u0644 \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627<button id="reset" title="\u0627\u0628\u062F\u0623 \u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629" style="margin-inline-start:auto;background:#0e1116;color:#ffb3b3;border:1px solid #2a3340;border-radius:10px;padding:6px 12px;font-size:13px;cursor:pointer;">\u{1F504} \u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629</button></header>
<div id="chat"></div>
<div id="bar"><div class="wrap">
  <input id="inp" placeholder="\u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u062A\u0643 \u0632\u064A \u0623\u064A \u0639\u0645\u064A\u0644..." autocomplete="off">
  <button id="mic" title="\u0633\u062C\u0651\u0644 \u0631\u0633\u0627\u0644\u0629 \u0635\u0648\u062A\u064A\u0629" style="background:#1e2530;color:#e6e6e6;border:none;border-radius:10px;padding:0 14px;font-size:18px;cursor:pointer;">\u{1F3A4}</button>
  <button id="send">\u0625\u0631\u0633\u0627\u0644</button>
</div></div>
<script>
  var key = new URLSearchParams(location.search).get("key") || "";
  var chat = document.getElementById("chat");
  var inp = document.getElementById("inp");
  var send = document.getElementById("send");
  var STORE = "liwa_chat_v1";
  var convo = [];
  var sending = false;

  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function linkify(s){
    var t = esc(s);
    t = t.replace(/(https?:\\/\\/[^\\s]+)/g, function(u){ return '<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>'; });
    // \u0627\u0631\u0642\u0627\u0645 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628/\u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0627\u0645\u0627\u0631\u0627\u062A\u064A\u0629 -> \u0631\u0627\u0628\u0637 wa.me \u0642\u0627\u0628\u0644 \u0644\u0644\u0646\u0642\u0631
    t = t.replace(/\\+?9715\\d{8}/g, function(p){ var n=p.replace(/\\D/g,''); return '<a href="https://wa.me/'+n+'" target="_blank" rel="noopener">'+p+'</a>'; });
    return t.replace(/\\n/g,"<br>");
  }
  function nowTime(){ var d=new Date(); var h=d.getHours(), m=d.getMinutes(); return (h<10?'0':'')+h+':'+(m<10?'0':'')+m; }

  function render(role, text, time){
    var d = document.createElement("div");
    d.className = "msg " + (role==="user"?"user":"bot");
    var bub = document.createElement("div"); bub.className="bubble"; bub.innerHTML = linkify(text);
    var tm = document.createElement("div"); tm.className="time"; tm.textContent = time || nowTime();
    bub.appendChild(tm); d.appendChild(bub); chat.appendChild(d);
    window.scrollTo(0, document.body.scrollHeight);
  }
  function renderImage(url){
    var d=document.createElement("div"); d.className="msg bot";
    var bub=document.createElement("div"); bub.className="bubble"; bub.style.padding="6px";
    var a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener";
    var im=document.createElement("img"); im.src=url; im.alt="\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062A\u062C"; im.loading="lazy";
    im.style.maxWidth="230px"; im.style.width="100%"; im.style.borderRadius="12px"; im.style.display="block";
    a.appendChild(im); bub.appendChild(a); d.appendChild(bub); chat.appendChild(d);
    window.scrollTo(0,document.body.scrollHeight);
  }
  function note(t){ var d=document.createElement("div"); d.className="note"; var s=document.createElement("span"); s.textContent=t; d.appendChild(s); chat.appendChild(d); window.scrollTo(0,document.body.scrollHeight); }
  function orderBox(t){ var d=document.createElement("div"); d.className="order"; var s=document.createElement("span"); s.textContent="\u{1F514} \u062A\u0646\u0628\u064A\u0647 \u0623\u0648\u0631\u062F\u0631 \u0644\u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u062A\u062C\u0631:\\n"+t; d.appendChild(s); chat.appendChild(d); }

  function save(){ try{ localStorage.setItem(STORE, JSON.stringify(convo)); }catch(e){} }
  function load(){ try{ return JSON.parse(localStorage.getItem(STORE)||"[]"); }catch(e){ return []; } }

  // \u0645\u0624\u0634\u0631 "\u064A\u0643\u062A\u0628 \u0627\u0644\u0622\u0646"
  var typingEl=null;
  function showTyping(){ typingEl=document.createElement("div"); typingEl.className="msg bot"; typingEl.innerHTML='<div class="bubble typing"><span></span><span></span><span></span></div>'; chat.appendChild(typingEl); window.scrollTo(0,document.body.scrollHeight); }
  function hideTyping(){ if(typingEl){ typingEl.remove(); typingEl=null; } }

  // \u0632\u0631\u0627\u0631 \u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629: \u064A\u0645\u0633\u062D \u0627\u0644\u0645\u062D\u0641\u0648\u0638 \u0648\u064A\u0628\u062F\u0623 \u0645\u0646 \u0646\u0636\u064A\u0641
  var resetBtn = document.getElementById("reset");
  if(resetBtn){ resetBtn.onclick = function(){ try{ localStorage.removeItem(STORE); }catch(e){} convo=[]; chat.innerHTML=""; render("bot","\u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647! \u062D\u064A\u0651\u0627\u0643 \u0627\u0644\u0644\u0647 \u0641\u064A \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 \u{1F334} \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u062E\u062F\u0645\u0643 \u0627\u0644\u064A\u0648\u0645\u061F"); inp.focus(); }; }

  // \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u062C\u0644\u0633\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629
  convo = load();
  if(convo.length){ for(var i=0;i<convo.length;i++){ var m=convo[i]; render(m.role==="user"?"user":"bot", m.content); if(m.images && m.images.length){ m.images.forEach(renderImage); } } }
  else { render("bot","\u0647\u0644\u0627 \u0648\u0627\u0644\u0644\u0647! \u062D\u064A\u0651\u0627\u0643 \u0627\u0644\u0644\u0647 \u0641\u064A \u062A\u0645\u0648\u0631 \u0644\u064A\u0648\u0627 \u{1F334} \u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u062E\u062F\u0645\u0643 \u0627\u0644\u064A\u0648\u0645\u061F"); }

  async function go(){
    if(sending) return;
    var text = inp.value.trim(); if(!text) return;
    sending=true; send.disabled=true; inp.disabled=true;
    render("user", text); convo.push({role:"user", content:text}); save();
    inp.value=""; showTyping();
    try{
      var r = await fetch("/api/chat?key="+encodeURIComponent(key), {
        method:"POST", headers:{"content-type":"application/json"},
        body: JSON.stringify({messages:convo.slice(-20)})
      });
      var data = await r.json();
      hideTyping();
      var reply = data.reply || data.text || "(\u0645\u0627\u0641\u064A\u0634 \u0631\u062F)";
      render("bot", reply);
      var imgs = (data.images && data.images.length) ? data.images : null;
      if(imgs){ imgs.forEach(renderImage); }
      convo.push({role:"assistant", content:reply, images:imgs}); save();
      if(data.order) orderBox(data.order);
      if(data.handoff) note("\u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0644\u0645\u0648\u0638\u0641 \u0628\u0634\u0631\u064A");
    }catch(e){ hideTyping(); render("bot","\u0645\u0639\u0644\u0634\u060C \u0635\u0627\u0631 \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644. \u062C\u0631\u0651\u0628 \u0645\u0631\u0629 \u062B\u0627\u0646\u064A\u0629."); }
    sending=false; send.disabled=false; inp.disabled=false; inp.focus();
  }
  send.onclick = go;
  inp.addEventListener("keydown", function(e){ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); go(); } });

  // ===== \u062A\u0633\u062C\u064A\u0644 \u0635\u0648\u062A\u064A: \u0633\u062C\u0651\u0644 -> \u062D\u0648\u0651\u0644 \u0644\u0646\u0635 -> \u0627\u0628\u0639\u062A =====
  var mic = document.getElementById("mic");
  var mediaRec = null, chunks = [], recording = false;
  async function startRec(){
    try{
      var stream = await navigator.mediaDevices.getUserMedia({audio:true});
      chunks = [];
      mediaRec = new MediaRecorder(stream);
      mediaRec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
      mediaRec.onstop = async function(){
        stream.getTracks().forEach(function(t){ t.stop(); });
        var blob = new Blob(chunks, {type: mediaRec.mimeType || "audio/webm"});
        if(!blob.size){ return; }
        inp.placeholder = "\u0628\u062D\u0648\u0651\u0644 \u0627\u0644\u0635\u0648\u062A \u0644\u0646\u0635..."; inp.disabled = true; mic.disabled = true;
        try{
          var r = await fetch("/api/transcribe?key="+encodeURIComponent(key), {
            method:"POST", headers:{"content-type": blob.type}, body: blob
          });
          var d = await r.json();
          inp.disabled = false; mic.disabled = false; inp.placeholder = "\u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u062A\u0643 \u0632\u064A \u0623\u064A \u0639\u0645\u064A\u0644...";
          if(d.text){ inp.value = d.text; go(); }
          else { note("\u0645\u0627 \u0642\u062F\u0631\u062A \u0623\u0641\u0647\u0645 \u0627\u0644\u0635\u0648\u062A\u060C \u062C\u0631\u0651\u0628 \u062A\u0627\u0646\u064A \u0623\u0648 \u0627\u0643\u062A\u0628."); }
        }catch(e){ inp.disabled=false; mic.disabled=false; inp.placeholder="\u0627\u0643\u062A\u0628 \u0631\u0633\u0627\u0644\u062A\u0643 \u0632\u064A \u0623\u064A \u0639\u0645\u064A\u0644..."; note("\u0635\u0627\u0631 \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0635\u0648\u062A."); }
      };
      mediaRec.start();
      recording = true; mic.textContent = "\u23F9"; mic.style.background = "#c0392b"; inp.placeholder = "\u0628\u0633\u062C\u0651\u0644... \u0627\u0636\u063A\u0637 \u0644\u0625\u064A\u0642\u0627\u0641";
    }catch(e){ note("\u0645\u062D\u062A\u0627\u062C \u0625\u0630\u0646 \u0627\u0644\u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0646 \u0639\u0634\u0627\u0646 \u0627\u0644\u062A\u0633\u062C\u064A\u0644."); }
  }
  function stopRec(){ if(mediaRec && recording){ recording=false; mic.textContent="\u{1F3A4}"; mic.style.background="#1e2530"; mediaRec.stop(); } }
  mic.addEventListener("click", function(){ if(recording) stopRec(); else startRec(); });
</script>
</body>
</html>`;
app.get("/catalog", (req, res) => {
  res.set("content-type", "text/plain; charset=utf-8").send(
    "\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: " + (liveCatalogUpdatedAt ? liveCatalogUpdatedAt.toISOString() : "\u0644\u0645 \u064A\u064F\u062D\u0645\u0651\u0644 \u0628\u0639\u062F") + " | \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0641\u064A\u062F: " + Object.keys(feedPrices).length + "\n\n" + (liveCatalog || "(\u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0641\u0627\u0636\u064A \u2014 \u0628\u064A\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u062B\u0627\u0628\u062A\u0629)")
  );
});
app.get("/aidebug", async (req, res) => {
  const model = req.query.model || AI_MODEL;
  const out = { model, hasKey: !!OPENAI_API_KEY };
  try {
    if (req.query.full) await ensureFresh();
    const msgs = req.query.full ? [{ role: "system", content: buildSystemPrompt() }, { role: "user", content: "\u0643\u0645 \u0633\u0639\u0631 \u0627\u0644\u0645\u062C\u062F\u0648\u0644\u061F" }] : [{ role: "user", content: "hi" }];
    if (req.query.full) out.promptChars = buildSystemPrompt().length;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model, max_tokens: req.query.full ? 300 : 5, messages: msgs })
    });
    out.status = r.status;
    const data = await r.json();
    if (data.error) {
      out.errorType = data.error.type;
      out.errorCode = data.error.code;
      out.errorMsg = String(data.error.message || "").slice(0, 200);
    } else out.ok = !!(data.choices && data.choices[0]);
  } catch (e) {
    out.fetchError = String(e.message).slice(0, 150);
  }
  res.json(out);
});
app.get("/feeddebug", async (req, res) => {
  const info = {};
  try {
    const r = await fetchCatalog(FEED_URL);
    info.status = r.status;
    info.contentEncoding = r.headers.get("content-encoding");
    info.contentType = r.headers.get("content-type");
    let buf = Buffer.from(await r.arrayBuffer());
    info.rawBytes = buf.length;
    let xml = buf.toString("utf8");
    info.rawHasItem = xml.includes("<item>");
    info.rawHead = xml.slice(0, 50).replace(/[0-9]/g, "#");
    if (!info.rawHasItem) {
      const zlib = require("zlib");
      for (const [nm, fn] of [["br", zlib.brotliDecompressSync], ["gzip", zlib.gunzipSync]]) {
        try {
          const d = fn(buf).toString("utf8");
          if (d.includes("<item>")) {
            info.decoded = nm;
            info.decodedItems = (d.match(/<item>/g) || []).length;
            break;
          }
        } catch (e) {
          info["err_" + nm] = String(e.message).slice(0, 60);
        }
      }
    } else {
      info.rawItems = (xml.match(/<item>/g) || []).length;
    }
  } catch (e) {
    info.fetchError = String(e.message).slice(0, 120);
  }
  res.json(info);
});
app.get("/refresh", async (req, res) => {
  await refreshCatalog();
  res.set("content-type", "text/plain; charset=utf-8").send(
    "\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u2714 | \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0641\u064A\u062F: " + Object.keys(feedPrices).length + " | \u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: " + (liveCatalogUpdatedAt ? liveCatalogUpdatedAt.toISOString() : "-")
  );
});
var PORT = process.env.PORT || 3e3;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Liwa Dates bot running on port ${PORT}`));
}
module.exports = app;
