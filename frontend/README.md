# Bot v3.1 Frontend

This directory contains the frontend web application for Bot v3.1, providing a user interface to interact with the trading bot, view analytics, and manage trading strategies.

## Accessing the GUI

### Local Development Environment

1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. Open your browser and navigate to: 
   - http://localhost:3000
   
   **Note:** While Vite typically uses port 5173 by default, this project has been configured to use port 3000 in the vite.config.ts file.

### Production Environment

If you're accessing the deployed application:

1. Ensure the production build has been deployed to your hosting service.
2. Access the application through your designated domain or IP address:
   - Example: https://your-bot-domain.com (if deployed with a custom domain)
   - Example: http://server-ip-address (if deployed on a server without a domain)

### Authentication

1. On your first visit, you'll be prompted to log in.
2. Use your credentials or follow the registration process if you're a new user.
3. After authentication, you'll have access to the full bot dashboard and features.

### Navigating the Interface

- **Dashboard**: Main overview of your trading activities and statistics
- **Strategies**: View, create, and edit trading strategies
- **Backtesting**: Run and view backtesting results
- **Live Trading**: Monitor and control live trading operations
- **Settings**: Configure application and trading preferences
- **Reports**: Access detailed performance reports and analytics

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Redux/RTK** - State management
- **shadcn/ui** - Component library
- **Chart.js & Lightweight Charts** - Data visualization
- **React Router** - Navigation
- **Axios** - API communication

## Directory Structure

- `src/` - Source code for the application
- `public/` - Static assets
- `node_modules/` - Dependencies (generated)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
# or
yarn
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

The development server will be available at http://localhost:3000 by default (configured in vite.config.ts).

### Building for Production

```bash
# Build for production
npm run build
# or
yarn build
```

Production files will be generated in the `dist/` directory.

### Serving Production Build

```bash
# Preview production build
npm run serve
# or
yarn serve
```

## Scripts

- `npm start` or `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run lint` - Lint TypeScript/TSX files
- `npm run format` - Format code with Prettier

## Key Features

- Trading dashboard with real-time data visualization
- Strategy configuration and management
- Performance analytics and reporting
- Backtesting visualization
- User authentication and settings

## Integration

This frontend application connects to the backend services of Bot v3.1 for data retrieval and trading operations.

## Contributing

Refer to the root [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## Related Documentation

- [Architecture Diagram](../diagrams/architecture_diagram.md)
- [Component Diagram](../diagrams/component_diagram.md)
- [Quickstart Guide](../QUICKSTART.md)
- [Troubleshooting](../TROUBLESHOOTING.md)

## Migration Note

If you're migrating from a previous version of the frontend, please refer to the migration guide for any changes in the setup or usage.

## Migration FAQ & Troubleshooting

**Q: My old MUI component or style is missing!**
A: All MUI components have been removed. Use shadcn/ui and Tailwind CSS equivalents. See the UI Component Library & Styling section above.

**Q: How do I add a new button, card, or alert?**
A: Use the shadcn/ui primitives and Tailwind classes. See https://ui.shadcn.com/docs/components for examples.

**Q: My build fails with missing MUI imports!**
A: Search for any remaining `@mui/material` or `@mui/icons-material` imports and remove them. Replace with shadcn/ui or Tailwind equivalents.

## UI Component Library & Styling

This project uses [shadcn/ui](https://ui.shadcn.com/) for all React UI components and [Tailwind CSS](https://tailwindcss.com/) for utility-first styling. All new components should be built using these libraries.

### Adding New Components
- Use shadcn/ui primitives (Button, Card, Alert, Tabs, etc.) for all new UI.
- Use Tailwind CSS utility classes for layout, spacing, and custom styles.
- For icons, use [Lucide](https://lucide.dev/) or [Heroicons](https://heroicons.com/).

### Migrating from MUI
- All MUI components have been removed. If you are updating old code, replace any remaining MUI patterns with shadcn/ui and Tailwind equivalents.

## Contributor Notes

- All new UI code must use shadcn/ui and Tailwind CSS.
- Do not reintroduce MUI or Material UI dependencies.
- Code review will check for adherence to the new UI stack.

## Further Reading

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)