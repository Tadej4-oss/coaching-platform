# Coaching Platform

A full-stack workout coaching platform that connects coaches with their clients. Coaches can manage clients, create workout programs, assign exercises, and communicate directly with clients through the platform.

The project was built as a full-stack portfolio application with a focus on authentication, relational database design, REST APIs, and a React/TypeScript frontend.

---

## Project Status

The core functionality of the application is complete. The project was created as a portfolio project to demonstrate full-stack development with React, TypeScript, Node.js, Express, and PostgreSQL.

The codebase could be further refined in terms of cleanliness and overall architecture. However, since this is a portfolio project, I decided to move on to a new project where I can apply what I've learned while gaining hands-on experience with new concepts such as WebSockets and real-time communication.

### Development Approach

The application's core functionality was written manually as part of a deliberate learning process. This allowed me to work through errors directly and develop a stronger understanding of concepts such as **frontend vs. backend responsibilities, data flow, and handling undefined or unexpected values**.

CSS styling and some SQL queries were created with AI assistance to streamline development. I am comfortable working with both CSS and SQL beyond a beginner level, but chose to prioritize my time on the application's **architecture, logic, authentication, and full-stack functionality**.

---

## Features

### Authentication

- Coach and client accounts
- Secure password hashing
- Email verification
- JWT access and refresh token authentication
- HTTP-only cookie authentication
- Protected API routes
- Logout and token invalidation
- Password changing

### Coaching

- Coach/client relationships
- Client management
- Edit client programs and exercises
- Coach and client profiles
- Role-based interfaces for coaches and clients

### Workout Programs

- Create and delete workout programs
- Add exercises to programs
- Configure sets and reps
- Assign programs to clients
- View program exercises and workout information

### Exercises

- Search exercises using an external exercise API
- View exercise information and demonstration videos
- Add exercises to workout programs

### Messaging

> **Next step:** WebSocket-based real-time communication.

- One-to-one coach/client conversations
- Persistent message history
- Separate conversations for each coach/client relationship

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express.js
- PostgreSQL
- JWT authentication
- bcrypt
- Zod

### External Services

- Resend for email verification
- External exercise API for exercise data and videos

---

## Architecture

The application consists of three main layers:

    React + TypeScript
           |
           | HTTP / REST API
           v
    Node.js + Express
           |
           | SQL
           v
       PostgreSQL

The frontend communicates with the Express REST API. The backend handles authentication, authorization, application logic, and database access.

PostgreSQL stores users, coach/client relationships, programs, exercises, conversations, messages, refresh tokens, and verification tokens.

---

## Authentication

Authentication uses short-lived access tokens together with longer-lived refresh tokens.

Tokens are delivered using **HTTP-only cookies**, preventing frontend JavaScript from directly accessing them.

When an access token expires, the frontend can request a new access token using the refresh token without requiring the user to log in again.

---

## API Overview

The backend exposes REST endpoints for the application's main resources, including:

    /auth          Authentication and account management
    /programs      Workout program management
    /exercises     Exercise management
    /messages      Coach/client messaging
    /clients       Coach/client relationships

Individual routes primarily use the appropriate HTTP methods, including `GET`, `POST`, `PATCH`, and `DELETE`.
Individual routes primarily use the appropriate HTTP methods, including `GET`, `POST`, `PATCH`, and `DELETE`.
