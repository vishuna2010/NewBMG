# Insurance Broker Platform - Admin Portal

This directory contains the React.js frontend application for the Insurance Broker Platform's Admin Portal.

## Overview

This application provides administrators and authorized staff with an interface to:
*   Manage customers, policies, and claims.
*   Configure insurance products and underwriting rules.
*   Oversee user accounts (staff, brokers, agents).
*   View system reports and analytics.
*   Adjust system settings and integrations.

## Tech Stack

*   **Framework/Library:** React.js (using `create-react-app` conventions)
*   **Routing:** `react-router-dom`
*   **State Management:** (To be decided - e.g., Context API, Redux, Zustand)
*   **Styling:** CSS (Global `index.css`, `App.css`, component-specific styles as needed)

## Getting Started

### Prerequisites

*   Node.js (v16 or later recommended) and npm (or Yarn).

### Setup and Installation

1.  **Navigate to this Directory:**
    Make sure your terminal is in the `admin-portal` directory:
    ```bash
    cd path/to/your/project/admin-portal
    ```

2.  **Install Dependencies:**
    If you haven't already, install the necessary packages:
    *   Using npm:
        ```bash
        npm install
        ```
    *   Or using Yarn:
        ```bash
        yarn install
        ```

3.  **Run the Development Server:**
    To start the application in development mode:
    *   Using npm:
        ```bash
        npm start
        ```
    *   Or using Yarn:
        ```bash
        yarn start
        ```
    This application is configured via a `.env` file in this directory to run on port **3005** by default (i.e., `http://localhost:3005`). If port 3005 is unavailable, Create React App might prompt you to use another port. The server will watch for file changes and automatically reload.

## Available Scripts

In the `admin-portal` directory, you can run several commands:

*   `npm start` or `yarn start`: Runs the app in development mode.
*   `npm test` or `yarn test`: Launches the test runner in interactive watch mode.
*   `npm run build` or `yarn build`: Builds the app for production to the `build` folder.
*   `npm run eject` or `yarn eject`: (Use with caution) Ejects from Create React App's managed configuration.

## Project Structure

A brief overview of the key directories within `admin-portal/src/`:

*   `assets/`: Static assets like images, global CSS.
*   `components/`: Reusable UI components.
    *   `common/`: General reusable components.
    *   `layout/`: Components defining the main admin panel layout (Sidebar, Header, MainLayout).
*   `pages/`: Top-level components for distinct admin pages/views.
*   `routes/`: Route configuration.
*   `services/` (or `api/`): Functions for API calls.
*   `store/` (or `contexts/`): State management.
*   `utils/`: Utility functions.

## Learn More

This project is set up based on `create-react-app` conventions. You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
