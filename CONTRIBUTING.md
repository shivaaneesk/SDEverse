# Contributing to SDEverse

## Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/SDEverse.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Set up development environment (see below)
5. Make changes and commit
6. Push and submit a pull request

## Development Setup

**Prerequisites:** Node.js (v18+), MongoDB, Git

**Backend:**
```bash
cd server
npm install
cp .env.example .env  # Configure MONGO_URI, JWT_SECRET, PORT
npm run dev
```

**Frontend:**
```bash
cd client
npm install  
cp .env.example .env  # Configure VITE_API_BASE_URL
npm run dev
```

## Hacktoberfest

We participate in Hacktoberfest 2025! Look for issues labeled:
- `hacktoberfest` - Valid for Hacktoberfest  
- `good first issue` - Perfect for beginners
- `help wanted` - Extra attention needed

**Guidelines:** Focus on meaningful contributions, avoid spam/low-effort PRs.

## Contribution Types

**Bug Reports:** Use GitHub issues with clear reproduction steps.

**Features:** Submit feature requests via issues with detailed descriptions.

**Code:** Follow existing patterns, add tests, update docs as needed.

## Standards

- Use ESLint and Prettier for code formatting
- Follow existing component and API patterns  
- Write clear commit messages
- Test changes locally before submitting

## Contact

- **Issues**: [GitHub Issues](https://github.com/Harshdev625/SDEverse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Harshdev625/SDEverse/discussions)

Thank you for contributing to SDEverse!