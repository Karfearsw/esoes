# Es O Es - Roadside Assistance App

## About Es O Es - When You Need It Most
Get instant roadside assistance, mobile mechanics, and automotive services on-demand. Fast, reliable, and vetted professionals at your fingertips.

## Overview
Es O Es is an on-demand roadside assistance application that connects users with service providers for automotive emergencies.

## Features
- User authentication (customers and service providers)
- Service request management
- Real-time location tracking
- Payment processing
- Rating and review system

## Deployment Instructions

### Deploying to Vercel

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Initialize Git in your project folder (if not already done):
     ```
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/yourusername/esoes.git
     git push -u origin main
     ```

2. **Deploy on Vercel**
   - Go to [Vercel](https://vercel.com/) and sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Build Command: npm run build
     - Output Directory: dist
   - Click "Deploy"

3. **Troubleshooting Common Issues**
   - If you encounter path resolution issues, check that:
     - All import paths in index.html use relative paths (./src instead of /src)
     - The vite.config.js has `base: './'` configured
     - The vercel.json file is properly set up for SPA routing

## Development

### Setup
```
npm install
```

### Run Development Server
```
npm run dev
```

### Build for Production
```
npm run build
```

### Preview Production Build
```
npm run preview
```