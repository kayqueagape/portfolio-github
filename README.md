# GitHub Portfolio

Project that connects to your GitHub, lists all repositories, and allows you (admin) to edit the “about the project” explanations for each repo.  
Made with **React (JSX)**, **Tailwind CSS**, and **REST API**.

## Structure

- **`api/`** — Node.js + Express backend (REST API)
  - Searches GitHub repos
  - Stores custom descriptions in `api/data/descriptions.json`
- **`web/`** — React + Vite + Tailwind frontend
  - Home page: list of repositories
  - Admin page: edit project descriptions

## How to run

### 1. Configure GitHub user (API)

In the `api` folder, create a `.env` file (copy from `.env.example`):

```env
PORT=3001
GITHUB_USER=your-github-user
```

Replace `your-github-user` with your GitHub user.

### 2. Upload the API

```bash
cd api
npm install
npm run dev
```

The API will be located at `http://localhost:3001`.

### 3. Upload the frontend

In another terminal:

```bash
cd web
npm install
npm run dev
```

The website will open at `http://localhost:5173`. Vite is configured to proxy `/api` to the API, so you don't need to configure the URL in the frontend under development.

### 4. Usage

- On the **home page**: enter your GitHub username and click **Search** to see all repositories.
- In **Admin**: load the repos and use **Edit** on each card to change the “about the project” text. The edited descriptions appear on the home page and are saved in the API.

## API Endpoints (REST)

| Method | Route | Description |
|--------|------|-----------|
| GET | `/api/repos?user=USER` | List GitHub repos + edited descriptions |
| GET | `/api/repos/:id/description` | Returns custom repo description |
| PUT | `/api/repos/:id/description` | Updates description (body: `{ “text”: “...” }`) |
| DELETE | `/api/repos/:id/description` | Removes custom description |

## Build for production

```bash
cd web
npm run build
```

The files will be in `web/dist`. To use with the API on another domain/port, set `VITE_API_URL` in the frontend `.env` (e.g., `VITE_API_URL=https://sua-api.com`).
