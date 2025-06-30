# Insurance Broker Platform - Backend API

This directory (`backend/`) is designated for the Node.js/Express.js backend application that powers the Insurance Broker Platform.

**IMPORTANT NOTE:** As of the last update, the backend application files (its `package.json`, `src/` directory, etc.) are currently located in the **project root**. They should be moved into this `backend/` directory to maintain a clean project structure. The instructions below assume the files will be moved here. If you are running the backend from the project root, adjust paths accordingly.

## Overview

The backend API serves as the central hub for:
*   Managing customer data, policies, and claims.
*   Handling business logic for insurance product configuration and underwriting rules.
*   Authenticating users (brokers, admins, customers via API tokens).
*   Providing data to the frontend customer portal and internal admin interfaces.
*   Integrating with third-party services (e.g., payment gateways, email services).

## Tech Stack

*   **Framework:** Express.js
*   **Language:** Node.js
*   **Database:** MongoDB (using Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Environment Variables:** `dotenv` package

## Getting Started

### Prerequisites

*   Node.js (v16 or later recommended) and npm.
*   A running MongoDB instance (local or cloud-based like MongoDB Atlas).

### Setup and Installation (Assuming files are moved to `backend/`)

1.  **Navigate to this Directory:**
    Make sure your terminal is in the `backend` directory:
    ```bash
    cd path/to/your/project/backend
    ```
    *(If backend files are still at project root, these commands should be run from the project root, and paths in `package.json` or `src/index.js` might need to be correct for that context).*

2.  **Create a `.env` File:**
    In this `backend/` directory (or project root if files haven't been moved), create a `.env` file. This file will store your environment-specific configurations.
    Copy the structure from `src/config/env.js` (which contains placeholders) or use the example below, and fill in your actual values:

    ```env
    MONGO_URI=your_mongodb_connection_string_here
    PORT=5000 # Or any port you prefer for the backend
    NODE_ENV=development # or 'production'
    JWT_SECRET=your_very_strong_jwt_secret_key # IMPORTANT: Use a strong, random key
    JWT_EXPIRE=30d # Example: token expiry time
    ```
    **Note:** Ensure the `src/index.js` is configured to load the `.env` file correctly (e.g., `require('dotenv').config();` for a root `.env` file relative to `src/index.js`'s execution path).

3.  **Install Dependencies:**
    Install the necessary packages:
    ```bash
    npm install
    ```

4.  **Run the Development Server:**
    To start the backend server with `nodemon` (for automatic restarts on file changes):
    ```bash
    npm run dev
    ```
    Alternatively, to run it normally:
    ```bash
    npm start
    ```
    The server should start, and you'll see console messages indicating the port it's running on and successful connection to MongoDB.

## API Endpoints

The primary API endpoint implemented so far is:

*   **Health Check:**
    *   **GET** `/api/v1/health`
        *   Description: Verifies that the API is running and accessible.
        *   Response: JSON object with success status, message, uptime, and timestamp.

Refer to the root `README.md` or `TODO.md` for a more comprehensive list of planned API endpoints and features.

## Project Structure (within `backend/src/`)

*   `config/`: Database connection, environment variable setup.
*   `controllers/`: Request handlers that contain the logic for API endpoints.
*   `middleware/`: Custom middleware functions (e.g., for authentication, error handling).
*   `models/`: Mongoose schemas and models for MongoDB collections.
*   `routes/`: Express route definitions that map URLs to controller functions.
*   `services/`: Business logic that is too complex for controllers (optional, can be part of controllers for smaller apps).
*   `utils/`: Utility functions.
*   `index.js`: The main entry point for the backend application.

## Moving Files (Recommendation)

To achieve the intended project structure:
1.  Move the existing `package.json`, `package-lock.json` (if it exists), `src/` directory, and `.env` file (if created at root) from the project root into this `backend/` directory.
2.  Adjust any paths in scripts or configurations if necessary after moving. The current `package.json` scripts (`start`, `dev`) use `src/index.js` which will be correct if `package.json` is in the same directory as `src/`.
