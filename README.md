This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
Add your firebase website app SDKs

🔐 Environment Variables Setup
Create a .env file in the root of the project and add the following:

VITE_FIREBASE_API_KEY=<br>
VITE_FIREBASE_AUTH_DOMAIN=<br>
VITE_FIREBASE_PROJECT_ID=<br>
VITE_FIREBASE_STORAGE_BUCKET=<br>
VITE_FIREBASE_MESSAGING_SENDER_ID=<br>
VITE_FIREBASE_APP_ID=<br>
VITE_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY


⚠️ Important:
Do NOT commit your .env file to GitHub.
Add it to .gitignore.

By Dheeraj
