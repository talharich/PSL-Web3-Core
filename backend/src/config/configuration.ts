export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminSecret: process.env.ADMIN_SECRET || 'dev-secret',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',

  chain: {
    rpcUrl: process.env.WIREFLUID_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    wsUrl: process.env.RPC_WS_URL,
  },

  contracts: {
    nft:         process.env.NFT_CONTRACT_ADDRESS,
    oracle:      process.env.ORACLE_CONTRACT_ADDRESS,
    marketplace: process.env.MARKETPLACE_CONTRACT_ADDRESS,
    yield:       process.env.YIELD_CONTRACT_ADDRESS,
  },

  cricapi: {
    key:      process.env.CRICAPI_KEY,
    seriesId: process.env.PSL_SERIES_ID,
    baseUrl:  'https://api.cricapi.com/v1',
  },

  pinata: {
    apiKey:    process.env.PINATA_API_KEY,
    secretKey: process.env.PINATA_SECRET_KEY,
    gateway:   'https://gateway.pinata.cloud/ipfs',
  },

  stripe: {
    secretKey:     process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // ── Email (SMTP) ────────────────────────────────────────────────────────
  email: {
    host:   process.env.SMTP_HOST   || 'sandbox.smtp.mailtrap.io',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',   // true for port 465
    user:   process.env.SMTP_USER,
    pass:   process.env.SMTP_PASS,
    from:   process.env.SMTP_FROM   || '"PSL Moments" <noreply@psldynamicmoments.com>',
  },
});