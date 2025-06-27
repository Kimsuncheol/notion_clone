# Firebase Email Link Authentication Setup

## 🔧 Firebase Console Configuration

### Step 1: Enable Email Link Authentication

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project**
3. **Navigate to Authentication > Sign-in method**
4. **Click on "Email/Password"**
5. **Enable "Email link (passwordless sign-in)"**
6. **Click "Save"**

### Step 2: Configure Authorized Domains

1. **In Authentication settings**, go to **"Authorized domains"** tab
2. **Add your domains**:
   - `localhost:3000` (for development)
   - `localhost:3001` (if using different port)
   - Your production domain (when deploying)

### Step 3: Set up Dynamic Links (Optional but Recommended)

1. **Go to "Dynamic Links" in Firebase Console**
2. **Get started** and set up your domain
3. **This creates more reliable email links that work across devices**

## 🔧 Environment Variables Required

Make sure your `.env.local` file contains:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# Anthropic Claude API Configuration (for AI Chat feature)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Code Execution API (Optional - for code block execution)
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here
```

## 🤖 Setting up Anthropic Claude API

To enable the AI chat feature, you'll need to:

1. **Sign up for Anthropic API**: Go to [console.anthropic.com](https://console.anthropic.com)
2. **Get your API key**: Create a new API key in your Anthropic console
3. **Add to environment**: Add `ANTHROPIC_API_KEY=your_key_here` to your `.env.local` file
4. **Restart your development server** after adding the API key

## 📧 How Email Link Authentication Works

1. **User enters email** on sign-in page
2. **Firebase sends magic link** to their email
3. **User clicks link** in email
4. **Redirected back to app** and automatically signed in
5. **Access granted** to their workspace

## ✅ Testing the Implementation

1. **Start your development server**: `npm run dev`
2. **Go to**: `http://localhost:3000/signin`
3. **Enter your email address**
4. **Check your email** for the sign-in link
5. **Click the link** to complete authentication
6. **You should be redirected** to `/note/initial`

## 🐛 Troubleshooting

### Common Issues:

1. **"auth/invalid-email"** - Check email format
2. **"auth/missing-email"** - Ensure email field is not empty
3. **Link doesn't work** - Check authorized domains in Firebase Console
4. **Email not received** - Check spam folder, verify Firebase project settings

### Email Provider Issues:

- **Gmail**: Usually works instantly
- **Outlook/Hotmail**: May take a few minutes
- **Corporate emails**: May be blocked by firewall

## 🎨 Features Included

✅ **Clean, modern UI** with email input form
✅ **Loading states** with spinner animation
✅ **Success/error handling** with toast notifications
✅ **Email confirmation screen** after sending link
✅ **Resend functionality** if email doesn't arrive
✅ **Cross-device support** with email prompt
✅ **Automatic redirect** after successful sign-in
✅ **Dark mode support** matching your app theme

The implementation is now complete and ready to use! 