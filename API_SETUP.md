# Google Gemini API Setup Guide — Rahul Scripts

Follow these steps to connect your Google Gemini API key to **Viral Video AI Studio**:

---

## 🔑 Step 1: Obtain a Free Gemini API Key

1. Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Select or create a Google Cloud project to associate with your key.
5. Copy the generated API key (it typically begins with `AIzaSy...`).

---

## ⚙️ Step 2: Configure in Viral Video AI Studio

1. Open the extension and click the **Settings** icon in the navigation bar.
2. In the **Google Gemini API Key** field, paste your key.
3. Click **Save Key**.
4. Click **Test Connection**:
   - A live verification ping will test the Google endpoint.
   - Upon success, you will see a green **"Gemini API connection successful!"** banner.

---

## 🤖 Step 3: Choose Your Model

In **Settings > AI Provider & Execution Mode**:
- **Gemini 3.6 Flash** *(Latest & Recommended)*: High-performance multimodal video frame analysis with minimal latency and high rate limits.
- **Gemini 1.5 Flash**: Standard robust multimodal model for general use.
- **Gemini 1.5 Pro**: Advanced reasoning model for complex documentary or academic video breakdowns.

---

## 📴 Step 4: Offline Testing with Mock Mode

If you do not have an API key or want to test without spending quota:
1. In **Settings**, toggle **Enable Mock Mode (100% Offline)** to **ON**.
2. Upload videos as usual. The engine will simulate realistic multimodal analysis across 10 rich content categories (Pets, Cooking, Tech Review, Fitness, Travel, etc.) in English, Hindi, and Hinglish.

---

## 🔒 Security Best Practices

- **Never share your API key** or commit `.env` files with keys to GitHub.
- Keys in Viral Video AI Studio are stored locally in Chrome's encrypted `chrome.storage.local` sandbox.
- Keys are never transmitted to Rahul Scripts servers, telemetry, or analytics.
