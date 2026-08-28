# Sahaay

### Citizen-first guidance for government grievances

Sahaay is a citizen-facing grievance guidance experience designed to help people navigate public-service grievance processes without needing to understand government terminology first.

## The problem

Citizens often know what happened but may not know:

- Which department is responsible
- Which grievance category to select
- What information they need
- Who is responsible for their area
- When they should escalate
- Where to track their complaint

This creates unnecessary friction before a grievance can even enter the appropriate process.

## The Sahaay approach

Sahaay starts with:

> "What went wrong?"

The citizen describes their problem in everyday language.

Sahaay then:

1. Understands the reported issue
2. Asks focused clarification questions
3. Identifies the likely service/category
4. Determines relevant location/jurisdiction
5. Explains the grievance route
6. Identifies the responsible authority
7. Requires authentication before submission
8. Collects/reviews citizen and grievance details
9. Creates a grievance reference
10. Provides detailed tracking
11. Supports reminders, feedback, escalation and appeal

The goal is not to replace government grievance systems. The goal is to make those systems understandable and easier to navigate.

## Example journey

A citizen enters:

> "The roads near my area have lots of potholes and nobody has fixed them."

Sahaay identifies this as a likely roads/public-works issue, asks for the relevant location, identifies the appropriate authority layer, and guides the citizen through submission and tracking.

The citizen does not need to know the official grievance category beforehand.

## Privacy and safety

This project is a demonstration MVP.

It does **not** connect to production government identity, payment, grievance, or personal-data systems.

The project uses:

- Synthetic citizen accounts
- Mock authentication
- Synthetic grievance records
- Mock authority/contact data
- Mock grievance lifecycle events

Sensitive information should not be entered into the demonstration.

In a production implementation, authentication and sensitive citizen information would remain within secure government-controlled systems.

## Authority directory

Sahaay demonstrates an authority-routing layer containing information such as:

- Service area
- Location/jurisdiction
- Responsible department
- Responsible role
- Escalation authority
- Contact channel
- Expected response period
- Verification/source metadata

The demonstration directory contains synthetic/illustrative records.

A production system would require authoritative government data and a process for continuously verifying officer and jurisdiction information.

## Technology

- React
- TypeScript
- Vite
- Client-side mock data/state
- Responsive web UI
- Vercel deployment

The current MVP intentionally avoids requiring production government APIs or sensitive integrations.

## Local development

Install dependencies:

```bash
npm install
