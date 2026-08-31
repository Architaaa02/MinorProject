# CivicEye

The project contains a React frontend and an Express/MongoDB backend in
`civiceye-backend`.

## Run locally

1. In `civiceye-backend`, Create a `.env` file inside `civiceye-backend/` containing the required environment variables, such as `MONGO_URI` and `JWT_SECRET`.

Then install dependencies and start the backend:

cd civiceye-backend
npm install
npm run dev

2. In the repository root, run `npm install` and `npm start`.

The frontend connects to `http://localhost:5000/api` by default. For a deployed
backend, create a root `.env` with `REACT_APP_API_URL=https://your-api.example/api`.
Set the backend's `CLIENT_ORIGIN` to the frontend URL so browser requests are allowed.

Issue submissions require an image, a readable address, and latitude/longitude.
The frontend displays API errors instead of replacing failed requests with mock data.
