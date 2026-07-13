# Copilot / AI Assistant Instructions

## Hard constraints — do not violate

- **Client-side only.** This app is a static site hosted on GitHub Pages. Never add a
  server, API route, SSR/SSG framework, or anything that assumes a Node.js runtime at
  request time.
- **No Next.js**, and no other meta-framework that introduces server components or
  file-system server routing.
- **No TypeScript.** Plain JavaScript + JSX only (`.jsx` files, no `.ts`/`.tsx`).
- **Plain React only.** Functional components and hooks — no class components.

## Stack

- **Build tool:** [Vite](https://vite.dev/) (`react` template, created via
  `npm create vite@latest`).
- **UI library:** [`react-bootstrap`](https://react-bootstrap.github.io/) +
  `bootstrap` CSS (imported once in `src/main.jsx`). Use `react-bootstrap` components
  (`Container`, `Navbar`, `Nav`, `Button`, etc.) instead of hand-rolled Bootstrap
  markup or raw `class="..."` strings.
- **Routing:** [`react-router-dom`](https://reactrouter.com/) in **declarative mode**
  only:
  - Use `<HashRouter>`, `<Routes>`, `<Route>`, `<Link>`, `<NavLink>`.
  - Do **not** use the data-router API (`createBrowserRouter`, `createHashRouter`,
    loaders, actions, `<RouterProvider>`). This project intentionally sticks to the
    plain component-based routing style.
  - `HashRouter` (not `BrowserRouter`) is used deliberately: GitHub Pages serves static
    files with no server-side rewrites, so a hard refresh or shared link to a nested
    route (e.g. `/about`) would 404 under `BrowserRouter`. Hash-based URLs
    (`/#/about`) avoid that without needing a custom 404.html redirect trick.

## Project structure

- `src/main.jsx` — entry point; imports Bootstrap CSS and mounts `<App />`.
- `src/App.jsx` — sets up `<HashRouter>` and the route table.
- `src/components/` — shared UI, e.g. `NavBar.jsx`.
- `src/pages/` — one component per route (`Home.jsx`, `About.jsx`).

## Deployment

- Deploy is automated via `.github/workflows/deploy.yml`: on every push to `main`, it
  runs `npm ci && npm run build` and publishes the `dist/` output to GitHub Pages
  using `actions/upload-pages-artifact` + `actions/deploy-pages`.
- **One-time manual setup required in the GitHub repo settings:** under
  Settings → Pages, set "Source" to **GitHub Actions** (this cannot be done from
  code/CI).
- `vite.config.js`'s `base` option is set to `/react-pages-app/`. If the GitHub repo
  is ever renamed, update `base` to match the new repo name exactly, or built asset
  paths (JS/CSS) will 404 on Pages.

## When adding new pages

1. Add a component under `src/pages/`.
2. Add a `<Route path="..." element={<NewPage />} />` inside `src/App.jsx`.
3. Add a corresponding `<Nav.Link as={NavLink} to="...">` in
   `src/components/NavBar.jsx` if it should appear in the nav bar.
