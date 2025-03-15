---
id: deployment-guide
title: Deployment Guide
sidebar_label: Deployment Guide
description: Step-by-step guide for deploying the Word Scramble Game to your domain
keywords: [deployment, hosting, domain, web server, HTTPS, DNS]
---

# Deployment Guide

This guide provides detailed instructions for deploying the Word Scramble Game to your custom domain. It covers the entire process from preparing your codebase to configuring your domain and web server.

## 1. Preparing Your Codebase for Production

### 1.1 Build the Production Version

Before deploying, you need to create an optimized production build:

```bash
# Navigate to your project directory
cd /path/to/word-scramble-game

# Install dependencies if you haven't already
npm install

# Build the production version
npm run build
```

This will create a `dist` directory containing optimized files ready for deployment.

### 1.2 Verify the Production Build

Test your production build locally before deployment:

```bash
npm run serve
```

Visit `http://localhost:5000` in your browser to ensure everything works correctly.

### 1.3 Update Service Worker Configuration

Ensure the service worker is properly configured for your domain by updating the `service-worker.js` file:

- Verify that all essential assets are included in the `urlsToCache` array
- Make sure the cache name is appropriate (e.g., `word-scramble-v1`)
- Test offline functionality in your local environment

### 1.4 Update Manifest.json

Modify the `manifest.json` file to reflect your domain:

```json
{
  "name": "Word Scramble Game",
  "short_name": "Word Scramble",
  "start_url": "/index.html",
  "scope": "/",
  // Other manifest properties...
}
```

## 2. Domain Configuration

### 2.1 Register Your Domain (if not already done)

If you haven't already registered your domain, you can do so through various domain registrars like:

- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### 2.2 Configure DNS Records

1. Log in to your domain registrar's dashboard
2. Navigate to the DNS management section
3. Set up the following records:

   **For traditional web hosting:**
   - Type: A Record
   - Name: @ (or subdomain like "game")
   - Value: Your web server's IP address
   - TTL: 3600 (or as recommended)

   **For Cloudflare or similar CDN:**
   - Type: CNAME Record
   - Name: @ (or subdomain)
   - Value: Your hosting provider's domain (e.g., `yoursite.netlify.app`)
   - TTL: Auto

   **For www subdomain (optional):**
   - Type: CNAME Record
   - Name: www
   - Value: @ (or your main domain)
   - TTL: 3600

4. Save your changes

> **Note:** DNS changes can take 24-48 hours to propagate globally, although they often take effect much sooner.

## 3. Web Hosting Setup

### 3.1 Traditional Web Hosting

#### 3.1.1 Choose a Web Hosting Provider

Select a hosting provider that supports:
- HTTPS (required for PWA functionality)
- Sufficient storage for your application
- Adequate bandwidth for expected traffic

Popular options include:
- Bluehost
- SiteGround
- HostGator
- A2 Hosting

#### 3.1.2 Upload Files to Web Server

1. Connect to your web server using FTP/SFTP:
   ```bash
   # Using FTP client like FileZilla or
   scp -r ./dist/* username@your-server:/path/to/public_html/
   ```

2. Ensure all files maintain their directory structure

#### 3.1.3 Configure Web Server

**For Apache:**

Create or update `.htaccess` file in your root directory:

```apache
# Enable HTTPS redirection
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Set caching headers for static assets
<FilesMatch "\.(html|htm)$">
  Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
</FilesMatch>
<FilesMatch "\.(js|css|json)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
<FilesMatch "\.(jpg|jpeg|png|gif|ico|svg)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>

# Handle SPA routing (redirect to index.html)
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**For Nginx:**

Update your server block configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /path/to/your/files;
    index index.html;
    
    # Caching rules
    location ~* \.(html|htm)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    location ~* \.(js|css|json)$ {
        add_header Cache-Control "public, max-age=31536000";
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        add_header Cache-Control "public, max-age=31536000";
    }
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Service worker needs special handling
    location /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 3.2 Cloud Hosting Options

#### 3.2.1 Firebase Hosting

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Select your Firebase project
   - Specify `dist` as your public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys: No (for now)

3. Deploy to Firebase:
   ```bash
   npm run deploy
   # or directly with
   firebase deploy --only hosting
   ```

4. Connect your custom domain in the Firebase Console:
   - Go to Hosting section
   - Click "Add custom domain"
   - Follow the verification steps

#### 3.2.2 Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```
   - Specify `dist` as your publish directory

3. Connect your custom domain:
   - Go to Netlify dashboard > Domain settings
   - Click "Add custom domain"
   - Follow the verification steps

#### 3.2.3 Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```
   - Follow the prompts to configure your project

3. Connect your custom domain:
   - Go to Vercel dashboard > Project settings > Domains
   - Add your domain and follow verification steps

## 4. SSL/HTTPS Configuration

### 4.1 Obtain SSL Certificate

**Option 1: Let's Encrypt (Free)**

1. Install Certbot on your server:
   ```bash
   # For Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install certbot
   
   # For Apache
   sudo apt-get install python3-certbot-apache
   
   # For Nginx
   sudo apt-get install python3-certbot-nginx
   ```

2. Generate certificate:
   ```bash
   # For Apache
   sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
   
   # For Nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. Set up auto-renewal:
   ```bash
   sudo certbot renew --dry-run
   ```

**Option 2: Paid SSL Certificate**

Purchase from providers like:
- DigiCert
- Comodo
- GeoTrust

Follow their specific installation instructions.

### 4.2 Verify HTTPS Configuration

1. Visit your site using HTTPS
2. Check for the padlock icon in the browser
3. Test using SSL verification tools like [SSL Labs](https://www.ssllabs.com/ssltest/)

## 5. Post-Deployment Verification

### 5.1 Test PWA Functionality

1. Visit your site on a mobile device
2. Verify that "Add to Home Screen" works
3. Test offline functionality by enabling airplane mode
4. Check that cached assets load correctly

### 5.2 Performance Testing

1. Run Lighthouse audit in Chrome DevTools
2. Address any performance, accessibility, or PWA issues
3. Test on various devices and browsers

### 5.3 Monitor and Maintain

1. Set up monitoring for your site (e.g., Google Analytics, Uptime Robot)
2. Implement a regular update schedule
3. Plan for future version deployments

## 6. Troubleshooting Common Issues

### 6.1 HTTPS Issues

- **Mixed Content Warnings**: Ensure all resources are loaded over HTTPS
- **Certificate Errors**: Verify certificate installation and renewal

### 6.2 PWA Problems

- **Service Worker Not Registering**: Check browser console for errors
- **Manifest Not Loading**: Verify path and MIME type configuration
- **Offline Mode Not Working**: Test cache storage and service worker fetch handlers

### 6.3 DNS Configuration

- **Domain Not Resolving**: Verify DNS records are correct
- **Subdomain Issues**: Check CNAME or A records for subdomains

## 7. Updating Your Deployed Application

### 7.1 Implement Changes

1. Make changes to your codebase
2. Test locally
3. Build new production version

### 7.2 Deploy Updates

1. Upload new files to server or use deployment command
2. Verify changes on live site
3. Clear browser caches if necessary

### 7.3 Update Service Worker

1. Increment cache version in service-worker.js
2. Test that new assets are cached correctly

## Conclusion

By following this deployment guide, you've successfully deployed the Word Scramble Game to your custom domain. The game is now accessible to users worldwide with full PWA functionality, allowing for offline play and installation on mobile devices.

Remember to regularly update your application and monitor its performance to ensure the best user experience.