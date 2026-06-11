# Alumni Career Tracker - Architecture & Documentation

This document outlines the architecture, features, data pipelines, and core functional modules of the Alumni Career Tracker platform.

---

## 1. High-Level Architecture

The platform utilizes a modern, decoupled full-stack architecture:

*   **Frontend (Client)**: Built with **React 18** using **Vite** for fast bundling. It uses **TypeScript** for type safety, **Tailwind CSS** for styling, and **Zustand** for lightweight state management.
*   **Backend (API Server)**: Built with **FastAPI** (Python). Chosen for its high performance, native async support, and auto-generated Swagger documentation.
*   **Database**: Relational database schema managed via **SQLAlchemy ORM**. Configured to use **PostgreSQL** in production (can fallback to SQLite for local rapid prototyping).
*   **Authentication**: Secure stateless authentication using **JWT (JSON Web Tokens)** and **Bcrypt** for password hashing.
*   **Background Processing**: Uses FastAPI's native `BackgroundTasks` to handle long-running operations (like CSV parsing and API triggers) without blocking the main event loop.

---

## 2. Core Features

*   **Real-Time Analytics Dashboard**: Visual summary of total tracked alumni, recent uploads, and detected career changes.
*   **Alumni Directory Management**: View, search, and filter thousands of alumni profiles with server-side pagination. Includes an expansive modal for viewing complex JSON metadata (skills and experience).
*   **Bulk Data Ingestion**: Upload massive CSV files containing LinkedIn URLs. Built-in validation limits uploads to 500 rows to protect API quotas.
*   **Activity & History Tracking**: Maintains a traceable history of all uploaded files. Original files are stored securely on the server and can be downloaded or deleted later.
*   **Automated Change Detection**: A built-in "Comparison Engine" that compares freshly scraped profile data against existing database records to detect promotions or company changes.
*   **Data Export Pipeline**: Ability to generate targeted CSV exports based on active directory filters.
*   **Security & Rate Limiting**: Critical endpoints are protected by `slowapi` to prevent DDoS or spam (e.g., 5 requests/minute for manual profile additions).

---

## 3. The Data Pipeline (How Data Moves)

The core pipeline of the application revolves around turning a raw LinkedIn URL into enriched, tracked database records using an **asynchronous webhook architecture**. 

Here is the flow:

1.  **Ingestion (Trigger)**: Admin uploads a CSV of URLs or manually adds a single URL via the React UI.
2.  **Background Handoff**: The FastAPI router accepts the request, creates a "Processing" record in the `uploaded_files` table, and passes the heavy lifting to a background thread.
3.  **Parsing & API Trigger**: The background thread uses `pandas` to parse the CSV and sanitizes the URLs. It then makes a `POST` request to the TexAu API, triggering the scraping job and providing our backend's **Webhook URL**.
4.  **Asynchronous Waiting**: Our backend finishes the background task and updates the UI via WebSockets. It does *not* wait for TexAu to finish scraping.
5.  **Webhook Receiver (The Callback)**: Minutes or hours later, TexAu finishes scraping and sends a massive JSON payload via `POST` to our public Webhook endpoint (`/api/v1/webhooks/texau`).
6.  **Data Processing (Comparison Engine)**: The webhook endpoint receives the data, extracts the relevant fields (current role, company, skills, location), and feeds it into the `ComparisonEngine`.
7.  **Change Detection**: The Comparison Engine checks the `alumni_master` table. 
    *   If the user doesn't exist, it creates them.
    *   If the user exists but their role/company changed, it updates the `alumni_master` and logs the difference in the `change_log` table.
8.  **Notification (Brevo)**: Changes detected in the `change_log` automatically trigger the `BrevoService` to send live HTML email alerts to administrators.

---

## 4. Key Functions & Modules

### Backend Structure (`/backend/app`)
*   **`/api/endpoints`**: Contains the FastAPI routers.
    *   `auth.py`: Handles login and JWT token generation.
    *   `alumni.py`: CRUD operations, filtering, and CSV export logic.
    *   `upload.py`: Background processing for CSV files and history tracking.
    *   `analytics.py`: Aggregates dashboard metrics.
    *   `webhooks.py` *(Upcoming)*: Listens for incoming POST requests from external APIs like TexAu.
*   **`/core`**: Configuration and foundation.
    *   `config.py`: Environment variable loading.
    *   `database.py`: SQLAlchemy session generation.
    *   `security.py`: Password hashing and JWT decoding.
    *   `limiter.py`: The `slowapi` rate-limiter instance.
*   **`/models` & `/schemas`**: 
    *   `core_models.py`: SQLAlchemy Python classes (defines the physical SQL tables).
    *   `core_schemas.py`: Pydantic models (validates incoming/outgoing JSON data).
*   **`/services`**: The business logic layer.
    *   `alumni_service.py`: Database queries for alumni.
    *   `texau_service.py`: Integration logic for triggering web scrapers.
    *   `comparison_engine.py`: The core algorithm for detecting career changes.

### Frontend Structure (`/frontend/src`)
*   **`/components`**: Reusable UI blocks.
    *   `AlumniList.tsx`: The directory grid with search, filter, and modal logic.
    *   `CsvUpload.tsx`: Drag-and-drop file uploader UI.
    *   `Analytics.tsx`: Metric cards for the dashboard.
*   **`/store`**: State management.
    *   `authStore.ts`: Zustand store that persists the JWT token and user session across page reloads.
*   **`/services`**: 
    *   `api.ts`: An Axios instance pre-configured to attach the Bearer JWT token to all outbound requests.
