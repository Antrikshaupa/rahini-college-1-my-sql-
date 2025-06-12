# GoDaddy Deployment Guide

This guide will help you deploy your Personal Portfolio application to GoDaddy hosting.

## Prerequisites

1. GoDaddy hosting account with Node.js support
2. FTP client (like FileZilla)
3. Access to your Neon database

## Build for Production

Before uploading to GoDaddy, build your project for production:

```bash
npm run build
```

This will create a `dist` directory with your compiled application.

## Files to Upload

Upload the following files and directories to your GoDaddy hosting:

- `dist/` directory (contains compiled server code)
- `dist/public/` directory (contains compiled client code)
- `node_modules/` directory (dependencies)
- `package.json` and `package-lock.json`
- `production.env` (rename to `.env` on the server)
- `start.js` (entry point for GoDaddy)
- `shared/` directory
- `server/` directory (for reference)

## GoDaddy Configuration

1. Log in to your GoDaddy hosting control panel
2. Navigate to the Node.js section
3. Configure the application:
   - Entry point: `start.js`
   - Node.js version: 18.x or higher
   - Environment variables: Set any additional environment variables needed

## Database Configuration

1. Ensure your Neon database allows connections from GoDaddy's IP addresses
2. Add GoDaddy's IP to the allowed list in Neon's dashboard
3. Check that the DATABASE_URL in production.env is correct

## Starting the Application

On GoDaddy, you can start the application using:

```bash
npm run godaddy
```

This will use the start.js script which:

1. Copies production.env to .env
2. Starts the server in production mode
3. Handles graceful shutdown

## Troubleshooting

If you encounter issues:

1. Check the GoDaddy error logs
2. Ensure all dependencies are installed
3. Verify that the database connection is working
4. Check if GoDaddy has any port restrictions

## Additional Notes

- GoDaddy shared hosting might have limitations on long-running processes
- Consider using a process manager like PM2 if available
- For better performance, consider upgrading to a VPS or dedicated hosting
