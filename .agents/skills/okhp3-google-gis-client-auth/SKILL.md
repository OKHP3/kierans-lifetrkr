---
name: okhp3-google-gis-client-auth
description: >
  OverKill Hill P³ client-only Google OAuth skill using the Google Identity Services
  (GIS) implicit token model — no server, no Client Secret, no redirect URI, no backend.
  Use when adding Google Sign-In, Google Calendar read access, or Google Tasks read
  access to a static site deployed on GitHub Pages, Netlify, Cloudflare Pages, or any
  CDN host. Also activate when a developer asks how to call Google APIs from a React
  SPA without a backend, how to avoid needing a Client Secret, or how to handle
  token expiry and silent re-auth in a client-only app. This is the authoritative
  Google OAuth skill for this repo — use it even when the user doesn't mention GIS
  or the token model by name.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  compatibility: >
    React 18+ with TypeScript. Requires the google.accounts.oauth2 global, loaded
    via the GIS CDN script in index.html. Designed for static hosting — GitHub Pages,
    Netlify, Cloudflare Pages, etc. Works with any Google API that accepts Bearer tokens.
  in_scope:
    - GIS implicit token model setup and GCP Console configuration
    - useGoogleAuth React hook (token request, sessionStorage, expiry, silent re-auth)
    - Google Calendar API and Tasks API read access patterns
    - Token expiry UI pattern (reconnect banner)
    - Common OAuth scopes reference table
    - GCP Console setup checklist
  out_of_scope:
    - Authorization code flow (requires a backend server and Client Secret)
    - Refresh tokens / offline access
    - Service account authentication (no user involved)
    - Write operations — creating, editing, or deleting calendar events or tasks
    - Non-Google OAuth providers (GitHub, Facebook, etc.)
    - Multi-tenant server apps
---

# okhp3-google-gis-client-auth

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3) · [OKHP3/skillz](https://github.com/OKHP3/skillz)

Client-only Google OAuth for single-page applications. Eliminates the need for a
backend server, redirect callback route, Client Secret, or session management. The
GIS implicit token model flows entirely through a browser popup — the access token
lands directly in your JavaScript callback, ready to use. Tokens live in
`sessionStorage` and expire after ~1 hour; the hook handles silent re-auth automatically.

---

## Scope

| In scope | Out of scope |
|---|---|
| GIS implicit token model (popup-based, no redirect) | Authorization code flow (requires backend) |
| `useGoogleAuth` React hook with full token lifecycle | Refresh tokens / offline access |
| Google Calendar API read access | Write operations (create/edit/delete) |
| Google Tasks API read access | Service account authentication |
| Silent re-auth + expiry UI pattern | Non-Google OAuth providers |
| GCP Console setup checklist | Multi-tenant server apps |

---

## Why this matters — the model most tutorials get wrong

Most Google OAuth tutorials describe the **authorization code flow**: the user is
redirected to Google, Google redirects back to your callback URL, and a server
exchanges the auth code for tokens using a Client Secret. **This requires a backend.**

The GIS **implicit token model** works differently:

1. A popup opens directly in the browser — no page navigation
2. The user consents
3. Google returns the access token directly to your JavaScript callback
4. No redirect. No server. No Client Secret.

The Client ID is intentionally public — it identifies your app to Google but contains
no secret material. Embedding it in client-side JavaScript is **correct and expected**.

> **Critical GCP distinction:** Authorized **JavaScript Origins** only — do NOT add
> redirect URIs. The token model does not use redirect URIs. Adding them causes confusion
> and is not required.

---

## What you need

**In GCP Console:**
- OAuth 2.0 Client ID — type: **Web Application**
- Authorized **JavaScript Origins** (NOT redirect URIs):
  ```
  https://your-deployed-domain.com
  http://localhost:5173
  ```
- Required APIs enabled (Calendar API, Tasks API, etc.)

**In your app:**
- GIS CDN script in `index.html`
- Client ID in constants (public value — safe to embed)
- Scopes matching your API usage

---

## Setup

### 1. Add GIS script to index.html

```html
<head>
  <!-- Google Identity Services — load before your app bundle -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
```

### 2. Store the Client ID and define scopes

```typescript
// src/constants.ts
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
  'openid',
  'profile',
  'email',
].join(' ');
```

The Client ID goes in a `VITE_GOOGLE_CLIENT_ID` environment variable (or `.env` file).
It is **not a secret** — the `VITE_` prefix means it is intentionally embedded in the
client bundle.

### 3. The useGoogleAuth hook

```typescript
// src/hooks/useGoogleAuth.ts
import { useState, useCallback } from 'react';
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../constants';

declare global {
  interface Window { google: any; }
}

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(
    () => sessionStorage.getItem('g_token')
  );
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(
    () => Number(sessionStorage.getItem('g_expiry')) || null
  );

  // Valid = token exists AND at least 2 minutes remain before expiry
  const isTokenValid = useCallback((): boolean => {
    if (!accessToken || !tokenExpiry) return false;
    return Date.now() < tokenExpiry - 120_000;
  }, [accessToken, tokenExpiry]);

  // Request a token — set silent=true to skip the consent UI if already granted
  const requestToken = useCallback((silent = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('GIS library not loaded — check index.html script tag'));
        return;
      }
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        prompt: silent ? 'none' : '',
        callback: (resp: any) => {
          if (resp.error) { reject(new Error(resp.error)); return; }
          const expiry = Date.now() + resp.expires_in * 1000;
          // sessionStorage clears on tab close — intentional; safer than localStorage
          sessionStorage.setItem('g_token', resp.access_token);
          sessionStorage.setItem('g_expiry', String(expiry));
          setAccessToken(resp.access_token);
          setTokenExpiry(expiry);
          resolve(resp.access_token);
        },
      });
      client.requestAccessToken();
    });
  }, []);

  // Get a valid token — tries silent refresh first, falls back to consent popup
  const getToken = useCallback(async (): Promise<string> => {
    if (isTokenValid()) return accessToken!;
    try {
      return await requestToken(true);    // silent — no UI if already granted
    } catch {
      return requestToken(false);          // popup — user sees consent screen
    }
  }, [isTokenValid, accessToken, requestToken]);

  // Connect + fetch user profile in one step
  const connect = useCallback(async () => {
    const token = await requestToken(false);
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Profile fetch failed');
    const profile = await res.json();
    // profile = { sub, name, email, picture }
    // sub is the stable unique user ID — use it as a localStorage namespace key
    return { token, profile };
  }, [requestToken]);

  const disconnect = useCallback(() => {
    sessionStorage.removeItem('g_token');
    sessionStorage.removeItem('g_expiry');
    setAccessToken(null);
    setTokenExpiry(null);
  }, []);

  return {
    isConnected: isTokenValid(),
    tokenExpiry,
    connect,
    getToken,
    disconnect,
  };
}
```

### 4. Call a Google API with the token

`getToken()` handles expiry and silent re-auth transparently. Use it before every API call.

```typescript
const { getToken } = useGoogleAuth();

async function fetchCalendarEvents() {
  const token = await getToken();   // refreshes silently if expired
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('timeMin', new Date().toISOString());
  url.searchParams.set('maxResults', '20');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('TOKEN_EXPIRED');
  return res.json();
}
```

### 5. Token expiry UI pattern

GIS tokens expire after ~1 hour. Show a reconnect banner so the user is never
silently dropped:

```typescript
const { isConnected, tokenExpiry, getToken } = useGoogleAuth();
const tokenExpired = tokenExpiry && Date.now() > tokenExpiry;

// Render:
{tokenExpired && (
  <div className="token-expiry-banner">
    <span>Google sync paused — tap to reconnect</span>
    <button onClick={() => getToken()}>↻ Reconnect</button>
  </div>
)}
```

---

## Common Scopes Reference

| Scope | What it allows |
|---|---|
| `https://www.googleapis.com/auth/calendar.readonly` | Read user's calendar events |
| `https://www.googleapis.com/auth/tasks.readonly` | Read user's tasks and task lists |
| `https://www.googleapis.com/auth/drive.readonly` | Read files from Google Drive |
| `https://www.googleapis.com/auth/gmail.readonly` | Read Gmail messages |
| `openid profile email` | Sign-in: stable user ID (`sub`), name, email, photo |

Always request the **minimum scopes** you need. Users see a consent dialog that lists
each scope explicitly. Requesting more than you use erodes trust and can block OAuth
app verification.

---

## Security notes

- **Token in `sessionStorage`** — clears when the browser tab closes. This is intentional. Tokens are not persisted across sessions.
- **Never store the access token in `localStorage`** — sessionStorage is per-session; localStorage persists indefinitely and is higher risk.
- **The Client ID is public** — this is correct and expected. Only the Client Secret is sensitive, and the implicit token model requires no Client Secret.
- **Rate limits** — Calendar API: 1M requests/day free. Tasks API: 50k requests/day free. Both limits are per Google Cloud project.

---

## GCP Console setup checklist

- [ ] GCP project created (or existing project selected)
- [ ] Required APIs enabled: Calendar API, Tasks API (or others as needed)
- [ ] OAuth consent screen configured: app name, support email, authorized domains, scopes
- [ ] OAuth 2.0 Client ID created — type: **Web Application**
- [ ] Authorized JavaScript Origins set — your deployed domain + `http://localhost:5173`
- [ ] **No redirect URIs added** — the token model does not use them
- [ ] Test users added (while in Testing mode; max 100 external users before verification)
- [ ] Client ID copied to `VITE_GOOGLE_CLIENT_ID` in your environment

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
