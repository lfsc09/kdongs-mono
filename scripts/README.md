# Deployment Scripts

This directory contains scripts for deploying and managing the kdongs-mono application.

## Available Scripts

### `vps-bootstrap.sh`
**Purpose**: Fully automated VPS setup and configuration

**Description**: This script completely automates VPS setup from a fresh server to a production-ready deployment. It handles system configuration, security hardening, user creation, and application setup.

**Quick Start (Recommended)**:
```bash
# Run directly from GitHub as root
bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/vps-bootstrap.sh) your-domain.com your-email@example.com
```

**Manual Usage**:
```bash
sudo ./vps-bootstrap.sh [DOMAIN] [EMAIL]
```

**Parameters**:
- `DOMAIN` (required): Production domain name (e.g., `kdongs.com`)
- `EMAIL` (required): Email for SSL certificates and notifications

**Example**:
```bash
# One-command setup
bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/vps-bootstrap.sh) kdongs.com admin@kdongs.com

# Or download and run
curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/vps-bootstrap.sh -o vps-bootstrap.sh
chmod +x vps-bootstrap.sh
sudo ./vps-bootstrap.sh kdongs.com admin@kdongs.com
```

**What it does automatically**:

**Root Phase** (requires sudo/root):
1. Creates `kdongs` deployment user with sudo access
2. Updates system packages
3. Installs Docker and Docker Compose
4. Installs git, openssl, curl, and dependencies
5. Installs rclone for remote backups
6. Configures UFW firewall (SSH, HTTP, HTTPS)
7. Configures fail2ban for intrusion prevention
8. Enables automatic security updates
9. Creates target directory with proper ownership
10. Sets up SSH directory for deploy user

**User Phase** (runs as kdongs user):
1. Clones repository from GitHub
2. Generates secure database password
3. Creates backend `.env` file with APP_KEY
4. Configures domain in nginx configuration
5. Sets proper file permissions
6. Sets up automated daily database backups (cron)
7. Creates backup directory

**Notes**:
- Must be run as root initially (will switch to kdongs user automatically)
- If SSH keys for GitHub are not setup, cloning will fail - setup keys and re-run
- The script is idempotent - safe to run multiple times
- All configuration is logged with colored output

---

### `deploy.sh`
**Purpose**: Manual deployment to VPS

**Description**: Deploys a specific version or the latest code to the VPS, including database backup and container rebuild.

**Usage**:
```bash
./deploy.sh [TAG]
```

**Parameters**:
- `TAG` (optional): Git tag to deploy (e.g., `v1.2.3`). If omitted, deploys current state.

**Example**:
```bash
# Deploy current state
./deploy.sh

# Deploy specific release
./deploy.sh v1.2.3
```

**What it does**:
1. Optionally checks out specified git tag
2. Creates pre-deployment database backup
3. Asks for confirmation
4. Builds Docker containers
5. Stops old containers
6. Starts new containers
7. Displays status and logs

**Safety**: Always creates a backup before deployment and asks for confirmation.

---

## Database Scripts

Database backup and restore scripts are located in `docker/postgres/scripts/`. See the [DEPLOYMENT.md](../DEPLOYMENT.md#database-backups) for details.

---

## Automated Deployment

For automated deployments via GitHub Actions, see:
- [DEPLOYMENT.md - Automated Deployment](../DEPLOYMENT.md#automated-deployment-github-actions)
- [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)

---

## Security Notes

1. **SSH Keys**: Ensure your SSH private key is secure and not committed to the repository
2. **Secrets**: Never commit files from `docker/secrets/` to git
3. **Environment Files**: The `.env` files contain sensitive data and are gitignored

---

## Troubleshooting

### "Permission denied" error
Make sure the script is executable:
```bash
chmod +x ./vps-bootstrap.sh
chmod +x ./deploy.sh
```

### "Docker not found" after installation
Log out and back in to apply group membership changes:
```bash
exit
ssh user@vps-ip
```

### Deployment fails
1. Check container logs: `docker compose logs -f`
2. Verify secrets exist: `ls -la docker/secrets/`
3. Check environment file: `cat packages/backend/.env`

---

## See Also

- [Main README](../README.md) - Project overview and local development
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
