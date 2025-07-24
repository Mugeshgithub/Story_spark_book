# Google Drive Integration Setup Guide

This guide will help you set up Google Drive storage for your Story Spark application.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. Node.js environment (for server-side API calls)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - Name: "StorySpark Drive Service"
   - Description: "Service account for Story Spark app"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file (keep it secure!)

## Step 4: Set Up Environment Variables

Create or update your `.env` file with the following variables:

```env
# Google Drive Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Existing variables
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** The `GOOGLE_PRIVATE_KEY` should be the entire private key from the JSON file, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts.

## Step 5: Share Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called "StorySpark_Sessions" (or any name you prefer)
3. Right-click the folder > "Share"
4. Add your service account email as a collaborator with "Editor" permissions
5. Make sure the folder is accessible to the service account

## Step 6: Update Environment Variables

If you want to use a different folder name, update the `FOLDER_NAME` constant in `src/lib/google-drive.ts`:

```typescript
const FOLDER_NAME = 'Your_Custom_Folder_Name';
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try uploading an image in the story editor
3. Check your Google Drive folder to see if files are being uploaded

## Troubleshooting

### Common Issues:

1. **"Invalid private key" error**
   - Make sure the private key includes the `\n` characters
   - The key should be wrapped in quotes in your `.env` file

2. **"Permission denied" error**
   - Ensure the service account has access to the Google Drive folder
   - Check that the Google Drive API is enabled

3. **"Service account not found" error**
   - Verify the service account email in your `.env` file
   - Make sure the service account exists in your Google Cloud project

### Debug Steps:

1. Check the browser console for error messages
2. Check the server logs for API errors
3. Verify your environment variables are loaded correctly
4. Test the Google Drive API directly using the Google Cloud Console

## Security Notes

- Keep your service account JSON file secure
- Never commit the JSON file or private key to version control
- Consider using environment-specific service accounts for development/production
- Regularly rotate your service account keys

## File Structure

Your Google Drive folder will contain:
- `story-content-image-{timestamp}.png` - Images uploaded in the editor
- `drawing-{bookId}-{timestamp}.png` - Drawing canvas images
- `{StoryTitle}_{sessionId}.json` - Complete session data

## API Endpoints

The following API endpoints are available:

- `POST /api/drive/upload-image` - Upload images
- `POST /api/drive/upload-session` - Upload complete sessions
- `GET /api/drive/sessions` - List all sessions
- `POST /api/drive/sessions` - Download a specific session
- `DELETE /api/drive/sessions` - Delete a session

## Next Steps

Once the basic setup is working, you can:

1. Add session management features
2. Implement automatic backups
3. Add file organization features
4. Implement sync across devices
5. Add offline support with local caching

## Support

If you encounter issues:

1. Check the Google Cloud Console for API quotas and errors
2. Verify your service account permissions
3. Test with a simple file upload first
4. Check the browser network tab for API call details 