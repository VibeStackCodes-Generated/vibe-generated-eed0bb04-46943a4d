# Project Context

You are a senior full-stack developer using Claude Agent SDK to build a React application.

## Project Requirements (PRD Summary)
VibeStack

Enable product teams to move from idea to shipped product in weeks, not months, by automating the end‑to‑end product lifecycle with orchestrated AI agents while preserving enterprise-grade security, governance, and integrations.

- AI Orchestration Engine: schedule, chain, and monitor purpose-built agents (ideation, design, codegen, test, deploy).
- Prebuilt Agent Templates: opinionated agents for ideation->spec->code->test->deploy to accelerate time-to-first-value.
- End-to-end Integrations: connectors for Git (GitHub/GitLab), Jira, CI/CD, Figma, Slack, and artifact storage.
- Enterprise Controls: SSO/SAML, RBAC, policy engine, approval gates, and tenant/data isolation.
- Audit & Governance: immutable audit logs, change history, reversible agent actions, and exportable compliance reports.
- Secure-by-default Architecture: encryption at rest/in-transit, SOC 2 readiness artifacts, and privacy controls.
- Orchestration UI & Dashboard: visual flow editor, runbook view, pipeline status, and keyboard-focusable CTAs.
- Observability & ROI Metrics: delivery time, cycle-time reductions, agent run metrics, and customizable outcome dashboards.
- CI/CD & Release Automation: automated PR creation, test execution orchestration, and deployment triggers/integration.
- Admin Console & Tenant Management: onboarding, quota controls, SLA settings, and dedicated support workflows.

MVP scope (essential subset):
- Core orchestration engine + visual flow editor.
- 4 starter agents: idea

## Template Context
This is a minimal React + Vite Single Page Application.

## Core Stack
- React 19.2.0 with TypeScript 5.9.3
- Vite 7.2.2
- Tailwind CSS v4.1.17
- React Router v7.9.5

## Project Structure
```
src/
├── components/
│   ├── error-boundary.tsx    # Error boundary component
│   └── vibestack-badge.tsx    # PROTECTED - DO NOT MODIFY
├── routes/
│   └── index.tsx              # Route definitions
├── App.tsx                     # Root component with routing
├── main.tsx                    # Entry point
└── index.css                   # Tailwind styles
```

## Essential Rules
1. DO NOT modify `src/components/vibestack-badge.tsx` - must remain visible
2. Use path alias `@/` for imports from `src/`
3. Use TypeScript strict mode - no `any` types
4. Use Tailwind CSS for all styling
5. Use React Router for navigation
6. Entry point: `src/main.tsx`
7. Build output: `dist/`
8. Development port: 5173

## Spec-Kit Integration
This project uses GitHub's spec-kit for spec-driven development.

## Spec-Kit Commands Available
- /speckit.plan - Generate an implementation plan from the PRD
- /speckit.tasks - Break down the plan into specific tasks
- /speckit.spec - Create or update specifications

## Workflow
1. First, use /speckit.plan to create a high-level implementation plan
2. Then use /speckit.tasks to break the plan into specific, actionable tasks
3. Execute each task sequentially
4. Update specifications as needed during implementation

## Spec-Kit Best Practices
- Create clear, executable specifications
- Break down complex features into smaller tasks
- Ensure each task is testable and verifiable
- Document any assumptions or constraints
- Keep specifications up to date as you implement

## Agent Skills Available
The following skills are available to help guide your implementation:
- React Patterns: Best practices for functional components, hooks, and state management
- TypeScript Best Practices: Type safety, interfaces, and type utilities
- Tailwind Styling: Utility-first CSS patterns and responsive design

These skills are automatically loaded from .claude/skills/ directory. Reference them when implementing features.

## File Restrictions (CRITICAL)
**DO NOT generate any markdown (.md) files for documentation, except for CLAUDE.md which already exists.**
- Never create README.md, CHANGELOG.md, CONTRIBUTING.md, or any other markdown documentation files
- Never create .md files in docs/, documentation/, or any other directory
- The only markdown file that should exist is .claude/CLAUDE.md (which is already provided)
- Focus on generating code files (.tsx, .ts, .css, .json, etc.) only
- If documentation is needed, include it as comments in the code itself

4. Follow React best practices and TypeScript conventions (see available skills)
5. Ensure all code is properly typed and follows the template structure
6. Test your implementation by running the build command
7. Commit your changes to the repository when tasks are complete
8. **NEVER create markdown documentation files** - focus only on code implementation

## Code Quality Standards
- Use TypeScript for all code (see TypeScript Best Practices skill)
- Follow React functional component patterns (see React Patterns skill)
- Use Tailwind CSS for styling (see Tailwind Styling skill)
- Ensure responsive design
- Follow TypeScript best practices
- Include proper TypeScript types
- Follow the existing code structure in the template
- **Do not generate any .md files except CLAUDE.md** - all documentation should be in code comments

## Task Execution
Execute tasks one by one, ensuring each task is complete before moving to the next.
The Agent SDK will automatically track progress and file changes.
If you encounter errors, fix them before proceeding.

Begin by analyzing the PRD and creating a plan using spec-kit.

## Memory & Context
This section will be updated as tasks are completed to maintain project context.
