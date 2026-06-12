# Frontend Development Guide

This guide covers development, debugging, and best practices for the React + Vite frontend.

## Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.jsx              # Main app router
├── index.css            # Global styles (Tailwind + custom)
├── main.jsx             # React entry point
├── api/
│   └── client.js        # Axios configuration + interceptors
├── components/
│   ├── ErrorBoundary.jsx       # Error boundary wrapper
│   ├── Header.jsx              # Navigation header
│   ├── Sidebar.jsx             # Side navigation
│   ├── LoadingSpinner.jsx      # Loading indicator
│   ├── Timer.jsx               # Countdown timer
│   ├── ScoreCard.jsx           # Score display
│   ├── ProgressBar.jsx         # Progress indicators
│   ├── AIInterviewerRoom.jsx   # Interview room UI
│   ├── PanelAvatar.jsx         # Avatar component
│   ├── InterviewStatsBar.jsx   # Stats display
│   ├── ConfidenceTracker.jsx   # Confidence tracking
│   ├── LiveFeedbackPanel.jsx   # Real-time feedback
│   ├── SkillGapReport.jsx      # Skills report
│   ├── FreeStackPanel.jsx      # Free features panel
│   └── AppLogo.jsx             # Branding
├── context/
│   └── AppContext.jsx          # Global state management
├── hooks/
│   └── [custom hooks]          # Reusable hooks
├── pages/
│   ├── LandingPage.jsx         # Homepage
│   ├── Dashboard.jsx           # Main layout
│   ├── DashboardOverview.jsx   # Dashboard summary
│   ├── ResumePage.jsx          # Resume upload
│   ├── InterviewPage.jsx       # Interview flow
│   ├── CommunicationCoachPage.jsx
│   ├── QuizPage.jsx            # Quiz practice
│   ├── AnalyticsPage.jsx       # Performance analytics
│   └── ResultsPage.jsx         # Results display
└── utils/
    ├── apiError.js             # Error handling
    ├── emotionAnalysis.js      # Emotion detection
    ├── voiceInterview.js       # Voice I/O
    ├── adaptiveEngine.js       # Adaptive logic
    └── panelInterviewer.js     # Panel logic
```

## Development Workflow

### Component Development

**Functional Component Pattern**:
```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const MyComponent = ({ title, onAction }) => {
  const [state, setState] = useState('');

  useEffect(() => {
    // Cleanup effect
    return () => {};
  }, []);

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => onAction(state)}>Click me</button>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired
};

export default MyComponent;
```

### API Integration

**Using the API Client**:
```jsx
import { useEffect, useState } from 'react';
import client from '../api/client';
import { APIError, formatApiError } from '../utils/apiError';

export const MyPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await client.get('/api/endpoint');
        setData(response.data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay {...error} />;
  if (!data) return null;

  return <div>{/* render data */}</div>;
};
```

### Form Handling

**Form with Validation**:
```jsx
const [formData, setFormData] = useState({ email: '', name: '' });
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  // Clear error for this field
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: null }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await client.post('/api/submit', formData);
  } catch (err) {
    if (err instanceof APIError && err.status === 422) {
      setErrors(err.data.details || {});
    }
  }
};
```

## Styling

### Tailwind CSS

All styling uses Tailwind CSS. Configuration in `tailwind.config.js`:

```jsx
// Utility-first approach
<div className="flex items-center justify-center w-full h-screen bg-gray-900">
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
    Click me
  </button>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* responsive grid */}
</div>

// Dark mode
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* auto dark mode */}
</div>
```

### Custom CSS

For complex styling, use `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow p-6;
  }
}

/* Custom utilities */
@layer utilities {
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

## State Management

### Using Context API

```jsx
// context/AppContext.jsx
const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => React.useContext(AppContext);
```

Usage:
```jsx
const { user, setUser } = useApp();
```

## Performance Optimization

### Code Splitting
```jsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### Memoization
```jsx
import { memo, useCallback } from 'react';

const MyComponent = memo(({ onAction }) => {
  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);

  return <button onClick={handleClick}>Click</button>;
});
```

### Bundle Analysis
```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# Analyze bundle
npm run build -- --analyze
```

## Testing (Manual)

### Debugging in Browser

```jsx
// Add debug logs
console.log('[ComponentName]', { state, props });

// React DevTools
// 1. Install React DevTools browser extension
// 2. Inspect component state and props
// 3. Edit props in real-time during development
```

### Chrome DevTools

1. **Network tab**: Monitor API calls, check response times
2. **Performance tab**: Record and analyze frame rate
3. **Console**: Check for errors and warnings
4. **Storage**: View localStorage/sessionStorage

## Common Patterns

### Loading States
```jsx
const [status, setStatus] = useState('idle'); // idle | loading | success | error

if (status === 'loading') return <LoadingSpinner />;
if (status === 'error') return <ErrorDisplay />;
if (status === 'success') return <SuccessDisplay />;
```

### Modal/Dialog
```jsx
const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>Open</button>
{isOpen && (
  <Modal>
    <p>Modal content</p>
    <button onClick={() => setIsOpen(false)}>Close</button>
  </Modal>
)}
```

### Infinite Scroll / Pagination
```jsx
const [page, setPage] = useState(1);
const [items, setItems] = useState([]);

const loadMore = async () => {
  const response = await client.get(`/api/items?page=${page + 1}`);
  setItems(prev => [...prev, ...response.data.items]);
  setPage(page + 1);
};
```

## Build & Deployment

### Production Build
```bash
npm run build

# Output: frontend/dist/
# Files are minified, optimized, and ready for deployment
```

### Environment Variables
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:5000

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

### Docker Build
```bash
# See Dockerfile for multi-stage build
docker build -t ai-interview-frontend:latest .
docker run -p 80:80 ai-interview-frontend:latest
```

## Troubleshooting

### Hot Module Replacement (HMR) Not Working
```bash
# Restart dev server
npm run dev

# Check firewall/proxy settings
# May need to set HMR configuration in vite.config.js
```

### Bundle Size Too Large
```bash
# Analyze bundle
npm run build -- --analyze

# Split large components with lazy()
# Extract common code to separate chunks
```

### API Calls Failing
```javascript
// Check:
// 1. VITE_API_BASE_URL in .env
// 2. Backend running: curl http://localhost:5000/health
// 3. CORS errors in browser console
// 4. Network tab in DevTools
```

## Best Practices

✅ **Do:**
- Use functional components with hooks
- Handle errors with ErrorBoundary
- Optimize images (use Lighthouse)
- Keep components small and focused
- Use meaningful variable names
- Add loading and error states
- Test manually in different browsers
- Use git branches for features

❌ **Don't:**
- Overuse Context (causes re-renders)
- Mix inline styles with Tailwind
- Ignore error states in API calls
- Create large components (> 400 lines)
- Use index as array keys
- Over-optimize prematurely

## Resources

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)

---

Happy coding! 🚀
