# 🔍 Sourcify App

> A full-stack web application with a clean frontend dashboard and a Node.js backend — deployed on Netlify.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

---

## 📌 Table of Contents

- [About](#about)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Author](#author)

---

## 📖 About

**Sourcify App** is a full-stack JavaScript web application featuring a responsive frontend dashboard and a dedicated backend. It is hosted on Netlify with SPA (Single Page Application) routing configured for seamless navigation.

---

## ✨ Features

- 📊 Interactive **dashboard** as the main entry point
- 🔗 Full-stack architecture with a **frontend** (`public/`) and **backend** (`backend/`) separation
- 🌐 Deployed on **Netlify** with SPA redirect support
- ⚡ Lightweight and fast — built with vanilla JavaScript, HTML & CSS

---

## 📁 Project Structure

```
sourcify-app/
├── backend/          # Backend API / server-side logic
├── public/           # Frontend assets (HTML, CSS, JS)
│   └── dashboard.html  # Main dashboard entry point
├── netlify.toml      # Netlify deployment config
├── package-lock.json # Dependency lock file
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or above)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/guruabijethsivakumar/sourcify-app.git

# 2. Navigate into the project directory
cd sourcify-app

# 3. Install dependencies
npm install
```

### Running Locally

```bash
# Start the backend server
cd backend
node index.js   # or: npm start
```

Then open `public/dashboard.html` in your browser, or serve the `public/` folder using a local server:

```bash
npx serve public
```

---

## ☁️ Deployment

This app is configured for **Netlify** deployment.

The `netlify.toml` config publishes the `public/` directory and redirects all routes to `dashboard.html` for SPA support:

```toml
[build]
  publish = "public"

[[redirects]]
  from = "/*"
  to = "/dashboard.html"
  status = 200
```

To deploy your own version:

1. Fork this repo
2. Connect it to your [Netlify](https://netlify.com) account
3. Netlify will auto-detect the config and deploy

---

## 🤝 Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repo
# 2. Create a new branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "Add: your feature description"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

---

## 👤 Author

**Guruabijeth Sivakumar**

[![GitHub](https://img.shields.io/badge/GitHub-guruabijethsivakumar-181717?style=flat&logo=github)](https://github.com/guruabijethsivakumar)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ by <a href="https://github.com/guruabijethsivakumar">Guruabijeth Sivakumar</a></p>
