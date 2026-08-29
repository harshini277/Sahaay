# Sahaay

### Citizen-first guidance for government grievances

Sahaay is a citizen-facing grievance guidance experience designed to help people navigate public-service grievance processes without needing to understand government terminology first.

## The problem

Citizens often know what happened but may not know:

* Which department is responsible
* Which grievance category to select
* What information they need
* Who is responsible for their area
* When they should escalate
* Where to track their complaint

This creates unnecessary friction before a grievance can even enter the appropriate process.

## The Sahaay approach

Sahaay starts with:

> **“What went wrong?”**

The citizen describes their problem in everyday language.

Sahaay then:

1. Understands the reported issue
2. Asks focused clarification questions
3. Identifies the likely service and grievance category
4. Determines the relevant location and jurisdiction
5. Explains the grievance route
6. Identifies the responsible authority
7. Requires authentication before submission
8. Collects and reviews the required details
9. Creates a grievance reference
10. Provides detailed tracking
11. Supports reminders, feedback, escalation and appeal

The goal is not to replace government grievance systems. It is to make them easier for citizens to understand and navigate.

## Example journey

A citizen enters:

> “The roads near my area have lots of potholes and nobody has fixed them.”

Sahaay identifies this as a likely roads/public-works issue, asks for the relevant location, identifies the appropriate authority layer, and guides the citizen through preparation, submission and tracking.

The citizen does not need to know the official grievance category beforehand.

## Privacy and safety

This submission uses **synthetic data and mocked government dependencies** so that the complete citizen journey can be demonstrated without accessing sensitive production systems.

The following are mocked:

* Citizen authentication
* Citizen and grievance records
* Government-system integrations
* Authority/contact directory
* Grievance lifecycle updates
* Notifications
* Appeal processing
* Identity verification

Sensitive personal information should not be entered into the demonstration.

In a production implementation, authentication and sensitive citizen information would remain within secure, government-controlled systems.

## Authority directory

Sahaay demonstrates an authority-routing layer containing:

* Service area
* Location/jurisdiction
* Responsible department
* Responsible role
* Escalation authority
* Contact channel
* Expected response period
* Source and verification metadata

The demonstration directory contains synthetic/illustrative records. A production system would use authoritative government data with processes for continuously verifying jurisdictions, contacts and responsible officials.

## Technology

* React
* TypeScript
* Vite
* Client-side mock service/state layer
* Responsive web interface
* Vercel deployment

The current implementation intentionally avoids production government APIs and sensitive integrations.

## Local development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

The application is designed for deployment on Vercel.

**Framework:** Vite
**Build command:** `npm run build`
**Output directory:** `dist`

The project includes SPA routing configuration for deployment.

## Demonstration account

A synthetic demonstration account is provided separately for reviewers.

The demonstration account is not a real government identity.

## Scope and future scale

The current implementation demonstrates the complete citizen experience and intended workflow.

A production implementation would require government-approved infrastructure, secure authentication, authoritative authority data, auditability, accessibility compliance, monitoring, privacy controls and integration with existing grievance systems.

The guidance layer could use an approved AI model, rules engine, or combination of both to interpret citizen descriptions while keeping sensitive government data within authenticated government systems.

## Why Sahaay?

Government processes should not require citizens to become experts in government processes.

**Sahaay lets citizens start with the one thing they already know: what happened to them.**


## Local AI layer

Sahaay now includes an optional in-browser interpretation layer using WebLLM. On compatible browsers, a small Llama 3.2 1B instruction model is loaded locally through WebGPU and used to identify the citizen's intent, likely service and any location already provided.

The model does **not** decide government authority contacts or invent routing information. Its output is converted into structured hints and then passed through Sahaay's deterministic grievance and authority data. If WebGPU/model loading is unavailable, the existing rules-based interpreter remains the fallback so the MVP still works.

The first AI-assisted interaction can take longer because the browser may need to download and cache the model. This is an MVP trade-off; a production deployment could use an approved government-hosted model/service or another secure inference layer instead.

### On-device AI (no API key required)

The conversational guidance uses a browser-local LLM through WebLLM/WebGPU. No OpenAI API key or Vercel server function is required for the demonstration. The model is downloaded to the citizen's browser and inference happens on the device when WebGPU is available. On devices where local inference cannot run, Sahaay falls back to its deterministic guidance flow.

The first local-model load can take time and uses significant browser storage. This is a deliberate MVP trade-off to avoid sending citizen text to a third-party API.
