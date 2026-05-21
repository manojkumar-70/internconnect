## Contributing to InternConnect

Thank you for your interest in contributing to InternConnect! This document provides guidelines for contributing to the project.

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Report issues responsibly
- Follow best practices

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/internconnect.git
   cd internconnect
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Write descriptive commit messages
   - Add tests for new features

4. **Test your changes**
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend
   cd frontend && npm test
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards

#### JavaScript/React
- Use ES6+ syntax
- Follow Airbnb style guide
- Use meaningful variable names
- Add JSDoc comments for functions

#### Python
- Follow PEP 8
- Use type hints
- Add docstrings
- Write unit tests

#### CSS
- Use CSS variables
- Follow BEM naming convention
- Mobile-first approach
- Add comments for complex styles

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test additions
- `chore`: Build or tool changes

Example:
```
feat(auth): add JWT token refresh

Add automatic token refresh mechanism to keep users logged in
during long sessions.

Closes #123
```

### Pull Request Process

1. Update documentation
2. Add/update tests
3. Ensure CI passes
4. Request review from maintainers
5. Address feedback
6. Squash commits if requested

### Development Workflow

#### Setup Development Environment

```bash
# Install dependencies
npm install    # Backend & Frontend
pip install -r requirements.txt  # Flask

# Start development servers
npm run dev    # Terminal 1: Backend
python app.py  # Terminal 2: Flask
npm start      # Terminal 3: Frontend
```

#### Database Seeding (Optional)

```bash
# Add sample data for testing
node backend/scripts/seed.js
```

### Testing Guidelines

#### Backend Tests
```javascript
describe('Auth Controller', () => {
  it('should register a new student', async () => {
    // Test code
  });
});
```

#### Frontend Tests
```javascript
describe('StudentProfile Component', () => {
  it('should display student profile', () => {
    // Test code
  });
});
```

#### Test Coverage
- Aim for 80%+ coverage
- Test edge cases
- Test error scenarios
- Mock external dependencies

### Documentation

- Update README if adding features
- Add comments to complex code
- Document API changes
- Update CHANGELOG.md

### Performance Considerations

- Minimize bundle size
- Optimize database queries
- Use efficient algorithms
- Cache when appropriate
- Profile before and after changes

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers
- [ ] Rate limiting

### Reporting Issues

**Bug Report Template:**
```markdown
## Description
[Clear description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- OS: [e.g., Windows, macOS]
- Node version: [e.g., 18.0.0]
- Browser: [e.g., Chrome]
```

**Feature Request Template:**
```markdown
## Description
[Clear description of the feature]

## Problem It Solves
[Why this feature is needed]

## Proposed Solution
[Suggested implementation]

## Alternative Solutions
[Other approaches considered]
```

### Development Tips

1. **Use ESLint**
   ```bash
   npm run lint
   npm run lint:fix
   ```

2. **Debug Mode**
   ```bash
   DEBUG=* npm start
   ```

3. **Database Debugging**
   ```bash
   mongosh  # Connect to MongoDB
   db.students.find()
   ```

### Resources

- [Code Style Guide](./STYLE_GUIDE.md)
- [API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Getting Help

- GitHub Issues: Report bugs and request features
- Discussions: Ask questions and discuss ideas
- Email: developers@internconnect.com

### Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Featured on our website

Thank you for contributing to making InternConnect better! 🚀
