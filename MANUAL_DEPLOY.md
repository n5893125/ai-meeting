
# Manual Deployment Guide

Since the automated deployment tool is facing system environment issues, please follow these simple steps to deploy your application manually.

## Step 1: Open Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages**.
3. Click **Create Application** -> **Pages** -> **Upload assets**.

## Step 2: Upload the Build Folder
1. Name your project `ai-meeting`.
2. When asked to upload assets, select the following folder:
   `C:\Users\kyhsu\.gemini\ai-meeting-build-temp\dist`
   
   *(I have opened this folder for you in File Explorer)*

## Step 3: Configure Environment Variables
1. Once uploaded and deployed, go to the project **Settings**.
2. Click **Environment variables**.
3. Add a new variable:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: (Your Google Gemini API Key)

## Step 4: Add Functions (Backend)
The backend functions need to be deployed as well. Since we are doing a manual asset upload, the functions might not be automatically included if you only upload `dist`.

**However**, Cloudflare Pages usually requires `wrangler` for functions.
If you cannot run `wrangler`, you might only get the frontend.

To deploy functions manually without wrangler is difficult.
But we can try to upload the `functions` folder if the UI allows it?
*Note: Cloudflare Pages "Direct Upload" usually only supports static assets. Functions require git integration or wrangler.*

**Alternative:**
If you can connect your Cloudflare Pages to your **GitHub repository**, that is the BEST way.
1. Push your code to GitHub.
2. Connect Cloudflare Pages to your GitHub repo.
3. Set the build command to `npm run build`.
4. Set the build output directory to `dist`.
5. Add the `GEMINI_API_KEY` in settings.

This avoids all local environment issues.
