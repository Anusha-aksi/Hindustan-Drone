# frontend123 (CRM Admin) — Event Form Validation

For general architecture (stack, routing, state management, API layer, etc.), see
`CLAUDE.md` in this same folder. This document covers only the validation added to
the admin **New/Edit Event** form (`src/features/events/EventModal.tsx`).

## Quick reference

| Field | Rule | Error message |
|---|---|---|
| Title | required, 5–255 chars, letters/digits/spaces only (no special characters) | `Required` / `Minimum 5 characters` / `Maximum 255 characters` / `No special characters allowed — letters and numbers only` |
| Description | optional, ≤200 chars, live `n/200` counter in the hint text | `Maximum 200 characters` |
| Event Page Content | required, 30–100 words, ≤1000 chars (HTML stripped), live counter under the editor | `Content is required` / `Content must be at least 30 words (currently N)` / `Content must be at most 100 words (currently N)` / `Content must be at most 1000 characters (currently N)` |
| Category, Event Date, Location | required (pre-existing, unchanged) | `Please select a category` / `Required` |

## Why Content needs its own validation path

Title, Description, Category, Event Date, and Location are all registered with
`react-hook-form` (`useForm<FormValues>({ mode: 'onChange' })`), so `formState.isValid`
covers them automatically and the Save/Create button's `disabled={!isValid || ...}`
picks up any failure for free.

**Content is not part of that form.** It's rich text from a Tiptap editor held in a
plain `useState` (`const [content, setContent] = useState(...)`) because the editor
is uncontrolled by react-hook-form design. That means:

- `getContentError(html)` (defined near the top of `EventModal.tsx`) is computed on
  every render from the current `content` state and returns either an error string
  or `null`.
- The Save/Create button's `disabled` condition explicitly includes
  `|| !!contentError` — `isValid` alone would never catch a bad Content value.
- `submitForm` (the shared `handleSubmit` wrapper used by both the header button and
  the `<form onSubmit>`) checks `contentError` first and shows a toast + bails out
  before calling `mutation.mutate()`, as a defensive second guard in case the button
  is ever reachable while still invalid.

If you add another field that lives outside `register()`/`useForm`, follow this same
pattern — don't assume `isValid` covers it.

## Consequence: Content is now effectively mandatory

A brand-new event starts with `content: ''`, which fails the 30-word minimum
immediately. This means an admin can no longer save an event without writing real
page content — including when editing an **older** event that predates this rule,
until enough content is added to satisfy it. This was an intentional decision, not
a bug: Content used to have no validation, and description text used to say "Design
the event page freely" implying it was optional.

## Backend check: `start_date` vs `event_date`

This form's `FormValues.event_date` is sent to the backend as `event_date` (see the
`mutationFn` in `EventModal.tsx`), **not** `start_date`. The OEM supplier frontend's
event form (a different app — `Frontend-hindustan`) sends `start_date` instead, for
the same `POST /events` endpoint.

`Backend-hindustan/src/events/events.controller.ts` accepts **either** field name
being present. If the backend's required-date check is ever narrowed to only accept
`start_date`, every event created from this CRM admin app will fail with `Start
date & time is required` even when a date is clearly selected — this exact bug
happened once already. See `Backend-hindustan/README.md` for the full explanation.

## Where this lives

Everything described above is in one file: `src/features/events/EventModal.tsx`.
- `countWords` / `getContentError` — top of the file, above the component
- `contentError` — computed inside `EventModal`, right after the `content` state
- `submitForm` — wraps `handleSubmit`, guards on `contentError`
- Title/Description field rules — inline in the `register(...)` calls in the JSX
