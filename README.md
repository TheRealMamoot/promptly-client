![Version](https://img.shields.io/github/v/release/TheRealMamoot/promptly-client?label=version&color=blue&logo=github)

# 🎨 Promptly – Frontend App

The frontend for **Promptly**, a modern prompt management app that allows users to create, explore, favorite, and manage prompt ideas. This SPA interfaces with the backend API and is part of a **two-repository** full-stack architecture.

## 🌐 Live Demo

- 👩‍💻 [Promptly App](https://promptly-client-production.up.railway.app)
- 🔗 [Backend Repository](https://github.com/TheRealMamoot/promptly-server)

## 🏗 Tech Stack

- **React**+**Vite** with **TypeScript**
- **SWR** – Data fetching and caching
- **Axios** – API communication
- **Zod** – Schema validation for forms
- **ESLint** – Code quality and linting (w/ **Prettier**)
- **Vitest** – Unit and Component testing
- **Nginx** – Web server for serving the static frontend assets
- **Docker** – Multi-stage build and containerization
- **GitHub Actions** – Automated linting, formatting and testing (CI)
- **Railway** – Infrastructure, and deployment (CD)

## ✨ Features

- Minimal, intuitive UI for writing and browsing prompts effortlessly
- Library to discover all saved prompts from your account
- Smart editing modal for quick updates without leaving the page
- Favorite toggle for curating your top prompt ideas
- Real-time form validation for smooth interactions
- Error and loading states handled with animated feedback for a polished UX

## ⚙️ Usage

### 0. Clone the Repository

Start by cloning the backend repository to your local machine:

```bash
git clone https://github.com/TheRealMamoot/promptly-client.git
cd promptly-client
```

### 1. Environment Setup

It is recommended to create `.env` and `.env.production` files in the root directory file for dev and production with the following variable:

```env
VITE_API_URL=your_backend_base_api_url # Value depending on dev/prod env
```

> ❗**Important:** While it's more common to pass environment variables at **runtime** in Docker, the frontend requires the `VITE_API_URL_ARG` to be passed as a **build-time ARG**, _not_ as a runtime `VITE_API_URL` variable.

> This means you must provide `VITE_API_URL_ARG` during the **Docker build step**, and adjust your `.env` file accordingly when building the frontend image.

### 2. Recommended: Run with Docker 🐳

```bash
docker build -t promptly-frontend:latest .
docker run -p 8080:80 --env-file .env --name promptly-frontend promptly-frontend:latest
```

> ❗ To change the internal `80` port, you must modify the `nginx.conf` used in the Docker image. By default, Nginx listens on port 80.

### 3. Run Locally Without Docker

Prerequisites:

- Node.js v20+
- npm

Steps:

```bash
npm install
npm run dev
```

To build for production:

```bash
npm test # (optional)
npm run build
npm run preview
```

> ❗ Ensure all `@types/*` packages listed in `devDependencies` in `package.json` are installed via `npm install` to avoid type errors.

## 🔄 CI/CD Pipeline

### GitHub Actions (CI)

In `.github/workflows/main.yml` you can find the instructions for GitHub Actions. The file **requires** `RAILWAY_TOKEN` and `RAILWAY_SVC_ID` present in the repo's secrets environment. If you are not using **Railway** you should configure the **deploy** job in the yml file.

- Runs on every push to main
- Executes `npm run lint`, `npm run check-format`, and `npm test`

### Railway (CD)

- On CI success, deploys to Railway using Docker deployment
- Railway handles domain provisioning and build context

> ❗ **Important:** When deploying using a Docker image (such as with Railway), you **must** provide `VITE_API_URL_ARG` instead of `VITE_API_URL` as the environment variable.

## 🤝 Contributing

For issues, suggestions, or contributions, please open a GitHub Issue or reach out through the contacts provided in the profile.
