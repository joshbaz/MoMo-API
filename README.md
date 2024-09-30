# Nyati Node.js Server

This repository contains the backend API for Nyati's video-on-demand platform, utilizing Node.js and PM2 for process management. The server integrates with mobile payment gateways like MTN and Pasapal.

## Prerequisites

Ensure that the following are installed on your system:

- [Node.js](https://nodejs.org/) (v14.x or higher)
- [PM2](https://pm2.keymetrics.io/) (Process Manager for Node.js)
- [Git](https://git-scm.com/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/joshbaz/MoMo-API.git
   cd MoMo-API
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create `.env.staging` and `.env.production` files in the root directory.
   - Add your environment-specific configurations (e.g., API keys, database connections).

## Running the App

### Staging Mode

To run the API in **staging** mode:

1. Ensure that your environment variables for the staging environment are set up in the `.env.staging` file.
2. Start the server with PM2 in staging mode:

   ```bash
   sudo pm2 start app.js -i max --name api --env staging
   ```

   - `-i max` will start the app in cluster mode with as many instances as CPU cores.
   - `--env staging` specifies the staging environment configuration.

### Production Mode

To run the API in **production** mode:

1. Ensure that your environment variables for the production environment are set up in the `.env.production` file.
2. Start the server with PM2 in production mode:

   ```bash
   sudo pm2 start app.js -i max --name api --env production
   ```

   - `-i max` will start the app in cluster mode with as many instances as CPU cores.
   - `--env production` specifies the production environment configuration.

## Monitoring the App

You can use the following PM2 commands to monitor and manage the API:

- View the app status:

  ```bash
  pm2 status
  ```

- Check the logs for the API:

  ```bash
  pm2 logs api
  ```

- Reload the API (zero-downtime reload):

  ```bash
  pm2 reload api
  ```

## Stopping and Removing the API

To stop and completely remove the API from PM2:

```bash
pm2 stop api && pm2 delete api
```
