# Contributing to FedRAMP Compliance Scanner

Thank you for your interest in contributing to the FedRAMP Compliance Scanner! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- VS Code 1.80+
- Git

### Development Setup
1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/fedramp-compliance-scanner.git
   cd fedramp-compliance-scanner
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## 📁 Project Structure

```
fedramp-compliance-scanner/
├── src/                    # TypeScript source code
│   ├── extension.ts        # Main extension entry point
│   ├── scanner.ts          # Core scanning engine
│   └── analytics/          # Analytics and reporting
├── docs/                   # Documentation
│   ├── compliance/         # FedRAMP compliance docs
│   ├── user-guide/         # User documentation
│   └── technical/          # Technical documentation
├── test-files/            # Test cases and validation
├── scripts/               # Automation scripts
└── samples/              # Example files
```

## 🛠 Development Workflow

### Making Changes
1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow TypeScript best practices
   - Add tests for new features
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run compile
   npm test
   ```

4. **Test in VS Code**
   - Press F5 to launch Extension Development Host
   - Test your changes in the new VS Code window

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Commit Messages
Use conventional commit format:
```
feat: add new compliance control detection
fix: resolve false positive in credential scanning
docs: update installation guide
```

## 🧪 Testing

### Test Files Location
- **Terraform Tests**: `test-files/terraform/`
- **Validation Tests**: `test-files/validation/`
- **Sample Files**: `test-files/samples/`

### Running Specific Tests
```bash
# Run all tests
npm test

# Compile and test
npm run compile && npm test

# Test with specific file
code test-files/validation/quick-validation.tf
```

### Adding New Tests
1. Create test files in appropriate `test-files/` subdirectory
2. Add compliance violations to test detection
3. Verify both positive and negative test cases

## 📋 Contribution Types

### 🔍 Bug Fixes
- Fix false positives/negatives in compliance detection
- Resolve performance issues
- Improve error handling

### ✨ New Features
- Add new FedRAMP control detection
- Enhance reporting capabilities
- Improve user experience

### 📚 Documentation
- Update user guides
- Add technical documentation
- Improve code comments

### 🧪 Testing
- Add test cases
- Improve test coverage
- Create validation scenarios

## 🎯 FedRAMP Controls

### Adding New Controls
1. **Research the Control**
   - Study FedRAMP control requirements
   - Identify detectable patterns in IaC files
   
2. **Implement Detection**
   - Add patterns to `src/extension.ts`
   - Test with various file formats
   
3. **Add Test Cases**
   - Create positive test cases (should trigger)
   - Create negative test cases (should not trigger)
   - Test false positive scenarios

4. **Update Documentation**
   - Add to compliance documentation
   - Update control coverage summaries

## 📝 Pull Request Process

### Before Submitting
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Test cases added for new features
- [ ] Self-review completed

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Test improvement

## Testing
- [ ] Added test cases
- [ ] Manually tested in VS Code
- [ ] Verified with sample files

## FedRAMP Impact
- Controls added/modified:
- False positive fixes:
- Performance improvements:
```

## 🔄 Review Process

1. **Automated Checks**
   - TypeScript compilation
   - ESLint validation
   - Test execution

2. **Code Review**
   - Maintainer review
   - Community feedback
   - Security assessment

3. **Testing**
   - Manual testing with sample files
   - Regression testing
   - Performance validation

## 📞 Getting Help

### Communication Channels
- **Issues**: [GitHub Issues](https://github.com/PavanSavalgi/fedramp-compliance-scanner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PavanSavalgi/fedramp-compliance-scanner/discussions)
- **Documentation**: Check `docs/` directory

### Reporting Issues
- Use issue templates
- Provide sample files when possible
- Include VS Code and extension versions
- Describe expected vs actual behavior

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors are recognized in:
- Project README
- Release notes
- Documentation credits

Thank you for helping make FedRAMP compliance easier for everyone! 🚀
