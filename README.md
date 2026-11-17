# ALICE AI — Agentic Workspace

All-in-One Personal, Business and Coding AI Agent.

## Current status

**Foundation v0.1** — responsive chat workspace with Gemini API integration and selectable work modes.

### Included
- Auto, Personal, Business, Coding, Research and Automation modes
- Next.js App Router interface
- Server-side Gemini API request (API key is never sent to the browser)
- Input validation, request timeout and clear setup errors
- Mobile-responsive dark interface

### Stack
- Next.js + React + TypeScript
- Gemini API (configurable model; default: `gemini-flash-latest`)
- Vercel-compatible deployment

## Run locally

1. Install Node.js 20.9 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`.
4. Add your Gemini API key to `GEMINI_API_KEY`.
5. Start: `npm run dev`
6. Open `http://localhost:3000`.

Create a Gemini API key at https://aistudio.google.com/app/apikey.

## Deploy on Vercel

Import this repository into Vercel. Add `GEMINI_API_KEY` as a server-side environment variable for Production, Preview and Development as needed, then deploy. Optionally set `GEMINI_MODEL` to a model available to your API key.

## Security and limitations

- Never commit `.env.local` or expose API keys in client-side code.
- This first milestone is an AI chat foundation, not yet an autonomous system with external tools.
- The assistant must not claim to perform external actions until the relevant integrations are implemented and tested.
- Add authentication, rate limiting, persistent memory, tool permissions and audit logs before public production use.
- Gemini API quotas and pricing depend on the selected model and account. Review current terms before using real customer data.

## Roadmap

1. Core chat and model connection
2. Agent planner and task routing
3. Personal and business tools
4. Coding workspace and GitHub integration
5. Persistent memory and automation
6. Authentication, approvals, monitoring and production hardening
