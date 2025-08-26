# Contributing to MCP Mobile Server

Thanks for your interest in contributing! Please follow these guidelines to keep the project healthy and consistent.

## Getting Started
- Fork the repo and create a feature branch from `main`.
- Install dependencies: `npm install`
- Run in dev mode: `npm run dev`
- Build and validate: `npm run build && npm run mcp:validate`

## Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Commits follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`)

## Testing
- Unit tests with Vitest: `npm test`
- Add tests for new tools and major changes

## Security
- Do not include secrets in code or tests
- See `SECURITY.md` for how to report vulnerabilities

## Pull Requests
1. Ensure CI passes (build, lint, test, validate)
2. Update docs (`README.md`) if needed
3. Provide a clear description of the change and rationale

## Issue Types
- `bug`: something isn’t working
- `enhancement`: feature request or improvement
- `security`: security-related issue
- `good first issue`: suitable for newcomers

## Contact
Maintainer: Cristiano Arêdes Costa — https://aredes.me
