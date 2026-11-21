# Uptime Monitoring API

A small uptime monitor written on plain Node.js, without Express or a database. Users sign up, log in for a token, and register URLs to watch. A background worker requests each URL every minute and sends an SMS through Twilio when a check goes from up to down, or back.

I wrote it without a framework on purpose. I wanted to see what Express and an ORM do for you: routing, body parsing, validation and persistence are all handwritten here.

## Pieces

```
index.js            starts the HTTP server and the worker
lib/server.js       http.createServer, one handler for everything
helper/handleReqRes parses URL, query, headers and body, then dispatches to a route
routes.js           user, token, check
handler/            route handlers with manual validation
lib/data.js         JSON files under .data/ as the "database" (create, read, update, delete, list)
lib/worker.js       every 60 s: load each check, request it, compare state, alert on change
helper/notification Twilio SMS
```

## API

| Route | Methods | Notes |
|---|---|---|
| `/user` | POST, GET, PUT, DELETE | identified by phone number. GET/PUT/DELETE need a token |
| `/token` | POST, GET, PUT, DELETE | tokens are valid for one hour, PUT with `extend: true` renews |
| `/check` | POST, GET, PUT, DELETE | `protocol`, `url`, `method`, `success_codes`, `timeout_seconds`. Up to 5 per user |

Authenticated requests send the token in a `token` header.

## Running it

```bash
npm install
npm run dev     # staging config, port 3000
```

Optional environment variables: `HASH_KEY` (password hashing), and `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE` for SMS alerts. Without the Twilio values the monitor still runs and logs that the alert could not be sent.

## Limitations

- File storage is fine for learning, not for more than one process.
- Passwords are hashed with HMAC-SHA256 and a single key. A real service should use bcrypt or argon2.
