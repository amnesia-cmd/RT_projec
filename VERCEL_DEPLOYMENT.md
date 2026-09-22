# Deployment to Vercel Guide

This application is ready to deploy to Vercel. Because the backend utilizes `/api/inspect-rt` with Gemini Multimodal Vision API, you can deploy it in two simple steps:

### Method 1: Deploy with Vercel CLI (Recommended)

1. Export or clone the repository to your local machine (via the AI Studio **Export** menu).
2. Install the Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```
3. Run the deployment command from the project root:
   ```bash
   vercel
   ```
4. Set your environment variable in your Vercel Project Settings (or during deployment):
   - **`GEMINI_API_KEY`**: Your Google Gemini API Key from Google AI Studio.

---

### Method 2: Deploy via GitHub & Vercel Dashboard

1. In Google AI Studio, click the menu in the top-right and select **Export to GitHub** (or download as ZIP and push to GitHub).
2. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
3. In **Build and Output Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: `<Your Gemini API key>`
5. Click **Deploy**.

---

### Cloud Run & Live Preview
Your live preview is always accessible in AI Studio:
- **Cloud Run Preview**: Access your live URL from the preview address bar.
