module.exports = {
  apps: [{
    name: 'app-portal',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Environnement par défaut
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'bdphoenix_dev'
    },
    
    // Environnement de production
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      DB_HOST: 'srv-mysql-prod',
      DB_PORT: 3306,
      DB_NAME: 'bdphoenix'
    },
    
    // Environnement de test
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 4001,
      DB_HOST: 'srv-mysql-staging',
      DB_PORT: 3306,
      DB_NAME: 'bdphoenix_staging'
    }
  }]
}