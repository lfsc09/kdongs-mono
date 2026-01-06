# Deployment Guide

This document provides comprehensive instructions for deploying the kdongs-mono application to a VPS server (Hostinger) using Docker.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial VPS Setup](#initial-vps-setup)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [Manual Deployment](#manual-deployment)
5. [Automated Deployment (GitHub Actions)](#automated-deployment-github-actions)
6. [Database Backups](#database-backups)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### VPS Server Requirements
- **OS**: Ubuntu 22.04 LTS or newer
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **CPU**: 2 cores minimum
- **Network**: Public IP address
- **Domain**: Domain name pointing to the VPS IP

### Local Requirements
- Git installed
- SSH access to VPS
- GitHub account with repository access

### Required Credentials
- VPS SSH private key
- Domain name configured in DNS
- Email address for SSL certificates

---

## Initial VPS Setup

### One-Command Setup (Recommended)

The bootstrap script now handles everything automatically! Simply run:

```bash
# SSH into your VPS as root
ssh root@your-vps-ip

# Run the bootstrap script directly from GitHub
bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/vps-bootstrap.sh) your-domain.com your-email@example.com
```

**What this does automatically:**
- ✅ Creates `kdongs` user with sudo access
- ✅ Installs Docker and Docker Compose
- ✅ Configures firewall (UFW) with SSH, HTTP, HTTPS
- ✅ Installs fail2ban for security
- ✅ Enables automatic security updates
- ✅ Installs rclone for backups
- ✅ Clones the repository
- ✅ Generates secure database passwords
- ✅ Creates backend `.env` with APP_KEY
- ✅ Configures domain in nginx
- ✅ Sets up automated daily database backups
- ✅ Creates backup directory

**Parameters:**
- `DOMAIN` (required): Your domain name (e.g., `kdongs.com`)
- `EMAIL` (required): Your email for SSL certificates

---

## SSL Certificate Setup

### First-Time Certificate Issuance

```bash
cd /var/www/kdongs-mono/docker

# Start nginx temporarily for ACME challenge
docker compose up -d nginx

# Request certificate
docker compose run --rm certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d kdongs.com \
  -d www.kdongs.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Restart nginx with SSL
docker compose restart nginx
```

### Certificate Auto-Renewal

The certbot container runs a renewal loop every 12 hours. Certificates are automatically renewed 30 days before expiration.

To manually test renewal:

```bash
docker compose exec certbot certbot renew --dry-run
```

---

## Manual Deployment

### Using the Deployment Script

```bash
cd /var/www/kdongs-mono

# Deploy latest main branch
./scripts/deploy.sh

# Deploy specific release tag
./scripts/deploy.sh v1.2.3
```

### Step-by-Step Manual Deployment

```bash
cd /var/www/kdongs-mono

# 1. Pull latest code
git fetch --all --tags
git checkout main  # or tags/v1.2.3
git pull origin main

# 2. Create backup
./docker/postgres/scripts/export-database.sh ./backups "manual-backup-$(date +%Y%m%d-%H%M%S)"

# 3. Navigate to docker directory
cd docker

# 4. Build new images
docker compose build --no-cache

# 5. Stop old containers
docker compose down

# 6. Start new containers
docker compose up -d

# 7. Check status
docker compose ps
docker compose logs -f
```

---

## Automated Deployment (GitHub Actions)

### Setup GitHub Secrets

In your GitHub repository settings, add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_SSH_KEY` | Private SSH key for VPS access | Contents of `~/.ssh/id_ed25519` |
| `VPS_HOST` | VPS IP address or hostname | `123.45.67.89` |
| `VPS_USER` | VPS username | `kdongs` |
| `VPS_PATH` | Full path to project on VPS | `/var/www/kdongs-mono` |
| `VPS_DOMAIN` | Production domain name | `kdongs.com` |

### Trigger Deployment

#### On Release (Automatic)

1. Create a new release on GitHub:
   ```bash
   # Tag the release locally
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. Go to GitHub → Releases → Create a new release
3. Select the tag you just pushed
4. Publish the release
5. GitHub Actions will automatically deploy

#### Manual Trigger

1. Go to GitHub → Actions → "Deploy to VPS"
2. Click "Run workflow"
3. Select environment (production/staging)
4. Click "Run workflow"

### Monitor Deployment

```bash
# On GitHub
# Go to Actions tab to see deployment progress

# On VPS (SSH into server)
cd /var/www/kdongs-mono/docker
docker compose logs -f
```

---

## Database Backups

### Manual Backup

```bash
cd /var/www/kdongs-mono/docker/postgres/scripts

# Create backup
./export-database.sh ../../backups "manual-backup-$(date +%Y%m%d)"

# Backups are stored in: /var/www/kdongs-mono/backups/
```

### Automated Daily Backups

Setup a cron job for automated backups:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 2 AM daily, keeps 7 days of backups)
0 2 * * * /var/www/kdongs-mono/docker/postgres/scripts/auto-backup.sh 7 >> /var/log/kdongs-backup.log 2>&1
```

### Restore from Backup

```bash
cd /var/www/kdongs-mono/docker/postgres/scripts

# List available backups
ls -lh ../../backups/

# Restore specific backup
./import-database.sh ../../backups/backup-20241209-120000.sql.gz

# Restart backend after restore
cd ../..
docker compose restart api-backend
```

### Backup to Remote Storage (Recommended)

For production, sync backups to remote storage:

```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure remote (S3, Google Drive, etc.)
rclone config

# Add to cron after auto-backup
0 3 * * * rclone sync /var/www/kdongs-mono/backups/ remote:kdongs-backups/
```

---

## Monitoring & Maintenance

### Check Service Health

```bash
cd /var/www/kdongs-mono/docker

# Check all containers
docker compose ps

# Check specific service logs
docker compose logs api-backend -f
docker compose logs nginx -f
docker compose logs api-postgres -f

# Check resource usage
docker stats
```

### Application Health Endpoints

Add a health check endpoint to your backend:

```bash
# Check API health
curl http://localhost:8000/health

# Check from outside
curl https://kdongs.com/api/health
```

**TODO**: Implement health check endpoint in backend (`start/routes.ts`):

```typescript
router.get('/health', async ({ response }) => {
  try {
    // Check database connection
    await Database.rawQuery('SELECT 1')

    return response.ok({
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      database: 'connected'
    })
  } catch (error) {
    return response.serviceUnavailable({
      status: 'unhealthy',
      error: error.message
    })
  }
})
```

### Database Monitoring

```bash
# Connect to database
docker exec -it kdongs-api-postgres psql -U adonisjs -d app

# Check database size
SELECT pg_size_pretty(pg_database_size('app'));

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

# Exit psql
\q
```

### Log Rotation

Setup log rotation to prevent disk space issues:

```bash
sudo nano /etc/logrotate.d/kdongs

# Add this configuration:
/var/log/kdongs-*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### Update Docker Images

```bash
cd /var/www/kdongs-mono/docker

# Pull latest base images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker compose logs api-backend --tail=100

# Check for port conflicts
sudo netstat -tulpn | grep -E '80|443|3333|5432'

# Restart specific service
docker compose restart api-backend
```

### Database Connection Issues

```bash
# Check database container
docker compose logs api-postgres

# Verify database is running
docker exec kdongs-api-postgres pg_isready -U adonisjs

# Check environment variables
docker compose exec api-backend env | grep DB_
```

### SSL Certificate Issues

```bash
# Check certificate validity
docker compose exec nginx openssl x509 -in /etc/letsencrypt/live/kdongs.com/cert.pem -noout -dates

# Manually renew certificate
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d kdongs.com --force-renewal

# Check nginx config
docker compose exec nginx nginx -t

# Reload nginx
docker compose exec nginx nginx -s reload
```

### Frontend Not Loading

```bash
# Check if frontend was built
docker compose exec nginx ls -la /usr/share/nginx/html/

# Rebuild frontend
docker compose up -d --build frontend-builder

# Check nginx logs
docker compose logs nginx --tail=100
```

### High Memory Usage

```bash
# Check memory usage per container
docker stats --no-stream

# Adjust container resource limits in compose.yaml
# Restart with new limits
docker compose up -d
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Clean up old backups
find /var/www/kdongs-mono/backups -name "*.sql.gz" -mtime +30 -delete
```

---

## Rollback Procedures

### Rollback to Previous Release

```bash
cd /var/www/kdongs-mono

# List available tags
git tag -l

# Checkout previous stable version
git checkout tags/v1.1.0

# Create backup of current database
./docker/postgres/scripts/export-database.sh ./backups "pre-rollback-$(date +%Y%m%d-%H%M%S)"

# Rebuild and restart
cd docker
docker compose build --no-cache
docker compose down
docker compose up -d

# Verify
docker compose ps
docker compose logs -f
```

### Restore from Backup

```bash
cd /var/www/kdongs-mono/docker

# Stop backend
docker compose stop api-backend

# Restore database
./postgres/scripts/import-database.sh ../backups/backup-20241209-120000.sql.gz

# Start backend
docker compose start api-backend

# Verify
docker compose logs api-backend -f
```

### Emergency Rollback

If deployment fails completely:

```bash
cd /var/www/kdongs-mono

# Checkout main branch
git checkout main
git pull origin main

# Restore last known good backup
./docker/postgres/scripts/import-database.sh ./backups/auto-backup-YYYYMMDD-HHMMSS.sql.gz

# Rebuild and restart
cd docker
docker compose down
docker compose up -d

# Monitor
docker compose logs -f
```

---

## Security Best Practices

### 1. Secure Secrets Directory

```bash
# Ensure proper permissions
chmod 700 /var/www/kdongs-mono/docker/secrets
chmod 600 /var/www/kdongs-mono/docker/secrets/*

# Never commit secrets to git
cat >> /var/www/kdongs-mono/docker/secrets/.gitignore <<EOF
*
!.gitkeep
EOF
```

### 2. Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 3. Setup Fail2Ban

```bash
# Install fail2ban
sudo apt-get install fail2ban

# Configure for SSH
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Regular Security Updates

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Update Docker
sudo apt-get install --only-upgrade docker-ce docker-ce-cli containerd.io

# Restart containers with new base images
cd /var/www/kdongs-mono/docker
docker compose pull
docker compose up -d --build
```

---

## Production Checklist

Before going to production, ensure:

- [ ] VPS is properly configured with adequate resources
- [ ] Domain DNS is pointing to VPS IP
- [ ] SSL certificates are installed and auto-renewing
- [ ] Database backups are automated and tested
- [ ] Environment variables are set correctly
- [ ] Secrets are secure and not committed to git
- [ ] Firewall is configured
- [ ] GitHub Actions secrets are configured
- [ ] Health check endpoint is implemented
- [ ] Monitoring is setup (logs, metrics)
- [ ] Rollback procedure is tested
- [ ] Error tracking is configured (Sentry recommended)
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured for production domain

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Let's Encrypt**: https://letsencrypt.org/docs/
- **AdonisJS Deployment**: https://docs.adonisjs.com/guides/deployment
- **Angular Deployment**: https://angular.io/guide/deployment
- **PostgreSQL Backup**: https://www.postgresql.org/docs/current/backup.html

---

## Support

For issues or questions:
1. Check the logs: `docker compose logs -f`
2. Review this documentation
3. Check GitHub Issues: https://github.com/lfsc09/kdongs-mono/issues
4. Contact the development team

---

**Last Updated**: 2024-12-09
**Version**: 1.0.0
