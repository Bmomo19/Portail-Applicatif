module.exports = {
  apps: [{
    name: 'portail',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    exec_mode: 'fork',
    
    // Environnement de production (par défaut)
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    
    // Logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Délai de redémarrage
    restart_delay: 4000,
    min_uptime: '10s'
  }]
}