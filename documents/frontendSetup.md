# Frontend Setup Guide

## Overview

This guide explains how to set up the **React frontend** for the employee scheduling project.

The frontend is built with:

- React 18
- TypeScript
- React Router DOM
- Create React App

---

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── Api/
│   │   └── api.js
│   ├── Components/
│   │   ├── EmployeeAvailability/
│   │   ├── EmployeeList/
│   │   ├── Header/
│   │   ├── Login/
│   │   ├── RegisterEmployee/
│   │   ├── SchedulePage/
│   │   └── WorkSchedule/
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── package.json
└── tsconfig.json
```

---

## Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

---

## Dependencies

### Production Dependencies

- `react`: UI library
- `react-dom`: React DOM rendering
- `react-router-dom`: Client-side routing
- `react-scripts`: Build scripts and development server

### Development Dependencies

- `@types/react`: TypeScript types for React
- `@types/react-dom`: TypeScript types for React DOM
- `concurrently`: Run multiple commands simultaneously

---

## Scripts

- `npm run dev`: Start the development server
- `npm test`: Run tests (not implemented yet)
- `npm run build`: Build for production
- `npm run eject`: Eject from Create React App (not recommended)

---

## Development

1. Start the development server:

```bash
npm run dev
```

2. The app will be available at `http://localhost:3000`

3. The backend should be running on `http://localhost:5050` for API calls

---

## API Integration

The frontend communicates with the backend through `src/Api/api.js`. This file contains functions for:

- Authentication (login/logout)
- Fetching employee data
- Managing availability
- Schedule operations

Make sure the backend is running and the API endpoints match.

---

## TypeScript Configuration

The project includes TypeScript support with `tsconfig.json`. Currently, components are written in JSX but can be converted to TSX for better type safety.

---

## Styling

Components use individual CSS files for styling. Each component has its own `.css` file in the same directory.

---

## Future Enhancements

- Convert JSX to TSX files
- Add state management (Redux or Context API)
- Implement testing framework (Jest, React Testing Library)
- Add CSS framework (Tailwind, Material-UI)</content>
  <parameter name="filePath">c:\Backend classes\employee-scheduling-project\documents\frontendSetup.md
