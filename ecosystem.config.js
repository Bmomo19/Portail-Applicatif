module.exports = {
  apps: [{
    name: 'portail',
    script: 'start-server.js',
    cwd: 'C:\\xampp\\htdocs\\portail',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false, // ⚠️ Désactive watch en production (cause des restarts inutiles)
    max_memory_restart: '1G',
    
    // Ajouter les options Node.js pour supprimer le warning
    node_args: '--no-deprecation',
    
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      NODE_NO_WARNINGS: '1' // Supprimer tous les warnings
    },
    
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    time: true,
    merge_logs: true,
    
    max_restarts: 5,
    min_uptime: '10s'
  }]
}