# CORS Troubleshooting Guide

## Overview
This guide helps resolve CORS (Cross-Origin Resource Sharing) issues when your frontend is running on a dev tunnel or different origin than your backend.

## Current CORS Configuration
The server is configured to allow:
- Localhost origins (http://localhost:* and https://localhost:*)
- Dev tunnel origins (devtunnels.ms, ngrok.io, etc.)
- All origins in development mode

## Testing CORS Configuration

### 1. Test Health Check Endpoint
```bash
curl -H "Origin: https://your-dev-tunnel-url.devtunnels.ms" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5000/api/health
```

### 2. Test CORS Test Endpoint
```bash
curl -H "Origin: https://your-dev-tunnel-url.devtunnels.ms" \
     http://localhost:5000/api/cors-test
```

### 3. Test Categories Endpoint
```bash
curl -H "Origin: https://your-dev-tunnel-url.devtunnels.ms" \
     http://localhost:5000/api/categories
```

## Common Issues and Solutions

### Issue: "No 'Access-Control-Allow-Origin' header"
**Solution**: Check that your backend server is running and the CORS middleware is properly configured.

### Issue: Preflight request fails
**Solution**: Ensure the server handles OPTIONS requests properly. The current configuration includes:
```javascript
app.options('*', cors());
```

### Issue: Specific origin not allowed
**Solution**: Check the server logs for CORS origin checks. The server logs all CORS decisions.

## Debugging Steps

1. **Check Server Logs**: Look for CORS-related log messages when making requests
2. **Verify Origin**: Ensure the frontend origin matches what's expected
3. **Test with curl**: Use the curl commands above to test CORS directly
4. **Check Network Tab**: In browser dev tools, check the Network tab for CORS errors

## Environment Variables

Set these environment variables if needed:
```bash
NODE_ENV=development  # Allows all origins in development
```

## Production Considerations

⚠️ **IMPORTANT**: In production, remove the development mode CORS bypass:
```javascript
// Remove this in production
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
  console.log(`🔓 Development mode: Allowing origin: ${origin}`);
  return callback(null, true);
}
```

## Testing Your Frontend

1. Make sure your backend server is running on port 5000
2. Test the health check endpoint first: `http://localhost:5000/api/health`
3. Test the CORS test endpoint: `http://localhost:5000/api/cors-test`
4. Then try your frontend requests

## Still Having Issues?

1. Check the server console for CORS log messages
2. Verify the frontend origin in the request headers
3. Test with a simple curl command first
4. Check if any other middleware is interfering with CORS
