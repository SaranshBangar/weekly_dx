# [Next.js + Redis To-Do Application](https://opw-redis.vercel.app/)

A simple, fast, and interactive To-Do application built with Next.js App Router, demonstrating how to use **Redis** as a primary database.

The core learning focus of this project is understanding how Redis operates under the hood. To help with this, every action you take in the application triggers a UI toast that displays the exact **Redis CLI command** that was executed on the server.

## Features

- **Next.js App Router**: Server Actions for seamless frontend-backend communication.
- **Redis Primary DB**: Uses Redis Hashes (\HGETALL\, \HSET\, \HDEL\) to store and mutate to-do items.
- **UI & Styling**: Built with Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/) (Card, Button, Input, Checkbox, Sonner for toasts).
- **Educational Toasts**: Live toast notifications showing the literal Redis commands running behind the scenes.

## Getting Started

1. **Install dependencies:**

   ```
   npm install
   ```

2. **Set up Environment Variables:**
   Create a \.env.local\ file in the root of this project and add your Redis connection details:

   ```
   REDIS_USERNAME=default
   REDIS_PASSWORD=your_redis_password
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   ```

3. **Run the development server:**

   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
