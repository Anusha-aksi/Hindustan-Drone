# CRM Frontend — CLAUDE.md

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v6 |
| Server state | TanStack Query v5 (`@tanstack/react-query`) |
| Client state | Zustand v4 (`zustand/middleware` → `persist`) |
| Forms | React Hook Form v7 |
| HTTP | Axios (singleton in `services/api.ts`) |
| Styling | Tailwind CSS v3 + custom design tokens |
| Icons | Lucide React |
| Path alias | `@/` → `src/` (configured in `vite.config.ts`) |

## Running the frontend

```bash
cd frontend
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

Vite proxies `/api` and `/uploads` to `http://localhost:3001` in development.

## Environment variables (`.env`)

```
VITE_API_BASE_URL=http://localhost:3001/api
```

All env values are read from `src/config/env.ts`:
```ts
export const env = { apiBaseUrl: import.meta.env.VITE_API_BASE_URL }
```

Never read `import.meta.env` directly in components — always import `env` from `@/config/env`.

## Project structure

```
src/
├── main.tsx                  # Entry — QueryClient, BrowserRouter, ToastProvider
├── App.tsx                   # Route definitions (all routes declared here)
├── index.css                 # Tailwind directives + global component classes
│
├── config/
│   └── env.ts                # Typed env access
│
├── types/
│   ├── index.ts              # User, LoginResponse, MfaMethod, etc.
│   ├── product.types.ts      # Product, ProductImage, CreateProductPayload
│   ├── category.types.ts     # Category (with optional children[])
│   └── supplier.types.ts     # Supplier
│
├── utils/
│   ├── routes.ts             # ROUTES const — all app paths (single source of truth)
│   ├── constants.ts          # SUPPLIER_STATUS, CATEGORY_LEVELS, PAGINATION
│   ├── strings.ts            # APP_NAME and other UI copy
│   └── helpers.ts            # Shared pure utilities
│
├── store/
│   └── index.ts              # useAuthStore + useUIStore (Zustand)
│
├── hooks/
│   ├── useActivityTracker.ts # Debounced DOM activity → POST /auth/session/activity
│   ├── useAuth.ts            # Auth helper hook
│   └── useLike.ts            # Like/unlike product hook
│
├── contexts/
│   └── ToastContext.tsx      # Global toast context (alternative to local state)
│
├── services/
│   ├── api.ts                # Axios instance, interceptors, get/post/patch/del helpers
│   ├── sessionManager.ts     # Singleton session expiry manager (triggerExpiry / isExpired)
│   ├── productService.ts
│   ├── categoryService.ts
│   ├── formTemplateService.ts
│   ├── supplierService.ts
│   ├── adminService.ts
│   ├── userService.ts
│   ├── articlesService.ts
│   ├── caseStudiesService.ts
│   ├── webinarService.ts
│   ├── webinarRegistrationService.ts
│   ├── videoService.ts
│   ├── advertisementService.ts
│   └── reactionService.ts
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx          # ProtectedLayout, AppLayout (mounts useActivityTracker)
│   │   ├── Sidebar.tsx         # Role-based nav, CatalogueNav, NAV_ITEMS
│   │   ├── Header.tsx          # Top bar, pending count badges, user menu
│   │   └── AuthSplitLayout.tsx # Two-column layout for login/auth pages
│   │
│   ├── ui/                    # Reusable design-system components
│   │   ├── Button.tsx          # <Button variant loading>
│   │   ├── Input.tsx           # <Input>, <Select>, <Textarea> (RHF-compatible, forwardRef)
│   │   ├── Modal.tsx           # <Modal open onClose title size>
│   │   ├── Toast.tsx           # <Toast type title message onClose> + ToastData type
│   │   ├── ConfirmDeleteModal.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── OtpInput.tsx
│   │   ├── LikeButton.tsx
│   │   └── CategoryProductPicker.tsx
│   │
│   └── products/
│       ├── ProductFormModal.tsx      # Shared add/edit product form
│       ├── ProductDetailDrawer.tsx   # Full-page product detail view
│       ├── CategoryPicker.tsx        # Leaf-only single-select dropdown
│       ├── TemplateFieldInput.tsx    # Dynamic field renderer (all 8 types)
│       ├── ManageTemplatePanel.tsx   # Inline template field manager (admin only)
│       ├── RejectModal.tsx
│       └── StatusBadge.tsx
│
├── features/                 # Domain feature bundles (logic + UI co-located)
│   ├── supplier-management/
│   │   ├── SupplierTable.tsx
│   │   ├── ApprovalActionModal.tsx
│   │   ├── EditSupplierModal.tsx
│   │   ├── SupplierDetailModal.tsx
│   │   └── useSupplierManagement.ts   # All supplier queries + mutations
│   ├── supplier-registration/
│   │   ├── SupplierRegisterForm.tsx
│   │   └── useSupplierRegister.ts
│   ├── advertisements/
│   ├── webinars/
│   └── videos/
│
└── pages/
    ├── Login.tsx
    ├── SetPassword.tsx
    ├── ForgotPasswordPage.tsx
    ├── SessionExpiredPage.tsx
    ├── SupplierRegisterPage.tsx
    ├── Dashboard.tsx
    ├── ProfilePage.tsx
    ├── Settings.tsx
    ├── Reports.tsx
    ├── mfa/
    │   ├── MfaVerifyPage.tsx
    │   ├── MfaSetupPage.tsx
    │   └── MfaEnrollPage.tsx
    └── admin/
        ├── SuppliersPage.tsx
        ├── ProductsPage.tsx        # Handles both admin + supplier views
        ├── ProductFieldsPage.tsx   # Admin: configure per-category template fields
        ├── CategoriesPage.tsx
        ├── AdminsPage.tsx
        ├── UsersPage.tsx
        ├── ArticlesPage.tsx
        ├── CaseStudiesPage.tsx
        ├── WebinarsPage.tsx
        ├── AdvertisementsPage.tsx
        └── VideosPage.tsx
```

## Routing

All routes live in `App.tsx`. Always use the `ROUTES` constant from `@/utils/routes` — never hardcode path strings.

```ts
// utils/routes.ts
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_FIELDS: '/admin/product-fields',
  // ...
} as const;
```

### Route structure

```tsx
<Routes>
  {/* Public */}
  <Route path={ROUTES.LOGIN}             element={<LoginPage />} />
  <Route path={ROUTES.SUPPLIER_REGISTER} element={<SupplierRegisterPage />} />
  {/* ... */}

  {/* Protected (requires auth) */}
  <Route element={<ProtectedLayout />}>
    <Route path={ROUTES.DASHBOARD}           element={<DashboardPage />} />
    <Route path={ROUTES.ADMIN_PRODUCTS}      element={<ProductsPage />} />
    <Route path={ROUTES.ADMIN_PRODUCT_FIELDS} element={<ProductFieldsPage />} />
    {/* ... */}
  </Route>
</Routes>
```

`ProtectedLayout` redirects to `/login` if `useAuthStore().user` is null.

## State management (Zustand)

Two stores in `src/store/index.ts`:

### `useAuthStore`
```ts
{
  user: User | null
  isAuthenticated: boolean
  tempToken: string | null          // MFA / first-login temp token
  pendingMfaMethods: {...} | null
  setUser(user)                     // called after successful login
  setTempToken(token)
  clearAuth()                       // called on logout / session expiry
}
```

Persisted to `localStorage` key `crm-auth` (only `user` + `isAuthenticated`).

**Important:** Access store outside React with `useAuthStore.getState()` — used by `sessionManager.ts` to clear auth state on expiry.

### `useUIStore`
```ts
{ sidebarCollapsed: boolean; toggleSidebar(): void }
```
Not persisted — resets on page refresh.

## API layer (`services/api.ts`)

Single Axios instance with:
- `baseURL` from `env.apiBaseUrl`
- `withCredentials: true` — sends the `access_token` cookie automatically
- **Request interceptor**: aborts the request immediately if `sessionManager.isExpired` is true — prevents any outbound call after session expiry
- **Response interceptor**:
  - Unwraps `{ success, data }` envelope → callers receive `data` directly
  - On `401` from a protected route: attempts token refresh (via `POST /auth/refresh-token`) then retries once; if refresh also fails, calls `sessionManager.triggerExpiry()`
  - `NO_REFRESH_PATHS` list gates which `/auth/` routes skip the refresh attempt (login, register, MFA, password flows, logout, and the refresh endpoint itself) — the activity endpoint is intentionally excluded so an expired access token there goes through normal refresh-and-retry

```ts
// Helper shortcuts (all return the unwrapped data, not AxiosResponse)
export const get   = <T>(url, config?) => api.get<T>(url, config).then(r => r.data)
export const post  = <T>(url, data?, config?) => api.post<T>(url, data, config).then(r => r.data)
export const patch = <T>(url, data?, config?) => api.patch<T>(url, data, config).then(r => r.data)
export const del   = <T>(url, config?) => api.delete<T>(url, config).then(r => r.data)
```

Always import `{ get, post, patch, del }` from `@/services/api` in service files — do not call `axios` directly.

## TanStack Query patterns

Default `staleTime` is `30_000` ms (30 s) — set globally in `main.tsx`.

### Query keys
Use arrays that go from general → specific:
```ts
const PRODUCTS_KEY   = ['products']
const SUPPLIERS_KEY  = ['suppliers']
['form-template', categoryId]      // template for one category
['product-fields', categoryId]     // admin template fields (includeAll)
['categories', 'tree']             // full tree
```

### Standard mutation pattern
```tsx
const mutation = useMutation({
  mutationFn: (payload) => myService.doThing(payload),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: THING_KEY })
    notify({ type: 'success', title: 'Done', message: 'It worked.' })
  },
  onError: (e: any) => {
    notify({ type: 'error', title: 'Error', message: e?.response?.data?.message ?? 'Failed.' })
  },
})
```

### Polling
Use `refetchInterval` + `enabled` flag to stop polling when the data isn't needed:
```ts
refetchInterval: enabled ? 30_000 : false,
refetchIntervalInBackground: false,
```

There is no need to gate polling on session state — the Axios interceptor handles 401s centrally.

## Tailwind design system

### Brand colour palette (`tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#d72323` | Buttons, links, accents |
| `brand-primary-hover` | `#b81c1c` | Button hover |
| `brand-primary-light` | `#f9e5e5` | Subtle backgrounds |
| `brand-primary-muted` | `#fdf2f2` | Page background |
| `brand-primary-border` | `#f5c6c6` | Borders, dividers |
| `brand-white` | `#ffffff` | Card/modal backgrounds |
| `brand-text-main` | `#1a0000` | Primary text |
| `brand-text-sub` | `#7a1111` | Secondary text |
| `brand-text-faint` | `#c07070` | Placeholder / hint text |

### Global component classes (`index.css`)

| Class | Description |
|-------|-------------|
| `btn-primary` | Red filled button |
| `btn-secondary` | White outlined button |
| `btn-ghost` | Ghost button |
| `input-base` | Standard form input/textarea |
| `input-error` | Error state border |
| `card` | White card with border + shadow |
| `nav-link` | Sidebar nav item |
| `nav-link-active` | Active sidebar item |
| `table-header` | Red `<th>` cell |
| `table-row` | Hover `<tr>` row |

Always use these classes before writing inline Tailwind for common elements.

## Reusable UI components

### `<Button>`
```tsx
<Button variant="primary|secondary|ghost" size="sm|md|lg" loading={bool}>
  Label
</Button>
```
Handles `disabled` + spinner via `loading` prop.

### `<Input>` / `<Textarea>` / `<Select>`
All are `forwardRef` — wire directly to React Hook Form with `{...register('field')}`.
```tsx
<Input label="Name *" {...register('name', { required: 'Required' })} error={errors.name?.message} />
```

### `<Modal>`
```tsx
<Modal open={bool} onClose={fn} title="Title" size="sm|md|lg|xl">
  {children}
</Modal>
```
Closes on Escape and backdrop click.

### `<Toast>` + `ToastData`
```tsx
const [toast, setToast] = useState<ToastData | null>(null)
const notify = (d: ToastData) => { setToast(d); setTimeout(() => setToast(null), 3500) }

// In JSX:
{toast && <Toast {...toast} onClose={() => setToast(null)} />}
```
Type: `{ type: 'success' | 'error'; title: string; message: ReactNode }`.  
Appears centered at the top of the viewport, auto-dismisses after 3.5 s.

### `<ConfirmDeleteModal>`
```tsx
<ConfirmDeleteModal
  title="Delete Supplier"
  itemName={target.name}
  loading={deleteMutation.isPending}
  onConfirm={() => deleteMutation.mutate(target._id)}
  onClose={() => setDeleteTarget(null)}
/>
```

## Session management

Three pieces work together. Do not add session-expiry logic to individual pages or components — everything runs through this centralised stack.

### 1. Activity tracker (`useActivityTracker`)

Mounted once in `AppLayout` via `useActivityTracker(!!user)`.

- Listens to `mousedown`, `mousemove`, `keypress`, `scroll`, `click`
- After 1 s of debounce silence, fires `POST /auth/session/activity` (via the Axios `post` helper so the response interceptor handles any 401)
- Cleans up all listeners on unmount or when `active` becomes false
- Guards against firing after `sessionManager.isExpired` is set

The backend (`JwtAuthGuard`) checks `last_activity` on every protected request; `POST /auth/session/activity` resets that timestamp. Default idle window is 30 min (env: `SESSION_IDLE_TIMEOUT_MINUTES`).

### 2. Session manager (`services/sessionManager.ts`)

Singleton `sessionManager` — the single point of truth for whether the session is dead.

```ts
sessionManager.isExpired    // true once triggerExpiry() has been called
sessionManager.triggerExpiry()  // idempotent; fires once per page load
sessionManager.reset()          // call after a successful login
```

`triggerExpiry()` does three things atomically:
1. Sets the `isExpired` flag (blocks all further Axios requests via the request interceptor)
2. Calls `clearAuth()` and removes `crm-auth` from `localStorage`
3. Calls `window.location.replace('/session-expired')` — hard navigation clears all in-memory React/Zustand state and cancels in-flight requests via browser page-unload

### 3. Global 401 interceptor (`api.ts`)

Any `401` on a protected route calls `sessionManager.triggerExpiry()` (after a single refresh attempt where applicable). The `isExpired` flag ensures this fires only once even if multiple concurrent requests get 401 at the same time.

### Session expired page (`pages/SessionExpiredPage.tsx`)

Public route at `/session-expired`. Shown after `window.location.replace` fires.

- "Go to Login" button calls `sessionManager.reset()` then `navigate(ROUTES.LOGIN, { replace: true })`
- `replace` semantics mean the browser Back button cannot return to the expired session page
- `ProtectedLayout` independently guards all protected routes (`user === null` → redirect to `/login` with `replace`), so browser history cannot expose protected content after expiry

**For logout**, use plain `fetch()` for the `POST /auth/logout` API call (not Axios) to avoid the 401 interceptor loop, then call `clearAuth()` and `navigate(ROUTES.LOGIN, { replace: true })`.

## Role-based access

User roles: `super_admin` | `admin` | `supplier` | `user`

```ts
const { user } = useAuthStore()
const isAdmin    = user?.role === 'super_admin' || user?.role === 'admin'
const isSupplier = user?.role === 'supplier'
```

### Sidebar visibility (per role)

| Role | Items shown |
|------|------------|
| `super_admin` | Dashboard, Manage Suppliers, Manage Admins, Manage Users, all content pages, **Catalogue ▸ Categories / Products / Product Fields** |
| `admin` | Same as super_admin except Manage Admins |
| `supplier` | Dashboard, **My Products** |
| `user` | Dashboard |

`CatalogueNav` (Categories, Products, Product Fields) renders only inside `{isAdmin && <CatalogueNav />}`.  
Supplier's "My Products" is a regular `NAV_ITEMS` entry with `roles: ['supplier']`.

## Product & template field flow

### Admin side — configure fields
`ProductFieldsPage` → cascading category selector (root → leaf) → calls `formTemplateService.getByCategory(id, includeAll=true)` → CRUD on fields via `formTemplateService.addField / updateField / removeField`.

### Supplier / admin side — fill fields
`ProductsPage` → `ProductFormModal` → `CategoryPicker` (leaf categories only) → on category change fetches `formTemplateService.getByCategory(id)` (active fields only) → renders each field via `TemplateFieldInput`.

### `TemplateFieldInput` — supported types

| type | Rendered as |
|------|-------------|
| `text` | `<input type="text">` |
| `number` | `<input type="number">` with min/max |
| `textarea` | `<textarea>` |
| `date` | `<input type="date">` |
| `dropdown` | `<select>` with options |
| `checkbox` | Toggle checkbox, stores `'true'`/`'false'` |
| `radio` | Radio group |
| `file` | File picker; stores `JSON.stringify({ name, url: 'data:...' })` as base64 |

Values are stored in `templateValues: Record<string, string>` in `ProductsPage`, keyed by `field.field_name`. Submitted as part of `dynamic_data` in the product payload.

**When editing a product**, `openEdit()` pre-populates `templateValues` from `product.dynamic_data` so previously saved values are shown.

### `CategoryPicker`
Shows only **leaf categories** (categories whose `_id` does not appear as anyone's `parent_id`). Displays full breadcrumb path: `Electronics › Laptops › Gaming`.

## Forms with React Hook Form

Always use `mode: 'onChange'` when the submit button must stay disabled until the form is valid:
```tsx
const form = useForm<MyForm>({ mode: 'onChange' })
const { isValid } = form.formState
```

After `reset()` on a pre-filled edit form, call `trigger()` immediately so `isValid` reflects the loaded values:
```tsx
useEffect(() => {
  if (target) { reset({ ...values }); trigger() }
}, [target])
```

## Adding a new page/feature

1. Create the page in `src/pages/` or `src/features/<domain>/`
2. Add the route path to `src/utils/routes.ts`
3. Add a `<Route>` in `src/App.tsx` (inside `<ProtectedLayout>` if auth required)
4. Add the nav link in `src/components/layout/Sidebar.tsx`:
   - For admin-only: add to `CatalogueNav.SUB_ITEMS` or `NAV_ITEMS` with `roles: ['super_admin', 'admin']`
   - For supplier: add to `NAV_ITEMS` with `roles: ['supplier']`
5. Create a service in `src/services/` using the `get / post / patch / del` helpers
6. Use TanStack Query (`useQuery` / `useMutation`) for all server state
7. Use `<Toast>` + local `notify` helper for success/error feedback
8. Use `<ConfirmDeleteModal>` for all destructive delete actions

## Adding a new service

```ts
// src/services/thingService.ts
import { get, post, patch, del } from './api'

const BASE = '/things'

export const thingService = {
  getAll:  ()               => get<Thing[]>(BASE),
  getOne:  (id: string)     => get<Thing>(`${BASE}/${id}`),
  create:  (dto: CreateDto) => post<Thing>(BASE, dto),
  update:  (id: string, dto: Partial<CreateDto>) => patch<Thing>(`${BASE}/${id}`, dto),
  remove:  (id: string)     => del<{ message: string }>(`${BASE}/${id}`),
}
```
