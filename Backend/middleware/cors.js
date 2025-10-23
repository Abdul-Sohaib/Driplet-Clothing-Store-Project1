const cors = require('cors');
const productionConfig = require('../config/production');

const allowedProductionDomains = [
  productionConfig.CLIENT_APP_URL,
  productionConfig.ADMIN_APP_URL,
  productionConfig.CUSTOM_DOMAIN,
  'http://localhost:5173',
  'http://localhost:5174', // ADDED: Your actual dev port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🌐 CORS Check - Origin: ${origin || 'None'}, Environment: ${process.env.NODE_ENV || 'development'}`);

    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }

    const devOriginPatterns = [
      /^https?:\/\/localhost:[0-9]{4,5}$/,
      /^https?:\/\/127\.0\.0\.1:[0-9]{4,5}$/,
      /^https?:\/\/192\.168\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{4,5}$/,
    ];
    const devTunnelKeywords = ['ngrok.io', 'ngrok-free.app', 'devtunnels.ms', 'loca.lt', 'serveo.net', 'tunnel.local'];

    if (
      devOriginPatterns.some((r) => r.test(origin)) ||
      devTunnelKeywords.some((kw) => origin.includes(kw))
    ) {
      console.log(`🔓 Development origin allowed: ${origin}`);
      return callback(null, true);
    }

    if (allowedProductionDomains.includes(origin)) {
      console.log(`✅ Production origin allowed: ${origin}`);
      return callback(null, true);
    }

    if (origin.includes('netlify.app') || origin.includes('netlify.com')) {
      console.log(`✅ Netlify deploy preview allowed: ${origin}`);
      return callback(null, true);
    }

    const isSubdomain = allowedProductionDomains.some(domain => {
      try {
        const allowedHost = new URL(domain).hostname;
        const originHost = new URL(origin).hostname;
        return originHost === allowedHost || originHost.endsWith(`.${allowedHost}`);
      } catch {
        return false;
      }
    });

    if (isSubdomain) {
      console.log(`✅ Subdomain match allowed: ${origin}`);
      return callback(null, true);
    }

    console.log(`🚫 Blocking origin: ${origin}`);
    console.log(`   Allowed domains: ${allowedProductionDomains.join(', ')}`);
    return callback(new Error(`CORS Error: Origin ${origin} not allowed`));
  },

  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cookie',
    'x-razorpay-signature',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Cache', 'Set-Cookie', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// ADDED: Separate preflight options for better handling
const preflightCorsOptions = {
  ...corsOptions,
  maxAge: 86400 // 24 hours
};

module.exports = {
  corsOptions,
  preflightCorsOptions,
  allowedProductionDomains,
};