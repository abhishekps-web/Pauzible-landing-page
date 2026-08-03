# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

Marketing/landing page for Pauzible (a UK equity-release product for buy-to-let landlords), built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. It is a single page (`src/app/page.tsx`) composed of independent section components. There is no backend, CMS, or test suite — this is a static, mostly presentational site built directly from Figma designs.

## Commands

```bash
npm run dev     # Start dev server with Turbopack at http://localhost:3000
npm run build   # Production build
npm run start   # Serve the production build
npm run lint    # ESLint (eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit  # Type-check only (no dedicated typecheck script exists)
```

There is no test framework configured — do not assume Jest/Vitest/RTL exist. Verify visual/behavioral changes by running the dev server and checking in a browser (or headless via Playwright) rather than writing test files.

## Architecture

- **Single page, section components**: `src/app/page.tsx` renders `Hero`, `ValueProposition`, `GrowYourWealth`, `FinancingCostV2`, `EquityCalculator`, `CaseStudies`, `FAQ`, `Footer` in order. Each is a standalone component in `src/components/`, self-contained with its own markup, copy, and (where relevant) local state. There's no shared layout/section wrapper beyond `src/app/layout.tsx` — each component owns its own `<section>` padding/spacing.
- **Client vs. server components**: most sections are plain server components. Components with interactivity (sliders, tabs, toggles — e.g. `EquityCalculator.tsx`, `FinancingCostV2.tsx`) are explicitly marked `"use client"` and hold local state via `useState`; there is no global state management.
- **Design tokens** live in `src/app/globals.css` under `@theme inline`: `--color-brand` (#830d41), `--color-brand-btn-text`, `--color-dark`, plus font variables `--font-sans` (Inter), `--font-heading` (Outfit), `--font-fira` (Fira Sans Condensed). These map to Tailwind utilities `bg-brand`/`text-brand`, `text-dark`, `font-sans`/`font-heading`/`font-fira`. Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and exposed as CSS variables on `<html>`.
- **Colors outside the token set** are written as raw Tailwind arbitrary values (e.g. `text-[#6b6d6b]`, `border-[#e4e4e4]`) rather than being added to the theme — this is the established pattern throughout the codebase, follow it rather than inventing new tokens for one-off colors.
- **Custom native control styling**: `<input type="range">` thumbs are styled via the `.range-thumb` utility class (with `::-webkit-slider-thumb`/`::-moz-range-thumb`) defined in `globals.css`, since Tailwind can't target these pseudo-elements directly. Reuse this class for any new slider rather than redefining thumb styles.
- **Static assets** live under `public/<section-name>/` (e.g. `public/financing-cost/`, `public/equity-calculator/`), one folder per section component, and are rendered via `next/image`. SVGs are allowed as `<img>`/`next/image` sources per `next.config.ts` (`dangerouslyAllowSVG: true`).
- **Path alias**: `@/*` → `./src/*` (see `tsconfig.json`).

## Working from Figma

Sections in this repo are implemented directly from Figma designs (via the Figma MCP tools/skills). When porting or updating a section from Figma:
- Pull exact pixel values, spacing, and colors from the design rather than approximating with round Tailwind defaults, but still convert to the project's existing token classes (`font-heading`, `text-dark`, `bg-brand`, etc.) where they match instead of hardcoding.
- Pay attention to image `object-fit`/crop details. Figma often specifies precise oversized/offset crops (e.g. a chart image sized to `117%` height and shifted `-8.5%` top) to frame an asset correctly — replicating these with a plain `object-contain` fill silently changes the framing. Match the crop math exactly (an `overflow-hidden` wrapper + absolutely positioned `<img>` with the exact width/height/top/left percentages, when `next/image`'s `fill` mode can't express it).
- Check whether visual affordances (drop shadows, borders) in the design apply uniformly across all states of a component (e.g. every tab pill, active or not) rather than only to the "active"/selected state shown in a single screenshot — it's easy to only notice the shadow on the example state that's visually distinct.
- Download and commit real exported assets (icons, illustrations, charts) from Figma into `public/<section>/`; never hand-author SVG/icon content.
