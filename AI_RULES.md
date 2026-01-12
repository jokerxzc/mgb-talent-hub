# AI Development Rules for MGB Online Job Application System

This document outlines the core technologies used in this project and provides guidelines for using specific libraries and tools. Adhering to these rules ensures consistency, maintainability, and optimal performance.

## Tech Stack Overview

*   **Frontend Framework**: React with TypeScript for building dynamic user interfaces.
*   **Build Tool**: Vite, leveraging SWC for fast development and optimized builds.
*   **Styling**: Tailwind CSS for utility-first styling, ensuring responsive and consistent designs.
*   **UI Components**: shadcn/ui, a collection of accessible and customizable UI components built on Radix UI.
*   **Routing**: React Router DOM for declarative client-side routing.
*   **State Management & Data Fetching**: React Query (`@tanstack/react-query`) for efficient server state management.
*   **Form Management**: React Hook Form for robust form handling, integrated with Zod for schema validation.
*   **Icons**: Lucide React for a comprehensive set of customizable SVG icons.
*   **Date Utilities**: `date-fns` for all date parsing, formatting, and manipulation.
*   **Animations**: Framer Motion for declarative and performant animations.
*   **Backend & Database**: Supabase (`@supabase/supabase-js`) for authentication, database interactions, and serverless functions.
*   **Toast Notifications**: Sonner for elegant and accessible toast messages.

## Library Usage Rules

To maintain a clean and efficient codebase, please follow these guidelines when introducing or modifying code:

*   **UI Components**:
    *   **Always** prioritize using existing `shadcn/ui` components.
    *   If a `shadcn/ui` component doesn't fit the exact need, **do not modify the `shadcn/ui` component files directly**. Instead, create a new component in `src/components/` that either wraps the `shadcn/ui` component or builds from scratch using Tailwind CSS and Radix UI primitives if necessary.
*   **Styling**:
    *   **Exclusively** use Tailwind CSS classes for all component styling. Avoid inline styles or creating new `.css` files unless it's for global styles in `src/index.css`.
    *   Use `clsx` and `tailwind-merge` for conditionally applying and merging Tailwind classes.
*   **Routing**:
    *   All client-side navigation must be handled using `react-router-dom`.
    *   Keep the main application routes defined within `src/App.tsx`.
*   **Data Fetching**:
    *   For all server-side data fetching and mutations, use `react-query`. This includes interactions with Supabase.
*   **Form Handling**:
    *   Implement all forms using `react-hook-form` for state management and validation.
    *   Use `zod` for defining form schemas and `zodResolver` for integration with `react-hook-form`.
*   **Icons**:
    *   Use icons from the `lucide-react` library.
*   **Date Operations**:
    *   Any date formatting, parsing, or calculations should be done using `date-fns`.
*   **Animations**:
    *   For any animations, use `framer-motion`.
*   **Notifications**:
    *   Use `sonner` for displaying toast notifications to the user.
*   **Backend Interaction**:
    *   All interactions with the Supabase backend (database queries, authentication, storage, functions) must use the `supabase` client instance from `src/integrations/supabase/client.ts`.
*   **File Structure**:
    *   New components should be placed in `src/components/`.
    *   New pages should be placed in `src/pages/`.
    *   Utility functions should be placed in `src/lib/` or `src/hooks/` as appropriate.
    *   Directory names must be all lower-case.