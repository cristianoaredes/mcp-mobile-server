# API Documentation Generation

This guide explains how to generate and view the API documentation for MCP Mobile Server using TypeDoc.

## Overview

MCP Mobile Server uses [TypeDoc](https://typedoc.org/) to automatically generate comprehensive API documentation from JSDoc comments in the source code. The documentation includes:

- All 36 tools with complete function signatures
- Parameter descriptions and types
- Return types and structures
- Usage examples from JSDoc comments
- Cross-references between related tools
- Source code links to GitHub

## Prerequisites

```bash
# Install dependencies
npm install
```

This will install TypeDoc (`^0.25.4`) as a dev dependency.

## Generating Documentation

### Basic Generation

```bash
# Generate HTML documentation
npm run docs
```

This creates the API documentation in `docs/api/` directory.

### Watch Mode

For continuous documentation generation during development:

```bash
# Watch for changes and regenerate docs
npm run docs:watch
```

### Preview Documentation

View the generated documentation locally:

```bash
# Serve documentation on http://localhost:3000
npm run docs:serve
```

Then open your browser to `http://localhost:3000`.

## Output Structure

```
docs/api/
├── index.html           # Main entry point
├── modules/             # Module documentation
│   ├── tools_flutter.html
│   ├── tools_android.html
│   ├── tools_ios.html
│   ├── tools_super_tools.html
│   └── ...
├── functions/           # Function documentation
├── interfaces/          # TypeScript interfaces
├── types/               # Type definitions
└── assets/             # CSS, JS, and images
```

## Configuration

TypeDoc configuration is defined in `typedoc.json`:

```json
{
  "name": "MCP Mobile Server API Documentation",
  "entryPoints": [
    "src/tools/flutter.ts",
    "src/tools/android.ts",
    "src/tools/ios.ts",
    "src/tools/super-tools.ts",
    "src/tools/setup-tools.ts",
    "src/tools/android/gradle.ts",
    "src/tools/android/lint.ts",
    "src/tools/android/media.ts",
    "src/tools/android/native-run.ts"
  ],
  "out": "docs/api",
  "categorizeByGroup": true,
  "categoryOrder": [
    "Core Tools",
    "Super-Tools",
    "Setup & Configuration",
    "Device Management",
    "Development Workflow",
    "Utilities"
  ]
}
```

### Key Configuration Options

- **entryPoints**: Source files to document
- **out**: Output directory (`docs/api`)
- **exclude**: Patterns to exclude (tests, node_modules)
- **categorizeByGroup**: Group documentation by categories
- **theme**: Documentation theme (default)
- **navigationLinks**: Custom navigation links in header
- **sidebarLinks**: Additional sidebar links

## Customization

### Custom CSS

Custom styling is defined in `docs/typedoc-custom.css`:

```css
:root {
  --brand-primary: #4CAF50;
  --brand-secondary: #2196F3;
  --brand-accent: #FF9800;
}
```

### Navigation Links

The header includes links to:
- GitHub repository
- Documentation home
- npm package

### Sidebar Links

Quick access links to:
- Quick Start Guide
- Architecture Documentation
- CI/CD Integration Guide

## CI/CD Integration

### Generate docs in CI/CD pipeline:

**GitHub Actions:**

```yaml
- name: Generate API Documentation
  run: npm run docs

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./docs/api
```

**GitLab CI:**

```yaml
pages:
  stage: deploy
  script:
    - npm install
    - npm run docs
    - mv docs/api public
  artifacts:
    paths:
      - public
```

## Deployment

### GitHub Pages

1. Generate documentation:
   ```bash
   npm run docs
   ```

2. Commit and push `docs/api/`:
   ```bash
   git add docs/api
   git commit -m "docs: update API documentation"
   git push
   ```

3. Configure GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, Folder: /docs/api

### Alternative: Netlify/Vercel

Deploy the `docs/api` directory to Netlify or Vercel for automatic deployments on every commit.

## Documentation Quality

### Best Practices

1. **Complete JSDoc Comments**:
   ```typescript
   /**
    * Creates and configures all Flutter tools.
    *
    * @param {Map<string, number>} globalProcessMap - Global process map
    * @returns {Map<string, any>} Map of tool names to configurations
    *
    * @example
    * ```typescript
    * const tools = createFlutterTools(new Map());
    * ```
    */
   export function createFlutterTools(globalProcessMap: Map<string, number>)
   ```

2. **Use @category tags**:
   ```typescript
   /**
    * @category Core Tools
    */
   ```

3. **Include examples**:
   ```typescript
   /**
    * @example
    * ```typescript
    * const result = await tool.handler({ cwd: '.' });
    * ```
    */
   ```

4. **Cross-references**:
   ```typescript
   /**
    * @see {@link createAndroidTools} for Android tools
    */
   ```

## Troubleshooting

### Issue: TypeDoc not found

```bash
# Reinstall dependencies
npm install
```

### Issue: Missing documentation for some files

Check `typedoc.json` entryPoints array includes all source files.

### Issue: Broken links in generated docs

Ensure all `@see` references use correct module paths.

### Issue: Custom CSS not applied

Verify `typedoc.json` points to correct CSS file:

```json
{
  "customCss": "./docs/typedoc-custom.css"
}
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run docs` | Generate API documentation |
| `npm run docs:watch` | Watch mode - regenerate on changes |
| `npm run docs:serve` | Serve docs locally on port 3000 |

## Additional Resources

- [TypeDoc Official Documentation](https://typedoc.org/)
- [MCP Mobile Server Documentation](./README.md)
- [JSDoc Guide](https://jsdoc.app/)
- [TSDoc Specification](https://tsdoc.org/)

---

**Last Updated:** 2025-11-16
**Version:** 2.3.0
