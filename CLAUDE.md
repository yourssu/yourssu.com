# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yourssu landing page - A Gatsby-based static site for a student organization at Soongsil University, featuring dynamic content from Sanity CMS and responsive design with department recruiting pages.

## Commands

### Development

```bash
pnpm develop   # Start dev server on localhost:8000
pnpm build     # Create production build
pnpm serve     # Serve production build locally
pnpm clean     # Clean cache and public folder
```

### Code Quality

```bash
pnpm lint          # Oxlint
pnpm format:check  # Oxfmt formatting check
pnpm typecheck     # TypeScript type checking
```

### Deployment

```bash
pnpm deploy  # Deploy to AWS S3 (requires AWS credentials)
```

## Architecture

### Tech Stack

- **Framework**: Gatsby 5.16.1 (React 18 SSG)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + tailwind-styled-components
- **CMS**: Sanity (project ID: f877vcud)
- **Package Manager**: pnpm 11.21.0
- **Node**: 24.x

### Key Patterns

- **Container/Component Pattern**: Business logic in `containers/`, UI in `components/`
- **Hook Files**: Most containers have accompanying `hook.ts` for data fetching
- **Path Aliases**: Use `@/` for src imports (configured in tsconfig.json)
- **Static Queries**: All data fetched at build time via GraphQL from Sanity

### Dynamic Page Generation

The site dynamically generates department recruiting pages from Sanity CMS:

- **Logic**: `gatsby-node.ts` creates pages at build time
- **Template**: `src/templates/DescriptionTemplate.tsx`
- **URL Pattern**: `/recruiting/{department_name}`
- **Schedule Types**: Individual, with assignment, without assignment

### Project Structure

```text
src/
├── containers/        # Page sections with business logic
│   ├── landing/      # Homepage sections
│   ├── select/       # Recruiting page sections
│   └── description/  # Department detail sections
├── components/       # Reusable UI components
├── pages/           # Gatsby page components
├── templates/       # Dynamic page templates
├── types/           # TypeScript definitions
└── utils/           # Utilities (dates, recruiting logic)
```

## Environment Variables

Required `.env` file (not in repo):

```dotenv
GATSBY_APP_SANITY_TOKEN=<token>
GATSBY_APP_SANITY_PROJECT_ID=f877vcud
GATSBY_APP_SANITY_DATASET=production
GATSBY_APP_GA_ID=<google_analytics_id>
```

## Styling

- Custom Tailwind screen ranges (min/max): xs(0–350px), sm(350–720px),
  md(721–1080px), lg(1081–1440px), xl(1441–1920px), xxl(1921px+)
- Pretendard font family (Regular, SemiBold, Bold)
- Mobile-first responsive design
- Class sorting via Oxfmt

## Important Files

- `gatsby-node.ts` - Dynamic page generation with recruiting schedule logic
- `gatsby-config.ts` - Plugin configuration, custom breakpoints
- `src/utils/recruitingSchedule.ts` - Recruiting date calculation logic
- `tailwind.config.js` - Design system configuration

## Development Notes

- No test framework currently configured
- Oxlint + Oxfmt enforced
- Import order enforced with alphabetical sorting
- GraphQL queries use `useStaticQuery` hook
- Images processed through gatsby-plugin-image
- CI/CD uses pnpm - see `.github/workflows/deploy.yml`
- Gatsby `useBreakpoint` queries are independent max-width checks: xs(390px),
  query550(550px), query669(669px), sm(720px), md(1080px), lg(1440px),
  xl(1920px). Use these for hook queries; use the Tailwind ranges above for
  classes. Always consider responsive behavior even when Figma has no
  responsive design. See `gatsby-config.ts` for details.
