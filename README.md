# 👾 PixelEvent

React + Vite + Tailwind + Framer Motion client · Express + Zod API · MongoDB Atlas (`events`, `registrations`).

## Run
```bash
npm run install:all
cp server/.env.example server/.env     # add your Atlas URI
npm run dev:server                      # :4000
npm run dev:client                      # :5173 (proxies /api)
```
Production: `npm run build && npm start` (Express serves `client/dist`).

## Access model
| Link | Who | Can do |
|---|---|---|
| `/events/:slug` | anyone | view details, submit RSVP (`GET /api/events/:slug`, `POST …/registrations`) |
| `/host/:slug#token=…` | creator only | edit, delete, view/export/remove guests (`/api/host/*`, header `x-host-token`) |

The host token is random (192-bit), shown once in the URL fragment, saved in the creator's browser, and stored server-side only as a SHA-256 hash. Public responses never include the token or guest list.
