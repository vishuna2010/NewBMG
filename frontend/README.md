# Insurance Broker Platform - Customer Portal (Frontend)

This directory contains the React.js frontend application for the Insurance Broker Platform's customer portal.

## Overview

This application provides customers with an interface to:
*   View and manage their insurance policies.
*   File and track claims.
*   Get new insurance quotes.
*   Manage their profile and communication preferences.
*   Make payments.
*   Access important documents.

## Tech Stack

*   **Framework/Library:** React.js (using `create-react-app` conventions)
*   **Routing:** `react-router-dom`
*   **State Management:** (To be decided - e.g., Context API, Redux, Zustand)
*   **Styling:** CSS (Global `index.css`, `App.css`, component-specific styles as needed. May introduce CSS Modules or Styled Components later)

## Getting Started

### Prerequisites

*   Node.js (v16 or later recommended) and npm (or Yarn).

### Setup and Installation

1.  **Navigate to this Directory:**
    Make sure your terminal is in the `frontend` directory:
    ```bash
    cd path/to/your/project/frontend
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
    This application is configured via a `.env` file in this directory to run on port **3003** by default (i.e., `http://localhost:3003`). If port 3003 is unavailable, Create React App might prompt you to use another port. The server will watch for file changes and automatically reload.

## Available Scripts

In the `frontend` directory, you can run several commands:

*   `npm start` or `yarn start`: Runs the app in development mode.
*   `npm test` or `yarn test`: Launches the test runner in interactive watch mode.
*   `npm run build` or `yarn build`: Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.
*   `npm run eject` or `yarn eject`: **Note:** this is a one-way operation. Once you `eject`, you can’t go back! It removes the single build dependency from your project and copies all configuration files and transitive dependencies (webpack, Babel, ESLint, etc.) right into your project so you have full control over them.

## Project Structure

A brief overview of the key directories within `frontend/src/`:

*   `assets/`: Static assets like images, global CSS.
*   `components/`: Reusable UI components.
    *   `common/`: Components used across multiple features (e.g., Header, Footer, Button).
    *   `feature/`: Components specific to a particular feature (e.g., PolicyCard, ClaimForm).
*   `contexts/` (or `store/`): For React Context API or other state management solutions (e.g., Redux reducers/actions/slices).
*   `hooks/`: Custom React hooks.
*   `pages/` (or `views/`): Top-level components that represent distinct pages/views of the application (e.g., HomePage, LoginPage, PolicyDetailsPage).
*   `routes/`: Route configuration, protected route components, etc.
*   `services/` (or `api/`): Functions for making API calls to the backend.
*   `utils/`: Utility functions, helpers, constants.

## Learn More

This project was bootstrapped based on `create-react-app` conventions. You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
