# 🚀 Story Spark Deployment Guide

## Quick Deploy to Firebase (Recommended)

### Prerequisites
1. **Firebase CLI installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project initialized:**
   ```bash
   firebase login
   firebase init
   ```

### Deploy Steps

1. **Build and Deploy:**
   ```bash
   npm run deploy
   ```

2. **Deploy everything (Hosting + Firestore + Storage):**
   ```bash
   npm run deploy:all
   ```

## Alternative Deployment Options

### 1. Vercel (Next.js Native)
```bash
npm install -g vercel
vercel
```

### 2. Netlify
```bash
npm run build
# Upload the 'out' folder to Netlify
```

### 3. Railway
```bash
# Connect your GitHub repo to Railway
# Railway will auto-deploy
```

### 4. DigitalOcean App Platform
```bash
# Connect your GitHub repo
# Set build command: npm run build
# Set run command: npm start
```

## Environment Variables for Production

Make sure to set these in your deployment platform:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services
GEMINI_API_KEY=your_gemini_key
HUGGING_FACE_API_KEY=your_hf_key

# Google Drive (if using)
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

## Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Test story creation
- [ ] Test image generation
- [ ] Test PDF export
- [ ] Check mobile responsiveness
- [ ] Verify all API endpoints work

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check TypeScript errors: `npm run typecheck`
   - Check linting: `npm run lint`

2. **Environment variables missing:**
   - Verify all required env vars are set in deployment platform

3. **Firebase rules issues:**
   - Check Firestore and Storage rules
   - Test with Firebase console

4. **Image generation not working:**
   - Verify API keys are set correctly
   - Check CORS settings if needed

## Performance Optimization

1. **Enable caching:**
   - Set up CDN for static assets
   - Configure Firebase Hosting caching

2. **Optimize images:**
   - Use WebP format where possible
   - Implement lazy loading

3. **Monitor performance:**
   - Use Firebase Analytics
   - Monitor Core Web Vitals 