# ZenTask

A sophisticated Todo list and productivity tracker with daily tracking, visual monthly reports, and show productivity insights.
Can run without sign-up but data will be stored in your browser, removing your browser data will lost.

## Features

* **Daily Task Management:** Organize and track your daily to-dos.
* **Monthly Habits:** Build and monitor recurring habits over time.
* **Goal Tracking:** Set long-term goals and break them down into actionable steps.
* **Challenges:** Participate in productivity challenges to stay motivated.
* **Visual Reports:** View your progress through comprehensive charts and monthly dashboards.
* **Customization:** Support for dark mode and multiple color themes.
* **Authentication:** Secure login via Firebase, plus a convenient Guest Mode for quick access.
* **Theme** Different themes to support your mood

## Tech Stack

* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS, ShadCN
* **Charts:** Recharts
* **Backend/Auth:** Firebase Authentication

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dheer152004/Zentask.git
   cd Zentask
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Gemini API key and Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_VAPID_KEY=
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

This project is licensed under the MIT License.
