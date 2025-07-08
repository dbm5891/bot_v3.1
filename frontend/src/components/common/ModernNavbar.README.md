# Modern Navigation Bar Component

A fully accessible, responsive navigation bar built with shadcn/ui and Tailwind CSS. This component provides a modern, feature-rich navigation experience with support for desktop and mobile views, search functionality, notifications, and user menu.

## Features

### Core Functionality
- Responsive design (mobile-first approach)
- Nested navigation menus
- Search functionality with keyboard shortcuts
- Notifications system
- User profile menu
- Mobile slide-out menu
- Smooth animations and transitions

### Accessibility
- WCAG 2.1 compliant
- Full keyboard navigation
- Screen reader support
- Proper ARIA attributes
- Focus management
- Clear visual indicators
- High contrast support

### User Experience
- Keyboard shortcuts (⌘K for search)
- Smooth transitions and animations
- Responsive hover states
- Clear visual feedback
- Mobile-optimized interactions

## Installation

1. Ensure you have the required dependencies:
```bash
npm install @radix-ui/react-navigation-menu @radix-ui/react-dropdown-menu @radix-ui/react-dialog lucide-react
```

2. Make sure you have shadcn/ui components installed:
```bash
npx shadcn-ui@latest add button avatar badge navigation-menu sheet dropdown-menu
```

## Usage

### Basic Implementation

```tsx
import ModernNavbar from '@/components/common/ModernNavbar';

const navigation = [
  {
    title: 'Features',
    items: [
      {
        title: 'Analytics',
        href: '/analytics',
        description: 'View detailed analytics and reports'
      },
      {
        title: 'Security',
        href: '/security',
        description: 'Manage security settings and permissions'
      }
    ]
  },
  {
    title: 'Documentation',
    href: '/docs'
  }
];

const user = {
  name: 'John Doe',
  email: 'john@example.com'
};

const logo = {
  src: '/logo.svg',
  alt: 'Company Logo',
  title: 'Company Name'
};

function App() {
  return (
    <ModernNavbar
      navigation={navigation}
      user={user}
      logo={logo}
      showSearch={true}
      showNotifications={true}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `navigation` | `NavItem[]` | Yes | Array of navigation items |
| `user` | `User` | Yes | User information for profile menu |
| `logo` | `Logo` | Yes | Logo configuration |
| `showSearch` | `boolean` | No | Toggle search functionality |
| `showNotifications` | `boolean` | No | Toggle notifications |

### Types

```typescript
interface NavItem {
  title: string;
  href?: string;
  items?: {
    title: string;
    href: string;
    description?: string;
  }[];
}

interface User {
  name: string;
  email: string;
}

interface Logo {
  src: string;
  alt: string;
  title: string;
}
```

## Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open search |
| `Esc` | Close search or active menu |
| `Tab` | Navigate through interactive elements |
| `Enter` / `Space` | Activate focused element |
| `Arrow Keys` | Navigate within dropdown menus |

## Accessibility Features

### ARIA Landmarks
- `role="banner"` for the header
- `role="navigation"` for nav menus
- `role="search"` for search functionality
- `role="menu"` and `role="menuitem"` for dropdown menus

### Screen Reader Support
- Meaningful labels for all interactive elements
- Status messages for notifications
- Clear hierarchy and structure
- Hidden elements properly marked with `aria-hidden`

### Focus Management
- Visible focus indicators
- Proper focus trapping in modals
- Logical tab order
- Focus restoration on menu close

## Mobile Support

The component provides a comprehensive mobile experience with:
- Hamburger menu for main navigation
- Slide-out side panel
- Touch-friendly targets
- Optimized mobile layout
- Proper gesture support

## Customization

### Styling

The component uses Tailwind CSS classes and can be customized through:
- Tailwind configuration
- CSS custom properties
- shadcn/ui theme customization

Example theme customization:

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom-brand': '#646cff',
      },
    },
  },
}
```

### Layout

The component's layout can be customized through props and CSS:
- Container width through Tailwind's container utilities
- Spacing through gap utilities
- Responsive breakpoints through Tailwind's screen sizes

## Best Practices

1. **Performance**
   - Lazy load non-critical content
   - Use proper image sizes
   - Optimize animations for performance

2. **Accessibility**
   - Maintain proper heading structure
   - Ensure sufficient color contrast
   - Provide text alternatives for images
   - Test with screen readers

3. **Responsive Design**
   - Test on various screen sizes
   - Ensure touch targets are large enough
   - Maintain readable text sizes
   - Consider different device capabilities

4. **State Management**
   - Handle loading states
   - Provide error feedback
   - Maintain consistent UI state
   - Consider edge cases

## Examples

### With Custom Theme

```tsx
<ModernNavbar
  navigation={navigation}
  user={user}
  logo={logo}
  className="bg-custom-brand"
/>
```

### With Custom Mobile Breakpoint

```tsx
<ModernNavbar
  navigation={navigation}
  user={user}
  logo={logo}
  className="lg:hidden xl:flex" // Custom breakpoint
/>
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS/Android)

## Contributing

When contributing to this component:
1. Follow the established code style
2. Maintain accessibility features
3. Add proper documentation
4. Test across different devices
5. Consider performance implications

## Troubleshooting

### Common Issues

1. **Mobile Menu Not Closing**
   - Ensure route change detection is properly set up
   - Check for conflicting event handlers

2. **Keyboard Navigation Issues**
   - Verify focus management implementation
   - Check for proper ARIA attributes
   - Test tab order sequence

3. **Search Shortcut Not Working**
   - Check keyboard event listeners
   - Verify shortcut registration
   - Test for conflicting shortcuts

### Performance Optimization

1. **Animation Performance**
   - Use `transform` and `opacity` for animations
   - Implement proper debouncing for scroll events
   - Consider reducing animation complexity on mobile

2. **Bundle Size**
   - Import only necessary icons
   - Use dynamic imports for non-critical features
   - Optimize image assets

## Related Components

- `AppLayout` - Main application layout component
- `NavigationMenu` - Base navigation menu from shadcn/ui
- `Sheet` - Mobile slide-out menu from shadcn/ui
- `DropdownMenu` - User menu component from shadcn/ui

## Future Improvements

- [ ] Add search suggestions
- [ ] Implement notification center
- [ ] Add theme switching capability
- [ ] Improve mobile gesture support
- [ ] Add breadcrumb integration
- [ ] Implement mega menu option
- [ ] Add RTL support

## License

MIT License - feel free to use this component in your projects. 