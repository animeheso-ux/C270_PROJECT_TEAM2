# Learning Quest

## Prerequisites

Make sure you have the following installed:

- Node.js (includes npm)

You can check if they're installed by running:

```bash
node -v
npm -v
```

## Installation

This project has separate frontend and backend folders. You need to install the dependencies for both.

### Frontend (`myapp`)

```bash
cd myapp
npm install
```

### Backend (`backend-node`)

```bash

npm install
```

## Running the Project

### Start the Backend

```bash
npx nodemon server.js
```

### Start the Frontend

```bash
cd myapp
npm run dev
```

The frontend will typically be available at:

```
http://localhost:5173
```

The backend will run on the port configured in the backend project.

## Notes

- Run `npm install` **once** in both the `myapp` and `backend-node` folders before starting the project.
- If you pull new changes that modify `package.json`, run `npm install` again in the affected folder.
