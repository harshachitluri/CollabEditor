module.exports = {
  apps: [
    {
      name: 'collab-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'collab-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
      },
    },
  ],
}
