module.exports = {
  apps: [{
    name: 'portail',
    script: 'start-server.js',
    cwd: 'C:\\xampp\\htdocs\\portail',  // Chemin absolu Windows
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
    time: true,
    
    max_restarts: 5,
    min_uptime: '10s'
  }]
}