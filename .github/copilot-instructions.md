# NodeBB AI Agent Guide
## Architecture & Flow
- **Core boot**: `app.js` → `src/start.js` loads config via `nconf`, initialises the database (`src/database/index.js`) and meta cache before bringing up the Express server and Socket.IO.
- **Server stack**: `src/webserver.js` wires Express middleware (compression, sessions, helmet), registers controllers, then emits `event:nodebb.ready` once plugins, privileges, analytics, and flags have initialised.
- **Routing hub**: `src/routes/index.js` composes routers, lets plugins remount paths via `filter:router.add`, and serves compiled assets from `build/public`; follow its `setupPageRoute` usage when adding pages.
- **Real-time layer**: `src/socket.io/index.js` binds Socket.IO with session cookies, AsyncLocalStorage (`src/als.js`), CSRF checks, and plugin hook events (`action:sockets.*`).
- **Background jobs**: `src/start.js` conditionally starts cron-like jobs in notifications, users, plugins, topics, and ActivityPub when `runJobs` is true.
## Server Modules & Patterns
- **Domain modules**: Features live under `src/<domain>/index.js` (e.g. `src/topics/index.js`) that aggregate helpers from sibling files; read these entrypoints to understand lifecycle and plugin hook usage such as `filter:topics.get`.
- **Meta services**: `src/meta/index.js` composes config, themes, logs, templates, and more, then applies `require('../promisify')(Meta)` so functions accept both callbacks and promises—preserve that dual interface.
- **Middleware helpers**: Use `src/middleware/helpers.js:helpers.try` to wrap async handlers so Express error flow stays intact; avoid bypassing it in new middleware.
- **Request context**: Request-scoped data is stored with AsyncLocalStorage (`src/als.js`) and populated in `src/webserver.js` and `src/socket.io/index.js`; access `require('./als').getStore()` instead of global state.
- **Logging**: `src/meta/logs.js` guarantees `logs/output.log` exists; CLI commands (`./nodebb log`) stream from the same file—keep server logging pointed there.
## Data & Persistence
- **Datastores**: `src/database` implements adapters for Redis, MongoDB, and Postgres; always route queries through the exported API (`primaryDB`) so alternative backends stay compatible.
- **Config**: Runtime configuration comes from `config.json` via `nconf`; prefer `nconf.get()` over hard-coded env vars and gate new flags behind `config.json` keys.
- **Sessions**: Session storage defaults to the primary DB but can be overridden via `session_store`/`redis` settings; rely on `primaryDB.sessionStore*` helpers instead of touching adapters directly.
- **Caching**: `src/cache` offers LRU helpers; core middleware uses `cacheCreate` for rate-limiting and throttling—reuse these utilities for consistent eviction behaviour.
- **Enums & constants**: Centralised in `src/constants.js`; check there before adding duplicate magic strings or paths.
## Frontend & Assets
- **Client source**: Edit files in `public/src` and SCSS under `public/scss`; `build/public` holds generated artefacts consumed by webpack—never modify the build output directly.
- **Templating**: Benchpress `.tpl` files live in `src/views`; `src/meta/templates` compiles them and caches results, so invalidate via plugin hooks (`benchpressjs.flush()`) when adding template compilation steps.
- **Webpack pipeline**: `webpack.common.js` loads active plugins from `build/active_plugins.json` to assemble the bundle; remember to refresh that list (via `./nodebb build`) when introducing plugin assets.
- **Client bootstrap**: `public/src/app.js` registers widgets, AJAXify, and sockets; hook client-side features through its module loader to respect plugin overrides.
- **Styles & skins**: Theme assets flow through `src/meta/build` and `middleware.buildSkinAsset`; when touching CSS, ensure both ltr/rtl variants are generated.
## Developer Workflows
- **Install & upgrade**: Run `./nodebb setup` to generate `config.json` and install deps; `./nodebb upgrade` syncs plugins and runs schema updates (`src/cli/manage.js`).
- **Build assets**: Use `./nodebb build` for a one-off webpack/Benchpress build; during development, run `npx grunt` to watch SCSS, JS, templates, and auto-restart the app with livereload (`Gruntfile.js`).
- **Server control**: `./nodebb start|stop|restart|status|log` wrap the process manager in `src/cli/running.js`; prefer these over invoking `node app.js` directly so clustering hooks fire.
- **Testing**: `npm test` runs the Mocha suite under `test/`, which stubs the database via `test/mocks`—follow existing fixtures when adding coverage; `npm run lint` enforces `eslint.config.mjs`.
- **Diagnostics**: Look at `logs/output.log` or `./nodebb log` for runtime errors, and use `./nodebb slog` when you need interleaved build output plus live logs.
## Conventions & Gotchas
- **Hook discipline**: Keep existing hook names and priorities stable; warn via `Plugins.hooks._deprecated` (`src/plugins/index.js`) if you must change behaviour.
- **Async patterns**: Many APIs accept callbacks and promises; when extending modules, wrap new async functions with `promisify` helpers to preserve both call styles.
- **Error handling**: Return translated error keys like `[[error:invalid-files]]` (see `src/middleware/index.js`) so the i18n layer can localise responses.
- **Access control**: Enforce permissions through `src/privileges` instead of ad-hoc checks; use `privileges.global.can` or `privileges.topics.filterTids` for resource gating.
- **ActivityPub & sockets**: Features under `src/activitypub` and `src/socket.io` rely on consistent UID/session data; ensure new real-time handlers validate sessions with `authorize`/`validateSession` helpers before emitting.
