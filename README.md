# Maternal & Infant Health Tracker

A comprehensive web application for tracking maternal and infant health metrics, appointments, vaccinations, and developmental milestones. Built with modern web technologies and designed for ease of use during pregnancy and early parenthood.

## 🌟 Features

- **Dashboard Overview**: Quick access to key metrics, upcoming events, and recent activity
- **Health Tracking**: Monitor vital signs, symptoms, and medications
- **Appointment Management**: Track clinic visits, screenings, and vaccinations
- **Journal Entries**: Record daily experiences, thoughts, and milestones
- **Checklists**: Manage tasks and to-dos for pregnancy and infant care
- **Guides & Resources**: Access comprehensive maternal and infant care information
- **Secure Authentication**: User accounts with profile management
- **Real-time Sync**: Data synchronized across devices
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Backend**: Lovable Cloud (Supabase)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Edge Functions**: Serverless functions for backend logic

### Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and media files
│   ├── components/        # Reusable React components
│   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   └── dashboard/    # Dashboard-specific components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/    # Supabase client and types
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components (route-level)
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and design tokens
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
└── package.json          # Project dependencies
```

### Design System

The application uses a semantic token-based design system defined in:
- `src/index.css` - CSS custom properties (colors, spacing, typography)
- `tailwind.config.ts` - Tailwind configuration extending the design tokens

All components use semantic tokens (e.g., `bg-primary`, `text-foreground`) instead of direct color values, ensuring consistent theming and easy customization.

### Key Architectural Patterns

1. **Component Composition**: Small, focused components that compose into larger features
2. **Custom Hooks**: Reusable logic extracted into hooks (e.g., `useAuth`, `useProfile`, `useJournalEntries`)
3. **Protected Routes**: Authentication-aware routing with automatic redirects
4. **Real-time Sync**: Supabase real-time subscriptions for live data updates
5. **Optimistic Updates**: Immediate UI feedback with background synchronization
6. **Responsive Design**: Mobile-first approach with responsive breakpoints

### Database Schema

The application uses PostgreSQL with Row Level Security (RLS) policies:

- **profiles**: User profile information
- **pregnancies**: Pregnancy tracking data
- **journal_entries**: Daily journal entries
- **appointments**: Medical appointments and clinic visits
- **vaccinations**: Vaccination records
- **screenings**: Health screening records
- **checklists**: Task management

## 🔐 Authentication Flow

1. Users sign up with email/password
2. Email confirmation is auto-enabled for development
3. Profile is automatically created via database trigger
4. Protected routes redirect to auth form if not authenticated
5. Session persists across browser refreshes

## 🎨 Styling Guidelines

- Use semantic tokens from the design system (defined in `index.css`)
- Never use direct color values (e.g., `text-white`, `bg-blue-500`)
- Follow the existing component variants pattern
- Ensure accessibility (ARIA labels, keyboard navigation, focus states)
- Test responsiveness across breakpoints (sm, md, lg, xl)

## 🧪 Development Workflow

### Running Locally

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Making Changes

1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style
3. Test your changes thoroughly
4. Commit with clear, descriptive messages
5. Push to your branch and create a pull request

### Database Changes

Database changes are managed through migrations. Never modify the database schema directly:

1. Use the Lovable Cloud interface to generate migrations
2. Migrations are automatically created in `supabase/migrations/`
3. Changes are version-controlled and reproducible

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Update navigation in `src/components/AppSidebar.tsx`
4. Ensure proper SEO tags (title, meta description, h1)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions (PascalCase for components, camelCase for functions)
- Write meaningful component and variable names
- Add comments for complex logic
- Keep components small and focused (< 200 lines ideally)

### Commit Messages

Use clear, descriptive commit messages:
```
feat: add vaccination reminder feature
fix: resolve date picker timezone issue
docs: update setup instructions
style: improve button hover states
refactor: extract form validation logic
```

### Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Update documentation** if you're changing functionality
3. **Test thoroughly** - ensure no regressions
4. **Follow the style guide** - maintain consistency
5. **Write clear PR descriptions** - explain what and why
6. **Request review** - tag relevant maintainers

### Bug Reports

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and device information

### Feature Requests

When suggesting features:
- Describe the problem you're solving
- Explain your proposed solution
- Consider alternatives
- Think about potential impact on existing features

## 📝 Code Review Checklist

- [ ] Code follows the project style guide
- [ ] Changes are focused and purposeful
- [ ] No console.log statements left in code
- [ ] Accessibility considerations addressed
- [ ] Responsive design tested
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Type safety maintained
- [ ] Comments added for complex logic
- [ ] No hardcoded values (use constants/config)

## 🔧 Environment Variables

The project uses auto-configured environment variables (managed by Lovable Cloud):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public API key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project identifier

**Note**: These are automatically configured and should not be manually edited.

## 📦 Deployment

### Via Lovable

1. Click the **Publish** button in the Lovable editor
2. Your app will be deployed to `yoursite.lovable.app`
3. Configure a custom domain in Project > Settings > Domains (requires paid plan)

### Self-Hosting

The application can be deployed to any static hosting service:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider:
   - Vercel
   - Netlify
   - AWS Amplify
   - GitHub Pages
   - Cloudflare Pages

3. Configure environment variables in your hosting provider

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18 or higher

**Authentication Issues**
- Check browser console for errors
- Verify Supabase connection is active
- Clear browser cache and cookies

**Styling Issues**
- Ensure Tailwind is processing correctly
- Check for conflicting CSS classes
- Verify design tokens are properly defined

### Getting Help

- Check existing GitHub issues
- Join the [Lovable Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Review [Lovable documentation](https://docs.lovable.dev/)

## 📄 License

This project is built with [Lovable](https://lovable.dev) and uses open-source technologies.

## 🙏 Acknowledgments

- [Lovable](https://lovable.dev) - Full-stack development platform
- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [Radix UI](https://www.radix-ui.com) - Accessible primitives
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## 📞 Support

For questions or support:
- Visit the support page in the app
- Check the [FAQ section](https://docs.lovable.dev/faq)
- Join the Lovable community

---

**Project URL**: https://lovable.dev/projects/9a0eb54a-a57a-4559-b56b-964709541ab2

Built with ❤️ using [Lovable](https://lovable.dev)