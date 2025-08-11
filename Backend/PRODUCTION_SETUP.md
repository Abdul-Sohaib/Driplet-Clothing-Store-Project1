# Production Setup Guide

This guide explains how to configure your backend for production deployment with proper CORS and cookie settings.

## 🚀 Quick Start

1. **Set Environment Variable**: `NODE_ENV=production`
2. **Update Netlify URLs**: Edit `config/production.js`
3. **Restart Server**: Changes take effect after restart

## 📋 Prerequisites

- Your frontend deployed to Netlify
- Your backend deployed to a hosting service (Heroku, Railway, etc.)
- Environment variable `NODE_ENV` set to `production`

## 🔧 Configuration Steps

### Step 1: Set Production Environment

Set the environment variable in your hosting platform:

```bash
NODE_ENV=production
```

### Step 2: Update Netlify URLs

Edit `Backend/config/production.js` and replace the placeholder URLs:

```javascript
module.exports = {
  // Replace with your actual Netlify URLs
  CLIENT_APP_URL: 'https://your-actual-client-app.netlify.app',
  ADMIN_APP_URL: 'https://your-actual-admin-app.netlify.app',
  CUSTOM_DOMAIN: 'https://your-custom-domain.com', // Optional
};
```

**Example:**
```javascript
CLIENT_APP_URL: 'https://driplet-store.netlify.app',
ADMIN_APP_URL: 'https://driplet-admin.netlify.app',
CUSTOM_DOMAIN: 'https://driplet.com',
```

### Step 3: Verify Cookie Settings

The backend automatically configures cookies based on environment:

- **Development**: `secure: false`, `sameSite: 'lax'`
- **Production**: `secure: true`, `sameSite: 'none'`

### Step 4: Restart Your Server

After making changes, restart your backend server for the new configuration to take effect.

## 🌐 CORS Configuration

### Development Mode
- Allows `localhost:5173` (Client Panel)
- Allows `localhost:3000` (Admin Panel)
- Allows dev tunnels (ngrok, devtunnels.ms)
- Allows all origins for flexibility

### Production Mode
- **ONLY** allows the domains specified in `config/production.js`
- Strict origin validation for security
- Blocks all unauthorized origins

## 🍪 Cookie Configuration

### Development Mode
```javascript
{
  httpOnly: true,        // Security: prevents XSS
  secure: false,         // Allows HTTP for localhost
  sameSite: 'lax'       // Allows cross-site requests
}
```

### Production Mode
```javascript
{
  httpOnly: true,        // Security: prevents XSS
  secure: true,          // HTTPS only
  sameSite: 'none'       // Required for cross-site cookies
}
```

## 🔒 Security Features

- **CORS**: Restricts origins to only your Netlify domains
- **Cookies**: `httpOnly` prevents XSS attacks
- **HTTPS**: Production cookies require secure connections
- **Rate Limiting**: 100 requests per 15 minutes per IP

## 📁 File Structure

```
Backend/
├── middleware/
│   ├── cors.js          # Centralized CORS configuration
│   └── cookies.js       # Centralized cookie configuration
├── config/
│   └── production.js    # Production settings
├── server.js            # Main server file
└── PRODUCTION_SETUP.md  # This guide
```

## 🧪 Testing

### Test CORS Configuration

1. **Development**: Should work with localhost and dev tunnels
2. **Production**: Should only work with your Netlify domains

### Test Cookie Configuration

1. **Development**: Cookies work over HTTP
2. **Production**: Cookies only work over HTTPS

## 🚨 Troubleshooting

### CORS Errors in Production

1. **Check Environment**: Ensure `NODE_ENV=production`
2. **Verify URLs**: Check `config/production.js` has correct Netlify URLs
3. **Check Logs**: Look for CORS origin validation messages
4. **Restart Server**: Configuration changes require server restart

### Cookie Issues in Production

1. **HTTPS Required**: Ensure frontend is served over HTTPS
2. **Domain Match**: Verify cookie domain matches your frontend domain
3. **SameSite**: Production uses `sameSite: 'none'` for cross-site cookies

### Common Issues

- **"Origin not allowed"**: Update `config/production.js` with correct URLs
- **"Cookie not set"**: Ensure frontend uses HTTPS in production
- **"CORS preflight failed"**: Check preflight configuration in `middleware/cors.js`

## 📝 Environment Variables

Required environment variables for production:

```bash
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
MONGODB_URI=your-mongodb-connection-string
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

## 🔄 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update Netlify URLs in `config/production.js`
- [ ] Verify all environment variables are set
- [ ] Test CORS with production domains
- [ ] Test cookie functionality
- [ ] Restart server
- [ ] Monitor logs for any errors

## 📞 Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your configuration matches the examples above
3. Ensure all environment variables are properly set
4. Test with a simple CORS request first

## 🔐 Security Notes

- **Never** commit sensitive information to version control
- **Always** use HTTPS in production
- **Regularly** update your dependencies
- **Monitor** your server logs for suspicious activity
- **Use** strong, unique JWT secrets
