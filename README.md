

# CRM Frontend (React + Vite) — Innosuisse SSC

Frontend for a CRM-style web application used to manage **partner organizations and contacts** within the **Innosuisse SSC (Swiss Supply Chain) project**.

The focus of this project is a clean, maintainable UI with real-world CRM workflows: organization overview, contact exploration, communication support, and admin-controlled access to information.

---

## What this app does

- **Organization directory**: browse all organizations in one place  
- **Details & contacts**: view organization profiles and related contact persons  
- **Search / sort / filter**: quickly find relevant entries  
- **Email workflows**: send emails to a single organization/contact or to multiple recipients  
- **Website availability check**: verify whether a company website is reachable  
- **Admin panel**: manage user access and visibility of sensitive information  
- **Authentication**: login / registration and role-based access control (RBAC)

---

## Why it matters (engineering perspective)

- Built as a real internal tool with **data-driven UI**, not a static demo
- Clear separation between UI and API logic (service layer under `src/lib/`)
- Scalable project structure to support additional features and screens

---

## Tech Stack

- **React**
- **Vite**
- **TypeScript / JavaScript**
- **CSS**
- API integration via a lightweight service layer (`src/lib/*`)

---

## Project Structure (simplified)

```

src/
components/        # pages & reusable components
lib/               # API clients, auth context, utilities
styles/            # global styles
types/             # shared TS types
assets/            # images

````

---

## Getting Started

```bash
npm install
npm run dev
````

Default dev URL: `http://localhost:5173`

---

## Environment Variables

Create a `.env` file (not committed):

```env
VITE_API_BASE_URL=
```

---

## Roadmap (optional)

* Improve UX for bulk email flows
* Add advanced filtering (tags, region, industry)
* UI polish and accessibility pass

---

## Author

Developed by **Anastasiia Desiateryk**.

```

