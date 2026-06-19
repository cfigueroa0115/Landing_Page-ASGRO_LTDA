# Requirements Document

## Introduction

ASGRO LTDA Agencia de Seguros is an insurance agency specialized in occupational risk management (ARL), workplace safety and health (SST), employee wellbeing, and corporate insurance solutions. This document defines requirements for a production-ready, full-stack landing page that serves as the company's primary digital presence. The landing page must present the company professionally, capture leads, enable quote requests, provide an AI-powered assistant specialized in insurance and SST topics, and deliver a premium corporate visual experience.

## Glossary

- **Landing_Page**: The full-stack Next.js web application serving as ASGRO LTDA's institutional and commercial website
- **Visitor**: Any person accessing the Landing_Page through a web browser
- **Lead**: A potential client who submits contact information through the contact form
- **Quote_Request**: A structured request for insurance or SST service pricing submitted via the quote form
- **AI_Agent**: An AI-powered chat assistant embedded in the Landing_Page, specialized in insurance, SST, ARL, and occupational risk topics
- **Knowledge_Base**: A database table containing curated information the AI_Agent uses to answer questions
- **Chat_Session**: A conversation instance between a Visitor and the AI_Agent
- **Contact_Form**: The form component that captures lead information and stores it in the database
- **Quote_Form**: The form component that captures detailed quote request information
- **WhatsApp_CTA**: A floating button and inline links that open WhatsApp direct messaging to ASGRO's business number
- **Header**: The sticky navigation bar at the top of the Landing_Page
- **Hero_Section**: The primary above-the-fold area with the main value proposition
- **Metrics_Dashboard**: The section displaying animated counters with company impact statistics
- **FAQ_Section**: The frequently asked questions section with expandable accordions
- **Database**: Neon PostgreSQL instance storing leads, quotes, FAQs, metrics, chat data, and site settings
- **API_Routes**: Next.js server-side route handlers exposing REST endpoints
- **SST**: Seguridad y Salud en el Trabajo (Workplace Safety and Health)
- **ARL**: Administradora de Riesgos Laborales (Occupational Risk Administrator)

## Requirements

### Requirement 1: Technology Stack and Project Setup

**User Story:** As a developer, I want the project to use a modern, well-defined technology stack, so that the codebase is maintainable, performant, and deployable on Vercel.

#### Acceptance Criteria

1. THE Landing_Page SHALL use Next.js 15 or higher with App Router and TypeScript in strict mode
2. THE Landing_Page SHALL use Tailwind CSS for styling with the defined brand color palette
3. THE Landing_Page SHALL use shadcn/ui and Radix UI as the component library foundation
4. THE Landing_Page SHALL use Framer Motion for animations and transitions
5. THE Landing_Page SHALL use Lucide React and React Icons for iconography
6. THE Landing_Page SHALL use React Hook Form combined with Zod for form validation
7. THE Landing_Page SHALL use Drizzle ORM to connect to a Neon PostgreSQL database
8. THE Landing_Page SHALL be deployable on Vercel using the standard Next.js build command (`next build`) completing without errors and requiring no custom server, Docker containers, or additional infrastructure services beyond Vercel and Neon PostgreSQL
9. THE Landing_Page SHALL use Inter as the primary typeface loaded via next/font with a typographic hierarchy defining distinct font sizes and weights for at minimum 4 heading levels (h1 through h4), body text, and small/caption text

### Requirement 2: Brand Identity and Visual Design

**User Story:** As a brand stakeholder, I want the landing page to reflect ASGRO's premium corporate identity, so that visitors perceive the company as trustworthy, professional, and innovative.

#### Acceptance Criteria

1. THE Landing_Page SHALL use exclusively the primary color palette: Blue #024EA3, Dark Blue #011930, Navy #001B33, Green #7AC146, Green Alt #6FB639, Neon Green #9BE564, Light Gray #F4F6F9, plus white (#FFFFFF) and neutral grays derived from the Light Gray tone
2. THE Landing_Page SHALL apply white (#FFFFFF) backgrounds for informational content sections and a linear gradient from Dark Blue #011930 to Navy #001B33 for the Hero_Section and footer backgrounds
3. THE Landing_Page SHALL use green tones (#7AC146, #6FB639, #9BE564) exclusively for accent elements, highlights, and call-to-action buttons
4. THE Landing_Page SHALL implement a mobile-first responsive design that adapts to viewports from 320px to 2560px using breakpoints at 768px (tablet), 1024px (small desktop), and 1440px (large desktop), ensuring no horizontal scrollbar appears, all text remains readable without horizontal scrolling or zooming, and all interactive elements maintain a minimum tap target size of 44x44px on viewports below 1024px
5. THE Landing_Page SHALL maintain consistent spacing using an 8px base unit (multiples of 8px for margins and padding), a uniform border-radius of 8px for cards and containers and 4px for buttons and input fields, and a single shadow style for elevated components (offset-y between 2px and 4px, blur between 8px and 16px, using black at 10% to 15% opacity)
6. THE Landing_Page SHALL represent brand values through the use of shield or lock iconography for protection and security, checkmark or certificate iconography for compliance and trust, and forward-pointing or technology-themed imagery for innovation and prevention

### Requirement 3: Sticky Header and Navigation

**User Story:** As a Visitor, I want a persistent navigation bar, so that I can access any section of the page regardless of my scroll position.

#### Acceptance Criteria

1. THE Header SHALL remain fixed at the top of the viewport during scrolling with a z-index sufficient to remain above all page content
2. THE Header SHALL apply a glassmorphism visual effect with backdrop blur and a background opacity between 70% and 90%
3. THE Header SHALL display the ASGRO logo on the left side
4. THE Header SHALL provide navigation links to the following sections of the Landing_Page: Hero_Section, services, about us, methodology, FAQ_Section, and Contact_Form
5. IF the viewport width is below 768px, THEN THE Header SHALL collapse navigation links into a hamburger menu button
6. WHEN a Visitor clicks a navigation link, THE Landing_Page SHALL smooth-scroll to the corresponding section within 800 milliseconds
7. THE Header SHALL include a primary call-to-action button linking to the Contact_Form section
8. WHEN a Visitor taps the hamburger menu button on mobile, THE Header SHALL display the navigation links in a vertical overlay or dropdown panel
9. WHEN a Visitor selects a navigation link from the mobile menu or taps outside the menu area, THE Header SHALL close the mobile navigation panel

### Requirement 4: Hero Section

**User Story:** As a Visitor, I want to immediately understand ASGRO's value proposition upon landing, so that I can decide whether the services are relevant to my company.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a dark blue gradient background using colors from Dark Blue #011930 to Navy #001B33 consistent with the brand palette
2. THE Hero_Section SHALL present the main headline communicating ASGRO's core value proposition in a maximum of 80 characters
3. THE Hero_Section SHALL include exactly 4 descriptive badges highlighting the key service areas: occupational risk management, SST, employee wellbeing, and corporate insurance
4. THE Hero_Section SHALL display 4 animated cards showcasing the primary service categories, each with an icon and title
5. THE Hero_Section SHALL include a primary call-to-action button labeled "Solicitar asesoría" directing Visitors to the Contact_Form section
6. THE Hero_Section SHALL include a secondary call-to-action button labeled "Cotizar ahora" directing Visitors to the Quote_Form section
7. WHEN the page loads, THE Hero_Section SHALL animate content elements using Framer Motion entrance transitions completing within 1000 milliseconds

### Requirement 5: Strategic Pillars Section

**User Story:** As a Visitor, I want to see ASGRO's strategic focus areas at a glance, so that I understand the breadth and depth of their expertise.

#### Acceptance Criteria

1. THE Landing_Page SHALL display exactly 4 strategic pillar cards in a responsive grid layout that transitions from 1 column below 640px, to 2 columns between 640px and 1024px, to 4 columns above 1024px
2. WHEN a Visitor hovers over a pillar card on a pointer-enabled device, THE Landing_Page SHALL apply an elevation and highlight animation completing within 300 milliseconds
3. THE Landing_Page SHALL present each pillar with an icon, a title of no more than 40 characters, and a description of no more than 120 characters
4. WHEN the strategic pillars section scrolls into the viewport, THE Landing_Page SHALL animate the pillar cards into view using Framer Motion entrance transitions

### Requirement 6: About Us Section

**User Story:** As a Visitor, I want to learn about ASGRO's background and identity, so that I can evaluate whether they are a credible partner for my company.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a dedicated About Us section with the id "nosotros" containing a heading, a company description paragraph of 150 to 400 characters, and a highlighted value proposition statement
2. THE Landing_Page SHALL communicate ASGRO's specialization areas by listing at minimum: occupational risk management, SST, ARL, and corporate insurance as distinct items with accompanying icons
3. THE Landing_Page SHALL present the company's value proposition in a visually distinct callout or highlighted container separate from the body text
4. THE Landing_Page SHALL display the About Us section using a two-column layout on viewports above 768px (text on left, visual elements on right) and a single-column stacked layout below 768px

### Requirement 7: Mission and Vision Section

**User Story:** As a Visitor, I want to understand ASGRO's purpose and direction, so that I can assess alignment with my company's values.

#### Acceptance Criteria

1. THE Landing_Page SHALL display ASGRO's mission statement in a dedicated card or container with a visible border, background fill, or shadow that separates it from surrounding content
2. THE Landing_Page SHALL display ASGRO's vision statement in a dedicated card or container with a visible border, background fill, or shadow that separates it from surrounding content
3. THE Landing_Page SHALL label each card with a heading identifying it as "Misión" or "Visión" respectively
4. THE Landing_Page SHALL differentiate the mission and vision cards visually using at least one of the following: distinct icon per card, distinct color accent per card, or side-by-side layout on viewports 768px and above

### Requirement 8: Why Choose ASGRO Section

**User Story:** As a Visitor, I want to see concrete reasons to choose ASGRO over competitors, so that I can justify the decision to stakeholders.

#### Acceptance Criteria

1. THE Landing_Page SHALL display exactly 5 competitive differentiators, each presented with a title of no more than 40 characters and a description of no more than 150 characters
2. THE Landing_Page SHALL present each differentiator with an icon inside a circular container using the brand green or blue accent color, followed by the title and description
3. THE Landing_Page SHALL organize the differentiators in a responsive grid transitioning from 1 column below 640px, to 2 columns between 640px and 1024px, to 3 columns above 1024px
4. WHEN the Why Choose ASGRO section scrolls into the viewport, THE Landing_Page SHALL animate the differentiator cards using Framer Motion staggered entrance transitions

### Requirement 9: Main Services Section

**User Story:** As a Visitor, I want to explore ASGRO's service offerings in detail, so that I can identify which services match my company's needs.

#### Acceptance Criteria

1. THE Landing_Page SHALL display 4 service category cards in a responsive grid layout covering: ARL and occupational risk management, SST programs, corporate insurance solutions, and employee wellbeing programs
2. WHEN a Visitor clicks on a service card, THE Landing_Page SHALL open a modal dialog displaying the service title, icon, a description of at least 80 characters, and a list of specific sub-services or coverage areas included in that category
3. THE Landing_Page SHALL present each service card with an icon, title, a description of no more than 120 characters, and a "Learn more" action button
4. WHEN the service modal is open, THE Landing_Page SHALL provide a call-to-action button to request a quote via the Quote_Form or contact ASGRO via WhatsApp_CTA
5. WHEN the service modal is open, THE Landing_Page SHALL allow the Visitor to close the modal by clicking a visible close button, clicking outside the modal overlay, or pressing the Escape key

### Requirement 10: SST and ARL Detail Section

**User Story:** As a Visitor, I want in-depth information about SST and ARL services, so that I can understand the technical scope and regulatory compliance ASGRO offers.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a visually distinct SST subsection presenting a minimum of 3 regulatory topics including ASGRO's approach to each, organized in cards or content blocks with icons and descriptions
2. THE Landing_Page SHALL display a visually distinct ARL subsection presenting a minimum of 3 service topics including risk classification and advisory, organized in cards or content blocks with icons and descriptions
3. THE Landing_Page SHALL present a minimum of 3 compliance benefits and risk reduction outcomes using visual emphasis such as icons, bold headings, or accent-colored indicators to differentiate them from body text
4. WHEN the SST and ARL Detail Section scrolls into the viewport, THE Landing_Page SHALL animate content elements using Framer Motion entrance transitions

### Requirement 11: Methodology Section

**User Story:** As a Visitor, I want to understand ASGRO's implementation process, so that I can set expectations for engagement timelines.

#### Acceptance Criteria

1. THE Landing_Page SHALL present ASGRO's methodology as a visual timeline or step-by-step process with numbered step indicators showing the sequential order
2. THE Landing_Page SHALL display exactly 5 methodology steps (Diagnóstico, Planeación, Implementación, Seguimiento, Mejora continua), each containing a step number, title, and description of 20 to 150 characters
3. WHEN a Visitor scrolls the methodology section into view, THE Landing_Page SHALL animate the timeline elements sequentially with a stagger delay of 150 to 300 milliseconds between each element
4. WHEN a Visitor scrolls the methodology section into view and the animation completes, THE Landing_Page SHALL leave all timeline elements in their final visible state without looping

### Requirement 12: Impact Metrics Section

**User Story:** As a Visitor, I want to see quantified impact data, so that I can assess ASGRO's track record and scale of operations.

#### Acceptance Criteria

1. THE Metrics_Dashboard SHALL display animated counter values that increment from zero to the target value over a duration between 1500 and 2500 milliseconds
2. THE Metrics_Dashboard SHALL retrieve metric values from the Database via the GET /api/metrics endpoint
3. WHEN at least 25% of the Metrics_Dashboard becomes visible in the viewport, THE Landing_Page SHALL trigger the counter animation exactly once per page load
4. IF the GET /api/metrics endpoint fails, THEN THE Metrics_Dashboard SHALL display hardcoded fallback values matching the minimum required metrics with their labels and units
5. THE Metrics_Dashboard SHALL display a minimum of 4 and a maximum of 8 impact metrics, each showing a numeric value, a descriptive label, and a unit of measurement
6. IF the GET /api/metrics endpoint returns fewer than 4 metrics, THEN THE Metrics_Dashboard SHALL supplement the response with hardcoded fallback entries to meet the minimum of 4 displayed metrics

### Requirement 13: Benefits Section

**User Story:** As a Visitor, I want to understand the tangible benefits of working with ASGRO, so that I can build a business case for engagement.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a minimum of 6 benefits, each presented with an icon, a title, and a description of no more than 120 characters
2. THE Landing_Page SHALL organize benefits in a responsive grid that adapts from 1 column on viewports below 768px to 2 columns between 768px and 1024px to 3 columns on viewports above 1024px
3. THE Landing_Page SHALL present each benefit description referencing a specific outcome, metric, or measurable result rather than subjective or unsubstantiated qualifiers
4. WHEN the benefits section scrolls into the viewport, THE Landing_Page SHALL animate the benefit cards using Framer Motion entrance transitions

### Requirement 14: AI Agent Chat Interface

**User Story:** As a Visitor, I want to ask questions about insurance, SST, and occupational risks in real time, so that I can get immediate guidance without waiting for a human advisor.

#### Acceptance Criteria

1. THE AI_Agent SHALL present a chat interface accessible from a dedicated section on the Landing_Page with the id "agente-ia" and an optional floating chat button
2. WHEN a Visitor sends a message, THE AI_Agent SHALL respond within 5 seconds using information from the Knowledge_Base stored in the Database
3. THE AI_Agent SHALL maintain conversation context within a Chat_Session, retaining up to the last 10 messages for context
4. THE AI_Agent SHALL specialize exclusively in insurance, SST, ARL, and occupational risk topics relevant to ASGRO's services
5. IF the AI_Agent cannot match the Visitor's question to any Knowledge_Base entry with sufficient confidence, THEN THE AI_Agent SHALL respond with a predefined fallback message recommending the Visitor contact a human advisor via WhatsApp or the Contact_Form
6. THE AI_Agent SHALL NOT generate information that is not present in or derivable from the Knowledge_Base
7. IF no external AI API key (OPENAI_API_KEY or GEMINI_API_KEY) is configured, THEN THE AI_Agent SHALL use a local keyword-matching fallback system that searches the Knowledge_Base for entries matching words in the Visitor's message
8. WHEN an external AI API key is configured, THE AI_Agent SHALL use the OpenAI or Gemini API to generate contextual responses, providing Knowledge_Base content as system context
9. THE AI_Agent SHALL store all Chat_Session and message data in the Database via the POST /api/chat endpoint
10. THE AI_Agent SHALL accept Visitor messages with a maximum length of 500 characters and display a character counter
11. IF the Visitor sends a message on an off-topic subject, THEN THE AI_Agent SHALL respond indicating it can only assist with insurance, SST, ARL, and occupational risk topics

### Requirement 15: FAQ Section

**User Story:** As a Visitor, I want to find answers to common questions quickly, so that I can resolve doubts without contacting support.

#### Acceptance Criteria

1. THE FAQ_Section SHALL display questions and answers in an accordion format where each item shows the question text in its collapsed state and reveals the answer text when expanded, allowing multiple items to be expanded simultaneously
2. WHEN the FAQ_Section loads, THE FAQ_Section SHALL retrieve FAQ content from the Database via the GET /api/faqs endpoint within 5 seconds
3. IF the GET /api/faqs endpoint returns a non-200 status code, a network error, or fails to respond within 5 seconds, THEN THE FAQ_Section SHALL display a minimum of 8 hardcoded fallback FAQs covering the same topic categories as criterion 4
4. THE FAQ_Section SHALL display a minimum of 8 frequently asked questions with at least 2 questions from each of the following categories: services, pricing, process, and compliance
5. WHILE the FAQ_Section is retrieving content from the GET /api/faqs endpoint, THE FAQ_Section SHALL display a loading indicator to the user

### Requirement 16: Contact Form and Lead Capture

**User Story:** As a Visitor, I want to submit my contact information easily, so that ASGRO can follow up with me about their services.

#### Acceptance Criteria

1. THE Contact_Form SHALL collect: full name (required, maximum 100 characters), company name (required, maximum 120 characters), email address (required, valid email format, maximum 254 characters), phone number (required, between 7 and 15 digits), and message (required, between 10 and 2000 characters)
2. THE Contact_Form SHALL validate all required fields using Zod schemas before submission, rejecting empty values, email addresses not matching a valid format, phone numbers outside the 7-to-15 digit range, and message text shorter than 10 characters or longer than 2000 characters
3. WHEN the Contact_Form validation fails, THE Contact_Form SHALL display inline error messages for each invalid field indicating the specific validation rule that failed
4. WHEN a Visitor submits a valid Contact_Form, THE Landing_Page SHALL disable the submit button to prevent duplicate submissions and send the data to the POST /api/contact endpoint
5. WHEN the POST /api/contact endpoint receives valid data, THE API_Routes SHALL store the Lead in the leads database table
6. WHEN the Lead is stored successfully, THE Contact_Form SHALL display a success confirmation message to the Visitor and reset all form fields to their empty default state
7. IF the POST /api/contact endpoint fails, THEN THE Contact_Form SHALL re-enable the submit button, display an error message indicating the submission could not be completed, and preserve the Visitor's entered data so they can retry without re-entering information

### Requirement 17: Quote Request Form

**User Story:** As a Visitor, I want to request a specific insurance or SST service quote, so that I can receive a tailored proposal from ASGRO.

#### Acceptance Criteria

1. THE Quote_Form SHALL collect the following required fields: full name (maximum 100 characters), company name (maximum 150 characters), NIT or identification number (maximum 20 characters, numeric digits and hyphen only), email (maximum 254 characters, valid email format), phone (maximum 15 digits, numeric with optional leading +), service type selection, and number of employees (integer between 1 and 99,999); and one optional field: additional details (maximum 1,000 characters)
2. THE Quote_Form SHALL provide the following service type options for selection: ARL and occupational risk management, SST programs, corporate insurance solutions, and employee wellbeing programs
3. THE Quote_Form SHALL validate all required fields as non-empty and all fields against their format and length constraints using Zod schemas before submission
4. WHEN the Quote_Form validation fails, THE Quote_Form SHALL display inline error messages adjacent to each invalid field indicating the specific validation failure
5. WHEN a Visitor submits a valid Quote_Form, THE Landing_Page SHALL send the data to the POST /api/quote endpoint
6. WHEN the POST /api/quote endpoint receives valid data, THE API_Routes SHALL store the Quote_Request in the quote_requests database table
7. WHEN the Quote_Request is stored successfully, THE Quote_Form SHALL display a success confirmation message to the Visitor and reset all form fields to their default empty state
8. IF the POST /api/quote endpoint fails, THEN THE Quote_Form SHALL display an error message indicating the submission could not be processed, preserve all entered form data, and enable the submit button so the Visitor can retry without re-entering information

### Requirement 18: WhatsApp Integration

**User Story:** As a Visitor, I want to contact ASGRO instantly via WhatsApp, so that I can get immediate human assistance.

#### Acceptance Criteria

1. THE WhatsApp_CTA SHALL display a floating button with a minimum touch target of 48x48 pixels, visible on all viewport sizes at all scroll positions
2. THE WhatsApp_CTA SHALL use a configurable phone number from the NEXT_PUBLIC_WHATSAPP_NUMBER environment variable
3. WHEN a Visitor clicks the WhatsApp_CTA, THE Landing_Page SHALL open WhatsApp in a new browser tab with a pre-filled greeting message in Spanish that identifies the sender as a website visitor and states their intent to receive information
4. THE Landing_Page SHALL use a shared generateWhatsAppUrl helper function for all WhatsApp link generation
5. THE Landing_Page SHALL include WhatsApp buttons in service modals and the contact section, each with a pre-filled message referencing the specific service or section the Visitor is browsing
6. IF the NEXT_PUBLIC_WHATSAPP_NUMBER environment variable is not configured or is empty, THEN THE WhatsApp_CTA and all contextual WhatsApp buttons SHALL be hidden from the Visitor

### Requirement 19: Footer

**User Story:** As a Visitor, I want a comprehensive footer with company information and quick links, so that I can navigate or find contact details from any scroll position.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a footer with a dark blue background matching the background color of the Hero_Section
2. THE Landing_Page SHALL include company contact information in the footer displaying address, phone number, and email, where the phone number and email are clickable links that initiate the corresponding action (tel: and mailto: respectively)
3. THE Landing_Page SHALL include navigation quick links in the footer linking to each section defined in the Header, where clicking a quick link scrolls the page to the corresponding section
4. THE Landing_Page SHALL include social media links in the footer, where each link opens the corresponding social media page in a new browser tab
5. THE Landing_Page SHALL display copyright information including the current year and company name, and legal notice links in the footer
6. WHEN the Visitor clicks a footer quick link, THE Landing_Page SHALL scroll to the targeted section within 1 second

### Requirement 20: Database Schema and API Routes

**User Story:** As a developer, I want a well-defined database schema and API layer, so that all dynamic content and form submissions are persisted reliably.

#### Acceptance Criteria

1. THE Database SHALL include tables for: leads, quote_requests, faqs, knowledge_base, chat_sessions, chat_messages, metrics, and site_settings, each with a UUID primary key and a created_at timestamp column
2. THE API_Routes SHALL expose a GET /api/health endpoint returning a JSON response with status, service name, timestamp, and environment fields
3. THE API_Routes SHALL expose a GET /api/time endpoint returning the current date, time, day of week, timezone (America/Bogota), and business availability status as a JSON response
4. THE API_Routes SHALL expose a GET /api/faqs endpoint returning all FAQ entries where is_active equals true, ordered by order_index ascending, as a JSON array
5. THE API_Routes SHALL expose a GET /api/metrics endpoint returning all metric entries where is_active equals true, ordered by order_index ascending, as a JSON array
6. THE API_Routes SHALL expose a POST /api/contact endpoint that validates the request body against the Contact_Form Zod schema and stores the validated Lead in the leads table
7. THE API_Routes SHALL expose a POST /api/quote endpoint that validates the request body against the Quote_Form Zod schema and stores the validated Quote_Request in the quote_requests table
8. THE API_Routes SHALL expose a POST /api/chat endpoint that accepts a JSON body with sessionId (optional string) and message (required string, 1-500 characters), processes the message through the AI_Agent logic, and returns the assistant response
9. IF any API endpoint receives malformed data, THEN THE API_Routes SHALL return a 400 status code with a JSON body containing an error field with descriptive validation failure details
10. IF any API endpoint encounters a server error, THEN THE API_Routes SHALL return a 500 status code with a JSON body containing a generic error message without exposing stack traces or internal implementation details
11. IF the Database connection is unavailable, THEN THE API_Routes SHALL return a 503 status code with a JSON body containing a "service unavailable" message

### Requirement 21: SEO and Metadata

**User Story:** As a marketing stakeholder, I want the landing page to be fully optimized for search engines and social sharing, so that it ranks well and displays rich previews when shared.

#### Acceptance Criteria

1. THE Landing_Page SHALL include HTML metadata with a title tag of 60 characters or fewer, a meta description of 160 characters or fewer, and a minimum of 5 keywords relevant to insurance, ARL, and SST services in Colombia
2. THE Landing_Page SHALL include Open Graph metadata containing at minimum: og:title, og:description, og:image, og:url, og:type, and og:locale properties for rich social media previews on Facebook and LinkedIn
3. THE Landing_Page SHALL include Twitter Card metadata containing at minimum: twitter:card set to "summary_large_image", twitter:title, twitter:description, and twitter:image properties for rich previews on Twitter/X
4. THE Landing_Page SHALL generate a sitemap.ts file that lists all indexable page URLs with lastModified dates for search engine crawling
5. THE Landing_Page SHALL generate a robots.ts file that allows all search engine crawlers to index and follow the Landing_Page and references the sitemap URL
6. THE Landing_Page SHALL include JSON-LD structured data for Organization schema containing at minimum: name, url, logo, contactPoint, and description properties
7. THE Landing_Page SHALL include a canonical URL meta tag pointing to the primary domain to prevent duplicate content indexing

### Requirement 22: Accessibility and Performance

**User Story:** As a Visitor with accessibility needs, I want the landing page to be usable with assistive technologies, so that I can access all content and functionality regardless of ability.

#### Acceptance Criteria

1. THE Landing_Page SHALL achieve WCAG 2.1 Level AA compliance for color contrast ratios, maintaining a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text and UI components
2. THE Landing_Page SHALL support full keyboard navigation for all interactive elements following a logical top-to-bottom, left-to-right tab order consistent with the visual layout
3. THE Landing_Page SHALL provide ARIA labels that describe the purpose of each interactive component, and ARIA roles matching the component's function, such that a screen reader announces sufficient context for a Visitor to operate the control without visual reference
4. THE Landing_Page SHALL use semantic HTML elements for document structure including landmark elements (header, nav, main, section, footer) and provide a skip-navigation link as the first focusable element to bypass the Header
5. THE Landing_Page SHALL use next/image for optimized image loading, with alt text that conveys the informational content of each image for screen readers, or empty alt attributes for purely decorative images
6. THE Landing_Page SHALL implement lazy loading for below-the-fold content and images using native loading="lazy" or Next.js dynamic imports
7. THE Landing_Page SHALL use Server Components for static content sections, limiting client-side JavaScript bundle to only interactive components (forms, AI_Agent chat, animations, and modals)
8. THE Landing_Page SHALL provide visible focus indicators for all focusable elements with a minimum contrast ratio of 3:1 against adjacent colors and a visible outline or border of at least 2px
9. WHEN a modal dialog opens (service modals or AI_Agent chat), THE Landing_Page SHALL move focus to the modal container, trap focus within the modal while open, and return focus to the triggering element when the modal closes
10. WHEN dynamic content updates occur (form validation errors, AI_Agent responses, or success confirmations), THE Landing_Page SHALL announce the update to assistive technologies using ARIA live regions
11. THE Landing_Page SHALL achieve a Lighthouse Performance score of 90 or above on mobile, with a Largest Contentful Paint of 2.5 seconds or less and a Cumulative Layout Shift of 0.1 or less

### Requirement 23: Responsive Design

**User Story:** As a Visitor using a mobile device, I want the landing page to adapt seamlessly to my screen size, so that I have a complete and usable experience on any device.

#### Acceptance Criteria

1. THE Landing_Page SHALL implement responsive breakpoints at 640px, 768px, 1024px, and 1280px minimum
2. WHILE the viewport width is below 768px, THE Landing_Page SHALL stack content vertically and increase touch target sizes to a minimum of 44x44 pixels
3. THE Landing_Page SHALL ensure all text remains readable without horizontal scrolling on viewports as narrow as 320px, with body text rendered at no smaller than 14px and headings at no smaller than 18px
4. THE Landing_Page SHALL adapt grid layouts from single-column on viewports below 640px, to 2 columns between 640px and 1023px, to 3 or more columns on viewports at 1024px and above
5. WHILE the viewport width is below 768px, THE Landing_Page SHALL position the WhatsApp_CTA floating button so it does not overlap form inputs, navigation elements, or call-to-action buttons
6. THE Landing_Page SHALL scale all images and media elements fluidly to fit their container width without overflow or distortion across all supported viewports from 320px to 2560px

### Requirement 24: Environment Configuration and Deployment

**User Story:** As a developer, I want clear environment variable configuration, so that I can deploy the application across different environments without code changes.

#### Acceptance Criteria

1. THE Landing_Page SHALL use environment variables for: DATABASE_URL (required), NEXT_PUBLIC_WHATSAPP_NUMBER (required), OPENAI_API_KEY or GEMINI_API_KEY (optional), and RESEND_API_KEY (optional)
2. THE Landing_Page SHALL provide an .env.example file listing every environment variable with its name, a description comment, a placeholder value, and a required or optional designation
3. IF the DATABASE_URL is not configured, THEN THE Landing_Page SHALL render database-dependent sections (Metrics_Dashboard, FAQ_Section, AI_Agent chat) with static hardcoded fallback data instead of empty or broken states
4. IF the AI API key is not configured, THEN THE AI_Agent SHALL operate in local fallback mode using keyword matching against the Knowledge_Base
5. THE Landing_Page SHALL be deployable on Vercel using standard Next.js build configuration without custom server setup
6. IF a required environment variable is missing at build or startup time, THEN THE Landing_Page SHALL fail the build with an error message indicating which required variable is missing
