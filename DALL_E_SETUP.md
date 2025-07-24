# DALL-E API Setup for Image Generation

## 🎨 **Why DALL-E?**

Your Firebase deployment likely uses DALL-E or a similar image generation service. To get the same quality image generation locally, you need to add DALL-E API support.

## 📋 **Setup Steps**

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Add to Environment Variables
Add this line to your `.env` file:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Restart the Server
```bash
npm run dev
```

## 🚀 **How It Works**

1. **User clicks "Illustrate this?"** → ParagraphActions component
2. **ParagraphActions calls generateImageForStory** → AI Flow
3. **AI Flow sends prompt to DALL-E API** → Creates high-quality image
4. **Image returned as Data URI** → Displayed in your story

## 💰 **Cost**

- DALL-E 3: ~$0.04 per image
- Very affordable for personal use
- Same quality as your Firebase deployment

## 🔧 **Alternative: Check Your Firebase**

If you want to see what image generation service your Firebase deployment uses:

1. Check your Firebase environment variables
2. Look for image generation API keys
3. Copy the same configuration to local development

## ✅ **Current Status**

- ✅ Story Creation: Working
- ✅ Chat with AI: Working  
- ✅ Local Storage: Working
- ✅ Image Generation: Ready for DALL-E API key

**Just add your OpenAI API key to `.env` and restart the server!** 