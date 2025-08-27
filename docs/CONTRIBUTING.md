# 🤝 Contributing to MCP Mobile Server

Thank you for considering contributing to MCP Mobile Server! This guide will help you get started.

---

## 🚀 Quick Start

### **Development Setup**

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/mcp-mobile-server.git
   cd mcp-mobile-server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run test:unit
   npm run test:integration
   ```

---

## 📋 Project Structure

```
mcp-mobile-server/
├── src/                    # Source code
│   ├── tools/             # Tool implementations
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript definitions
│   └── server.ts          # Main MCP server
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
└── examples/              # Usage examples
```

---

## 🛠️ Development Guidelines

### **Code Style**

We use strict TypeScript and follow these conventions:

- **ESLint + Prettier** for code formatting
- **Strict TypeScript** configuration
- **Zod** for runtime type validation
- **Functional programming** patterns preferred

**Commands:**
```bash
npm run lint          # Check code style
npm run format        # Format code
npm run typecheck     # Type checking
```

### **Tool Development**

Each tool follows this pattern:

```typescript
// src/tools/example-tool.ts
import { z } from 'zod';
import { ToolImplementation, ToolCategory } from '../types';

const ExampleToolInputSchema = z.object({
  required_param: z.string(),
  optional_param: z.string().optional(),
});

export const exampleTool: ToolImplementation = {
  name: 'example_tool',
  description: 'Brief description of what the tool does',
  inputSchema: ExampleToolInputSchema,
  category: ToolCategory.ESSENTIAL,
  platform: 'cross-platform',
  requiredTools: [],
  safeForTesting: true,
  
  async execute(input) {
    const { required_param, optional_param } = input;
    
    try {
      // Tool implementation here
      const result = await someOperation(required_param);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: error.message,
        },
      };
    }
  },
};
```

### **Testing Requirements**

All contributions must include tests:

1. **Unit Tests** - Test tool logic in isolation
2. **Integration Tests** - Test tool with real dependencies
3. **E2E Tests** - Test complete workflows (when applicable)

**Test Structure:**
```typescript
// tests/unit/tools/example-tool.test.ts
import { describe, it, expect, vi } from 'vitest';
import { exampleTool } from '../../../src/tools/example-tool';

describe('example_tool', () => {
  it('should execute successfully with valid input', async () => {
    const result = await exampleTool.execute({
      required_param: 'test-value'
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
  
  it('should handle errors gracefully', async () => {
    // Test error cases
  });
});
```

---

## 🎯 Contribution Types

### **🐛 Bug Fixes**

1. **Report Issue**: Describe the bug with reproduction steps
2. **Write Test**: Add test that reproduces the bug
3. **Fix Bug**: Implement the fix
4. **Verify**: Ensure test passes and no regressions

### **✨ New Tools**

Before adding new tools, consider:

- **Essential**: Is this tool critical for mobile development?
- **Stable**: Does it work reliably across platforms?
- **Safe**: Can it be run without system modifications?
- **Fast**: Does it complete within reasonable time limits?

**New Tool Checklist:**
- [ ] Tool implementation with proper error handling
- [ ] Input schema with Zod validation
- [ ] Unit tests with 100% coverage
- [ ] Integration tests with real dependencies
- [ ] Documentation in `docs/TOOLS.md`
- [ ] Added to `TOOL_REGISTRY` in `tool-categories.ts`

### **📚 Documentation**

Documentation improvements are always welcome:

- Fix typos or unclear instructions
- Add examples and use cases
- Improve troubleshooting guides
- Update API documentation

### **🧪 Testing**

Help improve test coverage:

- Add missing unit tests
- Create integration test scenarios
- Add E2E workflow tests
- Performance benchmarking

---

## 🔄 Pull Request Process

### **Before Submitting**

1. **Fork** the repository
2. **Create branch** from `main`: `git checkout -b feature/tool-name`
3. **Make changes** following the guidelines
4. **Add tests** for your changes
5. **Run full test suite**: `npm run ci`
6. **Update documentation** if needed

### **PR Requirements**

- [ ] **Descriptive title** and description
- [ ] **Tests pass**: All CI checks green
- [ ] **Code coverage**: Maintain or improve coverage
- [ ] **Documentation**: Updated relevant docs
- [ ] **Breaking changes**: Clearly documented
- [ ] **Linked issue**: Reference related issues

### **PR Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New tool
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Breaking change

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

---

## 📊 Quality Standards

### **Code Quality**

- **TypeScript strict mode** enabled
- **100% type coverage** for new code
- **ESLint rules** must pass
- **No console.log** in production code (use proper logging)

### **Testing Standards**

- **Unit tests**: 100% coverage for new tools
- **Integration tests**: Test with real system dependencies
- **Error handling**: Test all error scenarios
- **Edge cases**: Test boundary conditions

### **Documentation Standards**

- **Tool documentation**: Complete API reference
- **Examples**: Working code examples
- **Troubleshooting**: Common issues and solutions
- **Comments**: Code comments for complex logic only

---

## 🏗️ Architecture Decisions

### **Current Architecture**

- **MCP Native Server** - Direct tool execution
- **Essential Tools Only** - Focused on reliability
- **Fallback System** - Graceful degradation
- **Cross-platform** - macOS, Windows, Linux support

### **Design Principles**

1. **Simplicity**: Keep tools simple and focused
2. **Reliability**: Prefer working over feature-complete
3. **Safety**: Tools should not break user systems
4. **Performance**: Fast execution times
5. **Maintainability**: Code should be easy to understand

### **Adding New Platforms**

When adding platform support:

1. **Platform detection** in utility functions
2. **Platform-specific implementations** 
3. **Fallback mechanisms** for unsupported platforms
4. **Comprehensive testing** on target platform

---

## 🌟 Recognition

### **Contributors**

All contributors are recognized in:
- `CONTRIBUTORS.md` file
- GitHub contributors page
- Release notes for significant contributions

### **Contribution Types**

We recognize various contribution types:
- 🐛 **Bug fixes**
- ✨ **New tools**
- 📚 **Documentation**
- 🧪 **Testing**
- 🎨 **Design/UX**
- 💡 **Ideas/Planning**

---

## 🆘 Getting Help

### **Development Questions**

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs or request features
- **Discord**: Join our development Discord (if available)

### **Code Review**

- **Early feedback**: Create draft PRs for early feedback
- **Pair programming**: Reach out for complex features
- **Mentoring**: We help new contributors get started

---

## 📜 Code of Conduct

### **Our Standards**

- **Respectful communication** in all interactions
- **Constructive feedback** focused on improving code
- **Inclusive environment** welcoming to all contributors
- **Professional behavior** in all project spaces

### **Reporting Issues**

Report unacceptable behavior to project maintainers via:
- GitHub Issues (for code-related concerns)
- Email (for conduct issues)

---

## 🚀 Development Roadmap

### **Current Focus (v2.0)**

- [ ] Streamlined 19 essential tools
- [ ] Comprehensive documentation
- [ ] Improved error handling
- [ ] Cross-platform stability

### **Future Enhancements (v2.1+)**

- [ ] Web interface for tool management
- [ ] Enhanced logging and metrics
- [ ] Plugin system for custom tools
- [ ] Performance optimizations

### **Long-term Vision**

- Universal mobile development server
- Integration with all major IDEs
- AI-assisted mobile development workflows
- Community-driven tool ecosystem

---

**Thank you for contributing to MCP Mobile Server! 🎉**

Your contributions help make mobile development more accessible and efficient for developers worldwide.