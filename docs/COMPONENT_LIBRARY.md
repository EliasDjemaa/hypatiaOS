# HypatiaOS Component Library Documentation

## Overview

This document describes the reusable UI components available in the HypatiaOS frontend application. All components are built with TypeScript, Material-UI, and follow consistent design patterns.

## Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Orange (#F59E0B)
- **Gray Scale**: 50-900 variants

### Typography
- **Font Family**: Inter
- **Headings**: h1-h6 with consistent weights
- **Body Text**: body1, body2 with proper line heights
- **Captions**: Small text for metadata

### Spacing
- **Base Unit**: 8px
- **Scale**: 1x, 2x, 3x, 4x, 6x, 8x (8px, 16px, 24px, 32px, 48px, 64px)

## Core Components

### Button Component

**Location**: `src/components/ui/Button.tsx`

A versatile button component with multiple variants and states.

#### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

#### Usage Examples
```tsx
import { Button } from '@/components/ui';

// Primary button
<Button variant="primary">Save Changes</Button>

// Button with loading state
<Button loading={isSubmitting}>Submit</Button>

// Button with icon
<Button icon={<SaveIcon />}>Save</Button>

// Full width button
<Button fullWidth>Continue</Button>
```

#### Variants
- **Primary**: Main action buttons (blue background)
- **Secondary**: Secondary actions (purple background)
- **Outline**: Subtle actions (white background, gray border)
- **Ghost**: Minimal actions (transparent background)
- **Danger**: Destructive actions (red background)

### Modal Component

**Location**: `src/components/ui/Modal.tsx`

A modern modal component with backdrop blur and smooth animations.

#### Props
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  showCloseButton?: boolean;
}
```

#### Usage Examples
```tsx
import { Modal, Button } from '@/components/ui';

<Modal
  open={isOpen}
  onClose={handleClose}
  title="Create New Study"
  actions={
    <>
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </>
  }
>
  <p>Modal content goes here...</p>
</Modal>
```

#### Features
- Backdrop blur effect
- Smooth fade animations
- Keyboard navigation (ESC to close)
- Focus management
- Responsive sizing

### Input Component

**Location**: `src/components/ui/Input.tsx`

Enhanced text input with icons, validation, and consistent styling.

#### Props
```typescript
interface InputProps extends TextFieldProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
  errorMessage?: string;
}
```

#### Usage Examples
```tsx
import { Input } from '@/components/ui';
import { SearchIcon, EyeIcon } from '@mui/icons-material';

// Basic input
<Input label="Email" placeholder="Enter your email" />

// Input with icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search studies..."
/>

// Input with validation
<Input
  label="Password"
  type="password"
  rightIcon={<EyeIcon />}
  error={!!errors.password}
  errorMessage={errors.password?.message}
/>
```

### Card Component

**Location**: `src/components/ui/Card.tsx`

Flexible card component for content containers.

#### Props
```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  onClick?: () => void;
}
```

#### Usage Examples
```tsx
import { Card, Button } from '@/components/ui';

// Basic card
<Card title="Study Overview" subtitle="Phase III Clinical Trial">
  <p>Card content...</p>
</Card>

// Interactive card
<Card
  hover
  onClick={handleCardClick}
  variant="elevated"
>
  <p>Clickable card content...</p>
</Card>

// Card with actions
<Card
  title="Study Details"
  actions={<Button size="small">Edit</Button>}
>
  <p>Card with action button...</p>
</Card>
```

### Toast Notifications

**Location**: `src/components/ui/Toast.tsx`

Global notification system with multiple types and auto-dismiss.

#### Usage
```tsx
import { useToast } from '@/components/ui';

const MyComponent = () => {
  const { success, error, warning, info } = useToast();

  const handleSuccess = () => {
    success('Study created successfully!');
  };

  const handleError = () => {
    error('Failed to save changes');
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  );
};
```

#### Provider Setup
```tsx
import { ToastProvider } from '@/components/ui';

<ToastProvider>
  <App />
</ToastProvider>
```

## Layout Components

### ErrorBoundary

**Location**: `src/components/common/ErrorBoundary.tsx`

Catches JavaScript errors and displays a fallback UI.

#### Usage
```tsx
import ErrorBoundary from '@/components/common/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Loading Components

**Location**: `src/components/common/Loading.tsx`

Various loading states and skeleton components.

#### Usage
```tsx
import { Loading, CardSkeleton, TableSkeleton } from '@/components/common/Loading';

// Page loading
<Loading variant="page" text="Loading dashboard..." />

// Skeleton loading
<CardSkeleton />
<TableSkeleton rows={5} />
```

### LazyRoute

**Location**: `src/components/common/LazyRoute.tsx`

Wrapper for lazy-loaded routes with loading states.

#### Usage
```tsx
import LazyRoute from '@/components/common/LazyRoute';

<Route 
  path="/dashboard" 
  element={
    <LazyRoute>
      <DashboardPage />
    </LazyRoute>
  } 
/>
```

## Hooks

### useAutoSave

**Location**: `src/hooks/useAutoSave.ts`

Automatically saves form data with debouncing and backup functionality.

#### Usage
```tsx
import { useAutoSave } from '@/hooks/useAutoSave';

const MyForm = () => {
  const [formData, setFormData] = useState({});
  
  const { saveNow, restoreFromBackup } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      await api.saveForm(data);
    },
    delay: 2000,
    key: 'study-form',
  });

  return (
    <form>
      {/* Form fields */}
      <Button onClick={saveNow}>Save Now</Button>
    </form>
  );
};
```

### usePerformanceMonitor

**Location**: `src/hooks/usePerformanceMonitor.ts`

Monitors component performance and rendering metrics.

#### Usage
```tsx
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

const MyComponent = () => {
  const { logMetrics } = usePerformanceMonitor('MyComponent');

  useEffect(() => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      logMetrics();
    }
  }, []);

  return <div>Component content</div>;
};
```

## Theme System

**Location**: `src/theme/index.ts`

Centralized theme configuration with Material-UI.

### Usage
```tsx
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### Custom Theme Values
```tsx
import { colors, getSpacing, getShadow } from '@/theme';

// Using theme colors
const primaryColor = colors.primary[600];

// Using spacing
const padding = getSpacing(3); // 24px

// Using shadows
const cardShadow = getShadow(2);
```

## Best Practices

### Component Development
1. **TypeScript First**: All components must have proper TypeScript interfaces
2. **Prop Validation**: Use TypeScript interfaces for prop validation
3. **Accessibility**: Include ARIA labels and keyboard navigation
4. **Performance**: Use React.memo for expensive components
5. **Testing**: Write unit tests for all components

### Styling Guidelines
1. **Theme Consistency**: Use theme values instead of hardcoded colors/spacing
2. **Responsive Design**: Components should work on all screen sizes
3. **Dark Mode Ready**: Prepare components for future dark mode support
4. **Animation**: Use consistent transition durations (200ms)

### Code Organization
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── common/       # Common utility components
│   └── layout/       # Layout-specific components
├── hooks/            # Custom React hooks
├── theme/            # Theme configuration
└── utils/            # Utility functions
```

## Migration Guide

### From Old Components
When migrating from old components to the new UI library:

1. **Replace MUI Button with UI Button**:
   ```tsx
   // Old
   <Button variant="contained" color="primary">Save</Button>
   
   // New
   <Button variant="primary">Save</Button>
   ```

2. **Replace MUI Dialog with UI Modal**:
   ```tsx
   // Old
   <Dialog open={open} onClose={onClose}>
     <DialogTitle>Title</DialogTitle>
     <DialogContent>Content</DialogContent>
   </Dialog>
   
   // New
   <Modal open={open} onClose={onClose} title="Title">
     Content
   </Modal>
   ```

3. **Replace console.log with Toast notifications**:
   ```tsx
   // Old
   console.log('Success!');
   
   // New
   const { success } = useToast();
   success('Operation completed successfully!');
   ```

## Contributing

To add new components to the library:

1. Create the component in the appropriate directory
2. Add TypeScript interfaces
3. Include usage examples
4. Add to the index.ts export file
5. Update this documentation
6. Write unit tests

## Support

For questions about the component library, please:
1. Check this documentation first
2. Look at existing component implementations
3. Ask in the development team chat
4. Create an issue in the repository
