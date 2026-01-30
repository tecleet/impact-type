# Type Race Socket Server

This is the standalone WebSocket server for the Type Race game.
It is required for multiplayer functionality when the frontend is deployed on Vercel.

## Deployment

You can deploy this server to any platform that supports Node.js (e.g., Render, Railway, Fly.io, Heroku).

### Deploying on Render (Recommended)

1.  Create a new **Web Service** on Render.
2.  Connect your GitHub repository.
3.  Set the **Root Directory** to `type-race/socket-server` (or `socket-server` if you pushed just this folder).
4.  Set the **Build Command** to: `npm install && npm run build`
5.  Set the **Start Command** to: `npm start`
6.  Click **Create Web Service**.
7.  Copy the URL of your new service (e.g., `https://type-race-socket.onrender.com`).

## Connecting Frontend

Once deployed, go to your Vercel project settings for the frontend:
1.  Go to **Settings** > **Environment Variables**.
2.  Add a new variable:
    *   **Key**: `NEXT_PUBLIC_SOCKET_URL`
    *   **Value**: The URL of your deployed socket server (e.g., `https://type-race-socket.onrender.com`).
3.  Redeploy your frontend.

## Local Development

To run locally alongside the frontend:

1.  Navigate to this directory: `cd socket-server`
2.  Install dependencies: `npm install`
3.  Run development server: `npm run dev` (Runs on port 3001)
4.  In your frontend `.env.local` file, add: `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`
