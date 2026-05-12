# Frontend

This directory contains the React frontend for the application. It provides the browser UI, uses Material UI for interface components, and connects to the backend through a WebSocket client.

## Technologies

- React
- Material UI
- WebSocket client

## Required Tools

- Node.js
- npm

Install dependencies from this directory:

```sh
npm install
```

## Environment Configuration

Create a local environment file by copying the example file:

```sh
cp .env.example .env
```

Configure the WebSocket endpoint in `front-end/.env`:

```env
REACT_APP_WS_URL=ws://localhost:8000/apiws
```

`REACT_APP_WS_URL` tells the React application where to open its WebSocket connection. React environment variables must use the `REACT_APP_` prefix so they are included in the browser build.

Example local WebSocket URL:

```env
REACT_APP_WS_URL=ws://localhost:8000/apiws
```

Example production WebSocket URL:

```env
REACT_APP_WS_URL=wss://example.com/apiws
```

Production deployments should use `wss://`, not `ws://`, so WebSocket traffic is encrypted and works correctly from HTTPS pages.

## Run Locally

Install dependencies, configure `.env`, then start the development server:

```sh
npm install
npm start
```

The React development server starts locally and prints the URL to open in the browser, usually `http://localhost:3000`.

## Build for Production

Create an optimized production build:

```sh
npm install
npm run build
```

The compiled files are written to the `build/` directory.

## Deploy

Deploy the contents of `build/` to your static hosting provider or web server. Before building for production, set `REACT_APP_WS_URL` to the production WebSocket endpoint, for example:

```env
REACT_APP_WS_URL=wss://example.com/apiws
```

If the frontend is served over HTTPS, the WebSocket URL must use `wss://`.
