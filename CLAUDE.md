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
pnpm typecheck  # TypeScript type checking
```

Note: ESLint runs automatically during development via gatsby-plugin-eslint.

### Deployment

```bash
pnpm deploy  # Deploy to AWS S3 (requires AWS credentials)
```

## Architecture

### Tech Stack

- **Framework**: Gatsby 5.13.1 (React 18 SSG)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + tailwind-styled-components
- **CMS**: Sanity (project ID: f877vcud)
- **Package Manager**: pnpm 9.7.0
- **Node**: >=18.0.0

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

```
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

```
GATSBY_APP_SANITY_TOKEN=<token>
GATSBY_APP_SANITY_PROJECT_ID=f877vcud
GATSBY_APP_SANITY_DATASET=production
GATSBY_APP_GA_ID=<google_analytics_id>
```

## Styling

- Custom Tailwind breakpoints: xs(360px), sm(400px), md(768px), lg(1080px), xl(1440px), xxl(1920px)
- Pretendard font family (Regular, SemiBold, Bold)
- Mobile-first responsive design
- Class sorting via prettier-plugin-tailwindcss

## Important Files

- `gatsby-node.ts` - Dynamic page generation with recruiting schedule logic
- `gatsby-config.ts` - Plugin configuration, custom breakpoints
- `src/utils/recruitingSchedule.ts` - Recruiting date calculation logic
- `tailwind.config.js` - Design system configuration

## Development Notes

- No test framework currently configured
- ESLint + Prettier enforced (Airbnb config)
- Import order enforced with alphabetical sorting
- GraphQL queries use `useStaticQuery` hook
- Images processed through gatsby-plugin-image
- CI/CD uses npm (not pnpm) - see `.github/workflows/deploy.yml`
- 이 프로젝트에서는 항상 반응형을 신경써야해, xs: 390px, query550: 550px, query669: 669px, sm: 720px, md: 1080px, lg: 1440px, xl: 1920px 기준이야, figma에 반응형으로 디자인이 안되어 있어도 항상 반응형을 생각해서 만들어줘 gatsby-config.ts에서 자세한 사항 참고
