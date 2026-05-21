# Frontend Documentation

## Overview

The InternConnect frontend is a modern React application providing an intuitive interface for students, companies, and admins.

## Project Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FLASK_API_URL=http://localhost:5001
```

### Running the Application

```bash
# Development
npm start

# Production build
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Navigation component
│   └── Footer.js          # Footer component
├── pages/
│   ├── Home.js            # Home page
│   ├── Login.js           # Login page
│   ├── Register.js        # Registration page
│   ├── StudentDashboard.js
│   ├── CompanyDashboard.js
│   ├── AdminDashboard.js
│   ├── StudentProfile.js
│   ├── CompanyProfile.js
│   ├── InternshipList.js
│   ├── InternshipDetail.js
│   ├── MyApplications.js
│   └── NotFound.js
├── services/
│   └── api.js             # API client and endpoints
├── context/
│   └── AuthContext.js     # Authentication context
├── styles/
│   └── global.css         # Global styles
├── App.js                 # Main app component
└── index.js               # React entry point
```

## Component Hierarchy

```
App
├── Router
├── AuthProvider
├── Routes
│   ├── Home
│   ├── Login
│   ├── Register
│   ├── StudentDashboard
│   ├── CompanyDashboard
│   ├── AdminDashboard
│   ├── InternshipList
│   ├── InternshipDetail
│   ├── StudentProfile
│   ├── CompanyProfile
│   ├── MyApplications
│   └── NotFound
└── ToastContainer
```

## Key Features

### Authentication Flow

1. User fills registration form
2. Frontend sends data to backend
3. Backend validates and hashes password
4. JWT token returned
5. Token stored in localStorage
6. Axios interceptor adds token to requests

### Protected Routes

Routes are protected based on user role:
- Student routes: `/student-dashboard`, `/student/profile`
- Company routes: `/company-dashboard`, `/company/profile`
- Admin routes: `/admin-dashboard`

### Form Handling

All forms use React hooks for state management:
- `useState` for form data
- `useContext` for authentication
- `useNavigate` for routing
- `toast` for notifications

### API Integration

```javascript
// Example API call
const response = await studentAPI.getProfile();
const data = response.data;
```

All API methods are defined in `src/services/api.js` with axios interceptors for authentication.

## Styling

Global styles are in `src/styles/global.css` with CSS variables:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #1e40af;
  --success-color: #16a34a;
  --danger-color: #dc2626;
  --warning-color: #f59e0b;
}
```

## State Management

### Context API (AuthContext)
```javascript
const { user, token, login, logout, isAuthenticated } = useContext(AuthContext);
```

### Component State
```javascript
const [formData, setFormData] = useState({});
const [loading, setLoading] = useState(false);
```

## Navigation

### React Router v6
```javascript
import { useNavigate, useParams } from 'react-router-dom';
const navigate = useNavigate();
```

## Error Handling

All API errors are caught and displayed via toast notifications:

```javascript
try {
  await api.call();
} catch (err) {
  toast.error(err.response?.data?.message || 'Error occurred');
}
```

## Loading States

Loading spinners are shown during async operations:

```javascript
{loading ? <div className="spinner"></div> : <Content />}
```

## Responsive Design

The application is responsive using CSS Grid and Flexbox:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}
```

Media queries adjust layout for mobile devices.

## Build & Deployment

### Build for Production
```bash
npm run build
```

Builds the app for production to the `build` folder.

### Deployment Options

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm run build
# Deploy the build folder to Netlify
```

#### Docker
```bash
docker build -t internconnect-frontend .
docker run -p 3000:3000 internconnect-frontend
```

## Performance Optimization

1. **Code Splitting**: Use React.lazy() for route-based code splitting
2. **Image Optimization**: Compress images and use appropriate formats
3. **Caching**: Set proper cache headers in production
4. **Bundle Analysis**: Use `npm run analyze` to check bundle size

## Testing

```bash
npm test
```

Tests are run using Jest and React Testing Library.

### Example Test
```javascript
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

test('renders home page', () => {
  render(<Home />);
  expect(screen.getByText(/Welcome to InternConnect/i)).toBeInTheDocument();
});
```

## Accessibility

- Use semantic HTML
- Add alt text to images
- Ensure proper heading hierarchy
- Use ARIA labels where needed
- Maintain keyboard navigation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Common Issues & Solutions

### CORS Errors
Ensure backend is running and proxy is configured correctly in `.env`.

### Token Expiration
The app stores JWT in localStorage. For longer sessions, increase token expiry on backend.

### API Calls Not Working
Check if backend is running on the correct port and environment variables are set.

## Future Enhancements

- [ ] Add more pages for detailed management
- [ ] Implement real-time notifications with Socket.io
- [ ] Add dark mode toggle
- [ ] Implement offline mode with service workers
- [ ] Add file upload for resume
- [ ] Add video interview integration
