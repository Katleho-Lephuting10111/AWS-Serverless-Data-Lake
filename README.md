# DigiHealth Frontend

A modern, responsive React dashboard application with Tailwind CSS styling. Built with React Router for seamless navigation and a professional layout system.

## Features

- **React 18** - Latest version of React with hooks
- **React Router v6** - Client-side routing with smooth navigation
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **TypeScript** - Type-safe development
- **Lucide Icons** - Beautiful, consistent icon system
- **Responsive Layout** - Mobile-friendly design that works on all devices
- **Collapsible Sidebar** - Toggle sidebar to expand/collapse navigation
- **Modern Dashboard** - Professional dashboard with statistics and activity feed

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   └── Layout.tsx              # Main layout with header and sidebar
│   ├── pages/
│   │   ├── Dashboard.tsx           # Dashboard home page
│   │   ├── Analytics.tsx           # Analytics and reports page
│   │   └── Settings.tsx            # User settings page
│   ├── styles/
│   │   └── Dashboard.css           # (deprecated - using Tailwind now)
│   ├── App.tsx                     # Main app component with routing
│   ├── App.css                     # App styling (minimal)
│   ├── index.css                   # Global styles with Tailwind directives
│   └── main.tsx                    # Entry point
├── index.html                      # HTML template
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── package.json                    # Dependencies
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Pages & Routes

### Dashboard (`/`)
The main dashboard page displaying:
- Key statistics (Datasets, Storage, Success Rate, Last Updated)
- Recent activity feed
- Quick stats cards

### Analytics (`/analytics`)
Analytics and reporting page with:
- KPI metrics
- Performance charts
- Data trends and insights

### Settings (`/settings`)
User settings page featuring:
- Account management
- Notification preferences
- Security settings
- Theme selection

## Layout Components

### Header
- Application title "DigiHealth"
- User notifications (bell icon)
- User profile menu
- Sticky position for easy access

### Sidebar
- Collapsible navigation with smooth animations
- Dark gradient design (blue color scheme)
- Active route highlighting
- Icon-based navigation with labels
- Logout button

### Main Content Area
- Responsive grid system
- Consistent padding and spacing
- Auto-scrolling content area
- Mobile-optimized layout

## Styling with Tailwind CSS

The project uses Tailwind CSS for all styling. Key features:

- **Utility-first approach** - Use Tailwind classes instead of custom CSS
- **Responsive design** - Built-in breakpoints (sm, md, lg, xl, 2xl)
- **Custom colors** - Primary color scheme with multiple shades
- **Dark mode ready** - Easy to implement dark theme

### Using Tailwind Classes

Example component with Tailwind:
```tsx
<div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <p className="text-gray-600 mt-2">Description</p>
</div>
```

### Custom Configuration

Edit `tailwind.config.js` to customize:
- Color palette
- Font sizes
- Spacing
- Breakpoints
- Custom components

## Adding New Pages

1. Create a new component in `src/pages/`
2. Import it in `src/App.tsx`
3. Add a route in the `<Routes>` component
4. Add navigation item to `navItems` in `Layout.tsx`

Example:
```tsx
// src/pages/Reports.tsx
export default function Reports() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Reports</h1>
    </div>
  )
}

// Update App.tsx
<Route path="/reports" element={<Reports />} />

// Update src/components/Layout.tsx
const navItems = [
  // ... existing items
  { path: '/reports', icon: FileText, label: 'Reports' },
]
```

## Technologies

- **React** - UI framework
- **React Router** - Routing library
- **Tailwind CSS** - CSS framework
- **Lucide React** - Icon library
- **Vite** - Build tool
- **TypeScript** - Programming language
- **PostCSS** - CSS processing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Fast hot module replacement (HMR) with Vite
- Optimized build size with tree-shaking
- CSS purging for production
- Responsive images and lazy loading ready

## License

See LICENSE file in the root directory
