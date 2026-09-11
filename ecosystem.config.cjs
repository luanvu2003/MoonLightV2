module.exports = {
  apps: [
    {
      name: 'moonlight',
      script: './dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '450M',
      node_args: '--max-old-space-size=400',
      env: {
        NODE_ENV: 'production',
        PORT: 10000
      }
    },
    {
      name: 'moonlight-ai',
      script: 'backend/run.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PYTHONUNBUFFERED: '1',
        AI_PORT: 8001,
        AI_HOST: '0.0.0.0'
      }
    }
  ]
};
