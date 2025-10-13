module.exports = {
  apps: [{
    name: 'portail',
    script: './node_modules/.bin/next',  // ✅ Chemin direct vers Next.js
    args: 'start',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: true,
    max_memory_restart: '1G',
    
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}