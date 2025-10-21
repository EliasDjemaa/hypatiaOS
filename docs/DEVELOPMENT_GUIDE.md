# HypatiaOS Development Guide

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-org/hypatia-os.git
cd hypatia-os

# Install dependencies
npm run setup

# Start development environment
npm run dev
```

## Development Workflow

### 1. Code Quality Standards

#### Linting and Formatting
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

#### Type Checking
```bash
# Run TypeScript type checking
npm run type-check
```

#### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 2. Pre-commit Hooks

The project uses Husky for pre-commit hooks that automatically run:
- ESLint for code quality
- Prettier for code formatting
- TypeScript type checking
- Unit tests

### 3. Branch Strategy

- `master`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### 4. Commit Convention

Use conventional commits for automated changelog generation:

```bash
# Feature
git commit -m "feat(auth): add OAuth2 integration"

# Bug fix
git commit -m "fix(ui): resolve modal backdrop issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Performance
git commit -m "perf(dashboard): optimize chart rendering"

# Refactor
git commit -m "refactor(components): extract common button logic"
```

## Architecture Guidelines

### Frontend Structure
```
web-app/src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── common/       # Common utilities
│   └── layout/       # Layout components
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── store/            # State management
├── services/         # API services
├── utils/            # Utility functions
├── theme/            # Theme configuration
└── types/            # TypeScript types
```

### Component Guidelines

#### 1. Component Structure
```tsx
// ComponentName.tsx
import React from 'react';
import { ComponentProps } from './types';

export const ComponentName: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  ...props
}) => {
  // Hooks
  // Event handlers
  // Render logic

  return (
    <div {...props}>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

#### 2. TypeScript Interfaces
```tsx
// Always define props interface
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
}

// Export for reuse
export type { ComponentProps };
```

#### 3. Performance Optimization
```tsx
import React, { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ExpensiveComponent = memo<Props>(({ data }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  // Memoize event handlers
  const handleClick = useCallback(() => {
    // Handle click
  }, []);

  return <div onClick={handleClick}>{processedData}</div>;
});
```

### State Management

#### 1. Local State (useState)
```tsx
const [state, setState] = useState(initialValue);
```

#### 2. Form State (react-hook-form)
```tsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();
```

#### 3. Server State (React Query)
```tsx
import { useQuery, useMutation } from 'react-query';

const { data, isLoading, error } = useQuery('studies', fetchStudies);
const mutation = useMutation(createStudy);
```

#### 4. Global State (Zustand)
```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## API Integration

### Service Layer Pattern
```tsx
// services/studyService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const studyService = {
  getStudies: () => api.get('/studies'),
  createStudy: (data) => api.post('/studies', data),
  updateStudy: (id, data) => api.put(`/studies/${id}`, data),
  deleteStudy: (id) => api.delete(`/studies/${id}`),
};
```

### Error Handling
```tsx
import { useToast } from '@/components/ui';

const MyComponent = () => {
  const { error } = useToast();

  const handleError = (err: Error) => {
    error(err.message || 'An unexpected error occurred');
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // errorReportingService.captureException(err);
    }
  };
};
```

## Testing Strategy

### Unit Tests (Jest + React Testing Library)
```tsx
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Tests
```tsx
// Test complete user flows
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('Study Creation Flow', () => {
  it('allows user to create a new study', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to studies page
    await user.click(screen.getByText('Studies'));
    
    // Click create button
    await user.click(screen.getByText('Add Study'));
    
    // Fill form
    await user.type(screen.getByLabelText('Study Title'), 'Test Study');
    
    // Submit
    await user.click(screen.getByText('Create Study'));
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText('Study created successfully')).toBeInTheDocument();
    });
  });
});
```

## Performance Guidelines

### Bundle Optimization
1. **Code Splitting**: Use React.lazy for route-based splitting
2. **Tree Shaking**: Import only what you need
3. **Bundle Analysis**: Run `npm run analyze` to check bundle size

### Runtime Performance
1. **Memoization**: Use React.memo, useMemo, useCallback appropriately
2. **Virtualization**: Use react-window for large lists
3. **Image Optimization**: Use WebP format and lazy loading

### Monitoring
```tsx
// Use performance hooks in development
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  usePerformanceMonitor('MyComponent');
  // Component logic
};
```

## Security Best Practices

### 1. Input Validation
```tsx
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});
```

### 2. XSS Prevention
```tsx
// Use dangerouslySetInnerHTML carefully
const sanitizedHTML = DOMPurify.sanitize(userInput);
```

### 3. Authentication
```tsx
// Always check authentication status
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

## Deployment

### Environment Configuration
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development

# .env.production
REACT_APP_API_URL=https://api.hypatia.com
REACT_APP_ENV=production
```

### Build Process
```bash
# Development build
npm run build

# Production build with optimization
NODE_ENV=production npm run build

# Analyze bundle
npm run analyze
```

### CI/CD Pipeline
The project uses GitHub Actions for:
1. Automated testing on pull requests
2. Security vulnerability scanning
3. Build verification
4. Deployment to staging/production

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf web-app/dist
npm run build
```

#### 2. Type Errors
```bash
# Regenerate TypeScript declarations
npm run type-check
```

#### 3. Linting Issues
```bash
# Auto-fix most issues
npm run lint:fix

# Format code
npm run format
```

#### 4. Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run dev
# Open Chrome DevTools > Memory tab
```

### Debug Mode
```tsx
// Enable debug logging
localStorage.setItem('debug', 'hypatia:*');

// Component-specific debugging
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Debug info:', data);
```

## Resources

### Documentation
- [Component Library](./COMPONENT_LIBRARY.md)
- [API Documentation](./api/README.md)
- [Database Schema](./database/README.md)

### Tools
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Material-UI Documentation](https://mui.com)

## Getting Help

1. **Check Documentation**: Start with this guide and component library docs
2. **Search Issues**: Look for similar issues in the repository
3. **Ask Team**: Reach out in the development team chat
4. **Create Issue**: If problem persists, create a detailed issue report

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

### Pull Request Checklist
- [ ] Tests pass
- [ ] Code is formatted
- [ ] TypeScript types are correct
- [ ] Documentation is updated
- [ ] Performance impact is considered
- [ ] Security implications are reviewed
