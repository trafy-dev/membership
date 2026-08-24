# Membership Backend — Walkthrough

## What Was Built

A complete **Node.js + Express + SQLite** backend API for the membership system.

## API Endpoints

### Auth (`/api/auth`)
- `POST /api/auth/signup` — Register (multipart form + profile picture)
- `POST /api/auth/login` — Login with email + password
- `POST /api/auth/logout` — Destroy session
- `GET /api/auth/session` — Check auth status

### Member (`/api/member`) — requires login
- `GET /api/member/profile` — Full dashboard data
- `PUT /api/member/profile` — Update profile fields
- `PUT /api/member/profile-picture` — Upload new profile pic
- `GET /api/member/id-card` — Download PDF ID card
- `PUT /api/member/settings` — Change password

## How to Run
```
npm install
npm start
```
Server runs on http://localhost:3000
