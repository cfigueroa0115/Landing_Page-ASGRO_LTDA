# Implementation Plan: ASGRO Landing Page

## Overview

This plan implements a full-stack landing page for ASGRO LTDA using Next.js 15+ with App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Drizzle ORM, and Neon PostgreSQL. All UI text and navigation is in Spanish. Tasks are organized to build foundational infrastructure first, then content sections, interactive components, forms, AI chat, API routes, and finally testing and SEO. Brand assets are loaded from `/public/brand/` with elegant SVG/CSS fallbacks if missing.

## Tasks

- [x] 1. Project setup, configuration, and design system
  - [x] 1.1 Initialize Next.js 15+ project with TypeScript strict mode, Tailwind CSS, and configure base `tsconfig.json`, `next.config.ts`, and `tailwind.config.ts` with the ASGRO brand palette (Blue #024EA3, Dark Blue #011930, Navy #001B33, Green #7AC146, Green Alt #6FB639, Neon Green #9BE564, Light Gray #F4F6F9), 8px spacing system, premium border-radius tokens (cards: 18px-28px, buttons: 14px-18px, inputs: 14px, modals: 24px), and shadow utilities
    - Configure `next/font` with Inter as primary typeface
    - Define typographic hierarchy (h1-h4, body, small/caption) with distinct sizes and weights
    - Set up responsive breakpoints at 640px, 768px, 1024px, 1280px
    - Add Tailwind config tokens: `rounded-card: 22px`, `rounded-btn: 16px`, `rounded-input: 14px`, `rounded-modal: 24px`
    - _Requirements: 1.1, 1.2, 1.9, 2.1, 2.4, 2.5, 23.1_

  - [x] 1.2 Install and configure shadcn/ui, Radix UI primitives, Framer Motion, Lucide React, React Icons, React Hook Form, and Zod; create `globals.css` with Tailwind directives, custom utilities, and CSS variables for the brand tokens including premium border-radius values
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [x] 1.3 Set up Drizzle ORM with Neon PostgreSQL connection, create `lib/db/index.ts` for client initialization, `lib/config/env.ts` for environment variable validation, and create `.env.example` with all required and optional variables documented
    - Required in production (NODE_ENV=production): DATABASE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_COMPANY_PHONE, NEXT_PUBLIC_COMPANY_EMAIL, NEXT_PUBLIC_COMPANY_ADDRESS
    - Required always: DATABASE_URL
    - Optional: OPENAI_API_KEY, GEMINI_API_KEY, RESEND_API_KEY
    - NEXT_PUBLIC_COMPANY_PHONE, NEXT_PUBLIC_COMPANY_EMAIL, NEXT_PUBLIC_COMPANY_ADDRESS must be validated as obligatory in production only. In development (NODE_ENV !== 'production'), if these vars are empty or missing, the UI must hide the corresponding contact links/sections gracefully — no broken links, no placeholder data, no build errors
    - _Requirements: 1.7, 1.8, 24.1, 24.2, 24.5, 24.6_

  - [x] 1.4 Create shared TypeScript interfaces in `types/index.ts` covering all component props, API request/response types, and data models as defined in the design document
    - _Requirements: 1.1_

  - [x] 1.5 Set up `/public/brand/` directory with brand asset handling: check for `asgro-logo.png`, `asgro-services-banner.png`, `asgro-og-image.png`; create a `lib/utils/brand-assets.ts` utility that provides fallback SVG placeholders or CSS-generated logos when assets are missing, ensuring no broken images
    - _Requirements: 2.1, 2.6, 21.2_

- [x] 2. Database schema, seed data, and validation schemas
  - [x] 2.1 Create Drizzle schema in `lib/db/schema.ts` defining all 8 tables (leads, quote_requests, faqs, knowledge_base, chat_sessions, chat_messages, metrics, site_settings) with UUID primary keys, created_at timestamps, and the foreign key relationship from chat_messages to chat_sessions. The knowledge_base table MUST include a `tags` field (text array or comma-separated text) in addition to title, category, and content — this is the field used for keyword matching
    - _Requirements: 20.1_

  - [x] 2.2 Create database seed script `lib/db/seed.ts` with initial data: minimum 8 FAQs (2+ per category: servicios, cotización, proceso, cumplimiento), 4-8 metrics with labels and units, knowledge base entries for AI agent (each entry with title, category, content, and tags fields populated), and default site settings. All FAQ categories in Spanish: servicios, cotización, proceso, cumplimiento (NOT English names)
    - Include a Drizzle migration generation setup (drizzle.config.ts)
    - _Requirements: 15.3, 15.4, 12.5, 14.2_

  - [x] 2.3 Create shared Zod validation schemas:
    - `lib/validations/contact.ts` — expanded fields: nombre completo, empresa, cargo, teléfono, email, ciudad, servicio de interés (select), mensaje, aceptación de tratamiento de datos (boolean, must be true)
    - `lib/validations/quote.ts` — expanded fields: nombre de empresa, NIT, nombre de contacto, cargo, teléfono, email, ciudad, actividad económica, número aproximado de trabajadores, servicio o seguro requerido (select), ARL actual (optional), comentarios adicionales, aceptación de tratamiento de datos (boolean, must be true)
    - `lib/validations/chat.ts` — sessionId (optional UUID) + message (1-500 chars)
    - _Requirements: 16.1, 16.2, 17.1, 17.3, 14.10_

  - [x]* 2.4 Write property test for validation schemas (Property 1)
    - **Property 1: Validation schemas accept all valid inputs and reject all invalid inputs with descriptive errors**
    - Generate arbitrary valid/invalid inputs via fast-check and verify Zod parse/reject behavior for both expanded contact and quote schemas
    - **Validates: Requirements 16.2, 17.3, 14.10, 20.9**

- [x] 3. Utility modules and shared components
  - [x] 3.1 Create `lib/utils/whatsapp.ts` with `generateWhatsAppUrl` helper that builds `https://wa.me/{phone}?text={encodedMessage}` URLs, stripping non-digit chars from phone, and URI-encoding the message. All WhatsApp buttons must be functional — no empty href or placeholder links
    - _Requirements: 18.3, 18.4_

  - [x]* 3.2 Write property test for WhatsApp URL generation (Property 2)
    - **Property 2: WhatsApp URL generation produces valid encoded URLs**
    - Test with arbitrary phone numbers and message strings
    - **Validates: Requirements 18.3, 18.4**

  - [x] 3.3 Create `lib/utils/constants.ts` with all hardcoded fallback data: fallback FAQs (8+), fallback metrics (4+), pillar content, service data, methodology steps, benefits, differentiators, and static site content — ALL in Spanish. No lorem ipsum, no invented contact data. Use configurable patterns via env vars for phone/email/address
    - _Requirements: 12.4, 12.6, 15.3, 24.3_

  - [x] 3.4 Create `lib/utils/format.ts` with number formatting (locale-aware, es-CO) and date helpers for the time API including Saturday half-day logic
    - _Requirements: 20.3_

  - [x] 3.5 Create `components/shared/AnimatedSection.tsx` — a Framer Motion viewport animation wrapper component accepting direction, delay, and threshold props using Intersection Observer
    - _Requirements: 4.7, 5.4, 8.4, 10.4, 11.3, 13.4_

  - [x] 3.6 Create `components/shared/WhatsAppButton.tsx` — floating and inline variants using `generateWhatsAppUrl`, conditionally hidden when NEXT_PUBLIC_WHATSAPP_NUMBER is not set, with 48x48px minimum touch target. Button must be fully functional (opens WhatsApp with pre-filled message)
    - _Requirements: 18.1, 18.2, 18.5, 18.6_

  - [x] 3.7 Create `components/shared/Counter.tsx` — animated number counter that increments from 0 to target value over 1500-2500ms, triggered by viewport intersection (once per page load)
    - _Requirements: 12.1, 12.3_

- [x] 4. Layout components (Spanish navigation)
  - [x] 4.1 Create `components/layout/Header.tsx` — sticky glassmorphism header with backdrop blur, ASGRO logo (from `/public/brand/asgro-logo.png` with SVG fallback), navigation links in Spanish: Inicio, Nosotros, Servicios, Metodología, Resultados, Agente IA, Preguntas frecuentes, Contacto. Include button "Cotizar ahora" (links to quote section) and button "WhatsApp" (functional, opens WhatsApp). Smooth scroll behavior (800ms)
    - Implement scroll detection for z-index layering
    - Apply glassmorphism effect (backdrop blur, 70-90% background opacity)
    - All nav items and buttons must be functional — no empty links or placeholder hrefs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_

  - [x] 4.2 Create `components/layout/MobileNav.tsx` — hamburger menu button visible below 768px, vertical overlay panel with all navigation links in Spanish (Inicio, Nosotros, Servicios, Metodología, Resultados, Agente IA, Preguntas frecuentes, Contacto, Cotizar ahora, WhatsApp), closes on link click or outside tap
    - _Requirements: 3.5, 3.8, 3.9_

  - [x] 4.3 Create `components/layout/Footer.tsx` — dark blue gradient background, company contact info from env vars (address, phone with tel:, email with mailto:), navigation quick links in Spanish with smooth scroll, social media links (new tab), copyright with current year, legal notice links. No placeholder data — all configurable. If contact env vars are empty in development, hide contact info section gracefully instead of showing broken links
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [x] 4.4 Create `components/layout/SkipNav.tsx` — skip navigation link as first focusable element, targets main content
    - _Requirements: 22.4_

- [x] 5. Checkpoint - Verify project builds and layout renders
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Content sections (Server Components)
  - [x] 6.1 Create `components/sections/HeroSection.tsx` — dark gradient background (Dark Blue to Navy), main headline in Spanish (max 80 chars), 4 descriptive badges (ARL, SST, bienestar, seguros empresariales a la medida), 4 animated service cards with icons, FOUR functional CTA buttons: "Solicitar asesoría" → contact section, "Cotizar ahora" → quote section, "Hablar por WhatsApp" → opens WhatsApp with pre-filled message, "Consultar Agente IA" → AI agent section. Framer Motion entrance animations (within 1000ms). Use `/public/brand/asgro-services-banner.png` with CSS gradient fallback if missing
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 6.2 Create `components/sections/PillarsSection.tsx` — 4 strategic pillar cards in responsive grid (1col < 640px, 2col 640-1024px, 4col > 1024px), hover elevation animation (300ms), icon + title (max 40 chars) + description (max 120 chars) in Spanish, viewport entrance animation. Cards use `rounded-card` token (18-28px)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.3 Create `components/sections/AboutSection.tsx` — section with id="nosotros", heading + description (150-400 chars) + highlighted value proposition callout in Spanish, specialization list (ARL, SST, riesgos laborales, seguros empresariales a la medida) with icons, two-column layout above 768px / stacked below
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.4 Create `components/sections/MissionVision.tsx` — separate mission and vision cards with visible borders/shadows/fills, labeled "Misión" and "Visión", visually differentiated with distinct icons or color accents, side-by-side layout ≥768px, cards use `rounded-card` token
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 6.5 Create `components/sections/WhyChooseSection.tsx` — 5 differentiators in Spanish with icon in circular green/blue container, title (max 40 chars), description (max 150 chars), responsive grid (1col < 640px, 2col 640-1024px, 3col > 1024px), staggered entrance animation
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 6.6 Create `components/sections/ServicesSection.tsx` — section with id="servicios", 4 service category cards (ARL, SST, seguros empresariales a la medida, bienestar laboral) with icon, title, description (max 120 chars) in Spanish, "Ver más" button triggering ServiceModal. Cards use `rounded-card` token
    - _Requirements: 9.1, 9.3_

  - [x] 6.7 Create `components/shared/ServiceModal.tsx` — modal dialog (uses `rounded-modal: 24px`) showing service title, icon, full description (80+ chars) in Spanish, sub-services list, CTA for quote/WhatsApp (functional buttons), close via X button, overlay click, or Escape key, focus trap implementation
    - _Requirements: 9.2, 9.4, 9.5, 22.9_

  - [x] 6.8 Create `components/sections/SSTARLSection.tsx` — distinct SST subsection (3+ regulatory topics with icons and descriptions in Spanish), ARL subsection (3+ service topics including risk classification), 3+ compliance benefits with visual emphasis (icons, bold headings, accent colors), viewport entrance animation
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 6.9 Create `components/sections/MethodologySection.tsx` — section with id="metodologia", visual timeline/step-by-step with numbered indicators, exactly 5 steps (Diagnóstico, Planeación, Implementación, Seguimiento, Mejora continua) each with number + title + description (20-150 chars) in Spanish, sequential stagger animation (150-300ms), no loop after completion
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 6.10 Create `components/sections/BenefitsSection.tsx` — minimum 6 benefits in Spanish with icon + title + description (max 120 chars referencing specific outcomes/metrics), responsive grid (1col < 768px, 2col 768-1024px, 3col > 1024px), entrance animation. Cards use `rounded-card` token
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 7. Interactive sections (Client Components)
  - [x] 7.1 Create `components/sections/MetricsSection.tsx` — section with id="resultados", client component fetching from GET /api/metrics, displaying 4-8 animated counters using Counter component, triggering animation when 25% visible (once per page load), fallback to hardcoded values on API failure, supplementing if fewer than 4 returned. Labels in Spanish
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 7.2 Create `components/sections/FAQSection.tsx` — section with id="preguntas-frecuentes", client component fetching from GET /api/faqs, accordion format (multiple expandable), loading indicator while fetching, fallback to 8+ hardcoded FAQs in Spanish on failure/timeout (5s), covering categories: servicios, cotización, proceso, cumplimiento
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 8. Forms with validation (expanded fields)
  - [x] 8.1 Create `components/sections/ContactSection.tsx` — section with id="contacto", contact form using React Hook Form + Zod schema with expanded fields: nombre completo, empresa, cargo, teléfono, email, ciudad, servicio de interés (dropdown: ARL, SST, seguros empresariales a la medida, bienestar), mensaje, and checkbox "Acepto el tratamiento de datos personales" (required). All labels and error messages in Spanish. Inline error messages on validation failure, disable submit during submission, POST to /api/contact, success confirmation + field reset on success, preserve data + error message + re-enable on failure. Inputs use `rounded-input: 14px`, submit button uses `rounded-btn: 16px`
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.6, 16.7_

  - [x] 8.2 Create `components/sections/QuoteSection.tsx` — section with id="cotizar", quote form using React Hook Form + Zod schema with expanded fields: nombre de empresa, NIT, nombre de contacto, cargo, teléfono, email, ciudad, actividad económica, número aproximado de trabajadores, servicio o seguro requerido (dropdown), ARL actual (optional), comentarios adicionales, and checkbox "Acepto el tratamiento de datos personales" (required). All labels and error messages in Spanish. Inline errors, POST to /api/quote, success confirmation + reset on success, preserve data + error message on failure. Inputs use `rounded-input: 14px`, submit button uses `rounded-btn: 16px`
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.7, 17.8_

- [x] 9. AI Agent chat system (schema/matcher consistency fix)
  - [x] 9.1 Create `lib/ai/keyword-matcher.ts` — local keyword-matching fallback that searches Knowledge Base entries by matching words from visitor messages against FOUR fields: title, content, category, AND tags. The matcher MUST NOT reference a non-existent "keywords" field. It searches across all text fields consistently with the schema (which uses `tags` as the keyword field). Returns relevant entries ranked by match count, or empty result set if no matches
    - _Requirements: 14.7, 14.6_

  - [x]* 9.2 Write property test for keyword matcher (Property 3)
    - **Property 3: Keyword matcher returns relevant Knowledge Base entries**
    - Test with arbitrary messages containing known/unknown keywords, verify matcher searches title, content, category, and tags fields consistently
    - **Validates: Requirements 14.7, 14.6**

  - [x] 9.3 Create `lib/ai/providers.ts` — AI provider abstraction supporting OpenAI and Gemini APIs, accepting Knowledge Base context as system prompt, handling API errors gracefully with fallback to keyword matcher
    - _Requirements: 14.8_

  - [x] 9.4 Create `lib/ai/agent.ts` — AI agent orchestration: maintains context window bounded to last 10 messages, routes to external API or keyword matcher based on env config, generates fallback message in Spanish for unmatched/off-topic queries (recommending WhatsApp or contact form), enforces topic restriction to insurance/SST/ARL
    - _Requirements: 14.3, 14.4, 14.5, 14.6, 14.8, 14.11_

  - [x]* 9.5 Write property test for chat context window (Property 4)
    - **Property 4: Chat context window is bounded to last 10 messages**
    - Generate sessions with arbitrary N messages, verify context contains min(N, 10) messages
    - **Validates: Requirements 14.3**

  - [x] 9.6 Create `components/sections/AIAgentSection.tsx` with sub-components (`chat/ChatWindow.tsx`, `chat/ChatInput.tsx`, `chat/ChatBubble.tsx`) — section with id="agente-ia", optional floating chat button, message list, input with 500-char limit + character counter, POST to /api/chat, session management, ARIA live region for new messages. All UI text in Spanish
    - _Requirements: 14.1, 14.2, 14.9, 14.10, 22.10_

- [x] 10. Checkpoint - Verify all sections render and forms validate
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. API routes
  - [x] 11.1 Create `app/api/health/route.ts` — GET endpoint returning JSON with status, service name, timestamp, and environment fields
    - _Requirements: 20.2_

  - [x] 11.2 Create `app/api/time/route.ts` — GET endpoint returning current date, time, day of week (Spanish), timezone (America/Bogota), and business availability status with THREE possible states: "Disponible" (Mon-Fri 8:00-18:00), "Fuera de horario" (Mon-Fri outside hours OR Saturday after 12:00), "Canal digital activo" (Sunday all day). Saturday hours: 8:00 AM to 12:00 PM = "Disponible"
    - _Requirements: 20.3_

  - [x]* 11.3 Write property test for time endpoint logic (Property 5)
    - **Property 5: Time endpoint returns correct America/Bogota formatting and business hours**
    - Test with arbitrary Date objects, verify timezone, day-of-week in Spanish, and three-state business availability (Disponible / Fuera de horario / Canal digital activo) including Saturday half-day logic
    - **Validates: Requirements 20.3**

  - [x] 11.4 Create `app/api/faqs/route.ts` — GET endpoint querying faqs table (is_active=true, ordered by order_index), returning JSON array
    - _Requirements: 20.4_

  - [x] 11.5 Create `app/api/metrics/route.ts` — GET endpoint querying metrics table (is_active=true, ordered by order_index), returning JSON array
    - _Requirements: 20.5_

  - [x] 11.6 Create `app/api/contact/route.ts` — POST endpoint validating body against expanded contact Zod schema (nombre completo, empresa, cargo, teléfono, email, ciudad, servicio de interés, mensaje, aceptación datos), storing lead in leads table, returning 201 on success; 400 with field errors on invalid data; 503 on DB unavailability; 500 with generic message on server error
    - _Requirements: 20.6, 16.5, 20.9, 20.10, 20.11_

  - [x] 11.7 Create `app/api/quote/route.ts` — POST endpoint validating body against expanded quote Zod schema (nombre de empresa, NIT, nombre de contacto, cargo, teléfono, email, ciudad, actividad económica, trabajadores, servicio requerido, ARL actual, comentarios, aceptación datos), storing quote request in quote_requests table, returning 201 on success; 400/503/500 error handling as per contact route pattern
    - _Requirements: 20.7, 17.5, 17.6, 20.9, 20.10, 20.11_

  - [x] 11.8 Create `app/api/chat/route.ts` — POST endpoint accepting sessionId (optional) + message (1-500 chars), creating session if absent, processing through AI agent logic, storing messages in DB, returning assistant response with sessionId and timestamp
    - _Requirements: 20.8, 14.9, 20.9, 20.10, 20.11_

- [x] 12. Main page assembly and SEO (triple JSON-LD schemas)
  - [x] 12.1 Create `app/page.tsx` — assemble all sections in correct order as Server Component, import Client Components with proper boundaries, ensure logical section flow matching Spanish Header navigation (Inicio → Nosotros → Servicios → Metodología → Resultados → Agente IA → Preguntas frecuentes → Contacto → Cotizar)
    - _Requirements: 22.7_

  - [x] 12.2 Create `app/layout.tsx` — root layout with HTML metadata in Spanish (title ≤60 chars, description ≤160 chars, 5+ keywords for insurance/ARL/SST in Colombia), Open Graph properties (og:title, og:description, og:image using `/public/brand/asgro-og-image.png` with fallback, og:url, og:type, og:locale=es_CO), Twitter Card metadata (summary_large_image), canonical URL. Include THREE JSON-LD structured data schemas: InsuranceAgency, LocalBusiness, AND Organization — each with name, url, logo, contactPoint, description, address, and telephone properties
    - _Requirements: 21.1, 21.2, 21.3, 21.6, 21.7_

  - [x] 12.3 Create `app/sitemap.ts` and `app/robots.ts` — dynamic sitemap with indexable URLs and lastModified dates; robots.ts allowing all crawlers and referencing sitemap URL
    - _Requirements: 21.4, 21.5_

- [x] 13. Accessibility and responsive polish
  - [x] 13.1 Implement semantic HTML landmarks (header, nav, main, section with aria-labels in Spanish, footer), ARIA labels on all interactive elements in Spanish, ARIA roles, visible focus indicators (2px+ outline, 3:1 contrast), and keyboard navigation following logical tab order across all components
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.8_

  - [x] 13.2 Implement responsive design polish: verify mobile stacking below 768px, 44x44px minimum touch targets on mobile, text readability (body ≥14px, headings ≥18px) at 320px, fluid images without overflow, WhatsApp button positioning on mobile (no overlap with forms/CTAs). Verify premium border-radius tokens render correctly across breakpoints
    - _Requirements: 23.2, 23.3, 23.4, 23.5, 23.6, 2.4_

  - [x] 13.3 Add next/image optimization using brand assets from `/public/brand/` (asgro-logo.png, asgro-services-banner.png, asgro-og-image.png) with descriptive alt text in Spanish (or empty alt for decorative), lazy loading for below-the-fold content, SVG/CSS fallbacks for missing brand assets, and ARIA live regions for dynamic updates (form errors, chat responses, success messages)
    - _Requirements: 22.5, 22.6, 22.10_

- [x] 14. Checkpoint - Full build and accessibility verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Environment validation and deployment readiness
  - [x] 15.1 Finalize `lib/config/env.ts` with runtime validation that fails build on missing required vars (DATABASE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER) with specific error messages naming the missing variable; ensure graceful fallback for optional vars (AI keys, RESEND_API_KEY). NEXT_PUBLIC_COMPANY_PHONE, NEXT_PUBLIC_COMPANY_EMAIL, NEXT_PUBLIC_COMPANY_ADDRESS are validated as required ONLY in production (NODE_ENV=production) — in development, if empty or missing, hide corresponding UI elements gracefully without broken links or placeholder data
    - _Requirements: 24.1, 24.3, 24.4, 24.6_

  - [x]* 15.2 Write property test for environment validation (Property 6)
    - **Property 6: Environment validation rejects missing required variables with specific error messages**
    - Test with arbitrary env objects missing various combinations of required vars
    - **Validates: Requirements 24.6**

- [x] 16. Testing setup and execution
  - [x] 16.1 Set up Vitest with jsdom, @testing-library/react, fast-check, and jest-axe; configure test paths for `__tests__/properties/`, `__tests__/unit/`, and `__tests__/integration/`; add test scripts to package.json
    - _Requirements: 1.1_

  - [x]* 16.2 Write unit tests for Header, Footer, and MobileNav components (render Spanish navigation links: Inicio, Nosotros, Servicios, Metodología, Resultados, Agente IA, Preguntas frecuentes, Contacto, Cotizar ahora, WhatsApp; mobile toggle, accessibility)
    - _Requirements: 3.1, 3.4, 3.5, 19.2, 19.3_

  - [x]* 16.3 Write unit tests for ContactSection and QuoteSection forms (expanded fields validation flow, data privacy checkbox, submission, success/error states)
    - _Requirements: 16.2, 16.3, 16.4, 16.6, 16.7, 17.3, 17.4, 17.7, 17.8_

  - [x]* 16.4 Write unit tests for API routes (contact, quote, chat, faqs, metrics, time) covering success, validation errors, DB failure scenarios, and time API three-state business hours
    - _Requirements: 20.6, 20.7, 20.8, 20.9, 20.10, 20.11, 20.3_

  - [x]* 16.5 Write integration tests for contact form flow, quote form flow, and chat flow (end-to-end submission with mocked DB)
    - _Requirements: 16.4, 16.5, 16.6, 17.5, 17.6, 17.7, 14.2, 14.9_

  - [x]* 16.6 Write accessibility tests using jest-axe on all major rendered sections to verify automated a11y compliance
    - _Requirements: 22.1, 22.3, 22.4_

- [x] 17. Final checkpoint - Complete build verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code uses TypeScript in strict mode with the Next.js 15+ App Router pattern
- ALL UI text, navigation, labels, error messages, and placeholder content MUST be in Spanish
- Navigation items: Inicio, Nosotros, Servicios, Metodología, Resultados, Agente IA, Preguntas frecuentes, Contacto
- Header buttons: "Cotizar ahora" and "WhatsApp"
- Hero buttons: "Solicitar asesoría", "Cotizar ahora", "Hablar por WhatsApp", "Consultar Agente IA"
- Contact form fields: nombre completo, empresa, cargo, teléfono, email, ciudad, servicio de interés, mensaje, aceptación datos
- Quote form fields: nombre de empresa, NIT, nombre de contacto, cargo, teléfono, email, ciudad, actividad económica, trabajadores, servicio requerido, ARL actual (optional), comentarios, aceptación datos
- AI Agent keyword matcher searches: title, content, category, AND tags fields (NOT a non-existent "keywords" field)
- Time API returns: "Disponible" (Mon-Fri 8-18, Sat 8-12), "Fuera de horario" (outside hours), "Canal digital activo" (Sunday)
- Premium border-radius: cards 18-28px, buttons 14-18px, inputs 14px, modals 24px
- SEO includes THREE JSON-LD schemas: InsuranceAgency, LocalBusiness, Organization
- Brand assets from /public/brand/ with SVG/CSS fallbacks
- Use "seguros empresariales a la medida" consistently instead of "seguros corporativos" across all pages, DB seed, forms, FAQs, AI agent, and SEO
- FAQ categories in Spanish: servicios, cotización, proceso, cumplimiento (NOT services, pricing, process, compliance)
- NEXT_PUBLIC_COMPANY_PHONE, NEXT_PUBLIC_COMPANY_EMAIL, NEXT_PUBLIC_COMPANY_ADDRESS are required in production only — in development, hide contact UI gracefully if empty
- No empty links, no lorem ipsum, no invented contact data — all configurable via env vars or constants
- Fallback data ensures the page renders even without database connectivity
- Server Components are used for all static content; Client Components are isolated to interactive elements only

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.4"] },
    { "id": 2, "tasks": ["1.3", "1.5", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.1", "3.3", "3.4"] },
    { "id": 4, "tasks": ["2.4", "3.2", "3.5", "3.6", "3.7"] },
    { "id": 5, "tasks": ["4.1", "4.2", "4.3", "4.4"] },
    { "id": 6, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.10"] },
    { "id": 7, "tasks": ["6.6", "6.8", "6.9", "9.1"] },
    { "id": 8, "tasks": ["6.7", "7.1", "7.2", "9.2", "9.3"] },
    { "id": 9, "tasks": ["8.1", "8.2", "9.4"] },
    { "id": 10, "tasks": ["9.5", "9.6", "11.1", "11.2"] },
    { "id": 11, "tasks": ["11.3", "11.4", "11.5"] },
    { "id": 12, "tasks": ["11.6", "11.7", "11.8"] },
    { "id": 13, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 14, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 15, "tasks": ["15.1"] },
    { "id": 16, "tasks": ["15.2", "16.1"] },
    { "id": 17, "tasks": ["16.2", "16.3", "16.4"] },
    { "id": 18, "tasks": ["16.5", "16.6"] }
  ]
}
```
