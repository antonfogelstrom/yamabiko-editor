# Yamabiko Editor

A robust, web-based visual novel and dialogue management tool built with **React**, **TypeScript**, and **Supabase**. This editor allows creators to craft branched narratives, manage character dialogues, and export scene data as JSON for game engine integration.

---

## 🚀 Features

* **Authentication**: Secure GitHub OAuth integration via Supabase.
* **Scene Management**: Create, delete, and import scenes. Includes a drag-and-drop sidebar for reordering story flow.
* **Dialogue Editor**: 
    * Rich dialogue blocks with name, portrait, and mood selection.
    * Dynamic "Choice Blocks" for branching paths.
* **JSON Integration**: Export scenes to JSON format or import existing story files.
* **Responsive Design**: Fully functional on mobile and desktop.

---

## 🛠️ Technical Stack

* **Frontend**: React, TypeScript, Tailwind CSS.
* **Backend/BaaS**: Supabase (Auth & Database).

---

## ⚙️ Getting Started

### Prerequisites
* Node & npm
* A Supabase project with a `scenes` table and base data tables.

### Installation
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**: Edit the `.env` file to match your environment:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_DEV_AUTH_REDIRECT=http://localhost:5173
    VITE_PROD_AUTH_REDIRECT=https://your-domain.com
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 🗄️ Database Schema

Run the following SQL in your Supabase SQL Editor to set up the required tables and Row Level Security (RLS).

```sql
-- todo
```
