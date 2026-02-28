# Fan-Fictioning

*Built for the **Cerebral Valley Gemini 3 NYC Hackathon**.*

**Fan-Fictioning** is a modern, AI-powered web application built with [Next.js](https://nextjs.org/) and Tailwind CSS that generates vibrant, multi-panel comic strips from user prompts, favorite characters, and even YouTube videos! 

Using the power of Google's Gemini Models, users can create dynamic graphic narratives instantly, view them in a dynamic home feed, and discuss them in deeply nested, Reddit-style comment threads.

---

## 🚀 Features

- **AI Comic Generation**: 
  - Input a favorite character and a fun prompt.
  - Optionally provide a YouTube URL for context character analysis.
  - Generates an authentic comic dialogue script using Gemini (`gemini-2.5-pro`).
  - Renders a visually stunning multi-panel comic strip page from that script using Nano Banana 2.
- **Home Feed**: A continuously scrolling social feed of all generated comics from users, formatted playfully like Twitter/X.
- **Nested Commenting System**: 
  - Click on any comic to dive into its dedicated discussion page.
  - Read, reply, and upvote comments in an infinitely deep, recursive Reddit-style thread structure.
- **Sleek UI/UX (Dark Mode)**: 
  - Fully responsive layout built with Tailwind CSS.
  - Native dark mode support out of the box (`dark:bg-black`). 
  - Modern, responsive sidebar navigation.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS 
- **Icons:** Lucide React
- **Database:** `better-sqlite3` (Local SQLite database)
- **AI Integration:** `@google/genai` (Google Gemini Pro text and image models)

---

## 💻 Running Locally

### 1. Requirements
Ensure you have Node.js and npm installed on your machine.

### 2. Install Dependencies
```bash
npm install
```

### 3. API Key Configuration
The app requires a Google Gemini API key to generate comics. Next to the project root, create a `.env.local` file with the following variable:
```env
GEMINI_API_KEY="your_actual_api_key_here"
```

### 4. Start the Application
Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app!

---

## 🗄️ Database
The project utilizes a simple local SQLite file (`database.sqlite`) to store comics, users, comments, and likes. No external database provisioning is required for local development. Data is accessed and managed natively via wrapper functions inside `lib/db.ts`.

---

## 🚀 Future Roadmap (Deployment to Vercel)
If you wish to deploy this app to production platforms like Vercel, the local SQLite database must be migrated to a hosted cloud provider:
1. Swap `better-sqlite3` with **Vercel Postgres** or another ORM.
2. Integrate an Authentication provider (like **Clerk** or **NextAuth.js**) instead of local mock users.
