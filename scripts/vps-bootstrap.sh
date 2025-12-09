#!/usr/bin/env bash
# VPS Bootstrap Script - Fully Automated Setup
#
# This script can be run directly from GitHub:
#   bash <(curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/vps-bootstrap.sh) [DOMAIN] [EMAIL]
#
# Or downloaded and run locally:
#   curl -fsSL https://raw.githubusercontent.com/lfsc09/kdongs-mono/main/scripts/vps-bootstrap.sh -o vps-bootstrap.sh
#   chmod +x vps-bootstrap.sh
#   sudo ./vps-bootstrap.sh [DOMAIN] [EMAIL]
#
# This script must be run as root initially, then it will:
# 1. Create kdongs user
# 2. Install Docker, rclone, and dependencies
# 3. Configure firewall
# 4. Switch to kdongs user and complete setup
# 5. Clone repository
# 6. Generate secrets
# 7. Setup automated backups

set -euo pipefail

# --- CONFIG ---
DEPLOY_USER="kdongs"
REPO_URL="git@github.com:lfsc09/kdongs-mono.git"
TARGET_DIR="/var/www/kdongs-mono"
BRANCH="main"
DOMAIN="${1:-example.com}"
EMAIL="${2:-admin@example.com}"
# ----------------

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo "========================================="
    echo "$1"
    echo "========================================="
}

# Check if script is run as root
is_root() {
    [ "$EUID" -eq 0 ]
}

# Check if user exists
user_exists() {
    id "$1" &>/dev/null
}

# Check if command exists
command_exists() {
    command -v "$1" &>/dev/null
}

# Root setup phase
setup_as_root() {
    print_header "Kdongs VPS Bootstrap - Root Setup Phase"
    log_info "Domain: $DOMAIN"
    log_info "Email: $EMAIL"
    log_info "Deploy User: $DEPLOY_USER"
    log_info "Target Directory: $TARGET_DIR"
    echo ""

    # 1. Create deploy user if doesn't exist
    if user_exists "$DEPLOY_USER"; then
        log_info "User '$DEPLOY_USER' already exists"
    else
        log_info "Creating user '$DEPLOY_USER'..."
        useradd -m -s /bin/bash "$DEPLOY_USER"
        log_info "Setting up sudo access..."
        usermod -aG sudo "$DEPLOY_USER"
        echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER
        chmod 0440 /etc/sudoers.d/$DEPLOY_USER
        log_info "✅ User '$DEPLOY_USER' created with sudo access"
    fi

    # 2. Update system
    log_info "Updating system packages..."
    apt-get update -qq
    apt-get upgrade -y -qq
    log_info "✅ System updated"

    # 3. Install Docker if needed
    if command_exists docker; then
        log_info "Docker already installed"
    else
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
        usermod -aG docker "$DEPLOY_USER"
        systemctl enable docker >/dev/null 2>&1
        systemctl start docker >/dev/null 2>&1
        log_info "✅ Docker installed"
    fi

    # 4. Install dependencies
    log_info "Installing dependencies..."
    apt-get install -y -qq \
        docker-compose-plugin \
        git \
        openssl \
        curl \
        ca-certificates \
        ufw \
        fail2ban \
        unattended-upgrades \
        >/dev/null 2>&1
    log_info "✅ Dependencies installed"

    # 5. Install rclone
    if command_exists rclone; then
        log_info "rclone already installed"
    else
        log_info "Installing rclone..."
        curl -fsSL https://rclone.org/install.sh | bash >/dev/null 2>&1
        log_info "✅ rclone installed"
    fi

    # 6. Configure firewall
    log_info "Configuring firewall (UFW)..."

    # Disable first to reset
    ufw --force disable >/dev/null 2>&1 || true

    # Set defaults
    ufw default deny incoming >/dev/null 2>&1
    ufw default allow outgoing >/dev/null 2>&1

    # Allow SSH (important!)
    ufw allow 22/tcp >/dev/null 2>&1

    # Allow HTTP/HTTPS
    ufw allow 80/tcp >/dev/null 2>&1
    ufw allow 443/tcp >/dev/null 2>&1

    # Enable firewall
    ufw --force enable >/dev/null 2>&1

    log_info "✅ Firewall configured"
    log_info "   - SSH (22/tcp): allowed"
    log_info "   - HTTP (80/tcp): allowed"
    log_info "   - HTTPS (443/tcp): allowed"

    # 7. Configure fail2ban
    log_info "Configuring fail2ban..."
    if [ -f /etc/fail2ban/jail.conf ] && [ ! -f /etc/fail2ban/jail.local ]; then
        cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    fi
    systemctl enable fail2ban >/dev/null 2>&1
    systemctl start fail2ban >/dev/null 2>&1
    log_info "✅ fail2ban configured"

    # 8. Enable automatic security updates
    log_info "Enabling automatic security updates..."
    cat > /etc/apt/apt.conf.d/50unattended-upgrades <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
    log_info "✅ Automatic security updates enabled"

    # 9. Create target directory with proper ownership
    log_info "Setting up target directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
    chown -R "$DEPLOY_USER:$DEPLOY_USER" "$TARGET_DIR"
    log_info "✅ Directory created and owned by $DEPLOY_USER"

    # 10. Setup SSH directory for deploy user
    DEPLOY_HOME=$(eval echo ~$DEPLOY_USER)
    if [ ! -d "$DEPLOY_HOME/.ssh" ]; then
        log_info "Setting up SSH directory for $DEPLOY_USER..."
        mkdir -p "$DEPLOY_HOME/.ssh"
        chmod 700 "$DEPLOY_HOME/.ssh"
        touch "$DEPLOY_HOME/.ssh/authorized_keys"
        chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh"
        log_info "✅ SSH directory created"
        log_warn "Don't forget to add your SSH public key to $DEPLOY_HOME/.ssh/authorized_keys"
    fi

    print_header "Root Setup Complete"
    log_info "Switching to user '$DEPLOY_USER' for application setup..."
    echo ""

    # Switch to deploy user and continue
    # Export variables for the user phase
    export DOMAIN EMAIL TARGET_DIR BRANCH REPO_URL

    # Run user phase as deploy user
    sudo -u "$DEPLOY_USER" -H bash -c "$(declare -f setup_as_user log_info log_warn log_error print_header command_exists); setup_as_user"
}

# User setup phase
setup_as_user() {
    print_header "Kdongs VPS Bootstrap - User Setup Phase"

    # Verify we're not root
    if [ "$EUID" -eq 0 ]; then
        log_error "User setup should not run as root!"
        exit 1
    fi

    log_info "Running as user: $(whoami)"
    log_info "Home directory: $HOME"
    echo ""

    # 1. Clone or update repository
    log_info "Setting up repository..."
    if [ ! -d "$TARGET_DIR/.git" ]; then
        log_info "Cloning repository from $REPO_URL..."
        log_warn "NOTE: If this fails, you may need to setup SSH keys for git access"
        log_warn "      Run: ssh-keygen -t ed25519 -C 'deploy@kdongs.com'"
        log_warn "      Add the public key to your GitHub account"

        # Try to clone
        if ! git clone --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR" 2>/dev/null; then
            log_error "Failed to clone repository"
            log_warn "This is likely because SSH keys are not setup for GitHub"
            log_warn "Please setup SSH keys and run this script again, or clone manually"
            exit 1
        fi
        log_info "✅ Repository cloned successfully"
    else
        log_info "Repository already exists, pulling latest changes..."
        cd "$TARGET_DIR"
        git fetch origin >/dev/null 2>&1
        git checkout "$BRANCH" >/dev/null 2>&1
        git pull origin "$BRANCH" >/dev/null 2>&1
        log_info "✅ Repository updated"
    fi

    cd "$TARGET_DIR"

    # 2. Generate Docker secrets
    log_info "Generating Docker secrets..."
    SECRETS_DIR="$TARGET_DIR/docker/secrets"
    mkdir -p "$SECRETS_DIR"

    # Generate database password
    DB_PASSWORD_FILE="$SECRETS_DIR/root_pass"
    if [ ! -f "$DB_PASSWORD_FILE" ]; then
        log_info "Generating database password..."
        openssl rand -base64 32 | tr -d "=+/" | cut -c1-32 > "$DB_PASSWORD_FILE"
        chmod 600 "$DB_PASSWORD_FILE"
        log_info "✅ Database password generated"
    else
        log_info "Database password already exists"
    fi

    # Generate APP_KEY as a secret
    APP_KEY_FILE="$SECRETS_DIR/app_key"
    if [ ! -f "$APP_KEY_FILE" ]; then
        log_info "Generating APP_KEY..."
        openssl rand -base64 32 > "$APP_KEY_FILE"
        chmod 600 "$APP_KEY_FILE"
        log_info "✅ APP_KEY generated"
    else
        log_info "APP_KEY already exists"
    fi

    # 4. Update domain in nginx config
    log_info "Configuring domain: $DOMAIN"
    NGINX_CONFIG="$TARGET_DIR/docker/nginx/conf.d/site.conf"
    if [ -f "$NGINX_CONFIG" ]; then
        # Replace placeholder domain with actual domain
        sed -i "s/example\.com/$DOMAIN/g" "$NGINX_CONFIG"
        sed -i "s/www\.example\.com/www.$DOMAIN/g" "$NGINX_CONFIG"
        log_info "✅ Nginx configuration updated"
    fi

    # 5. Set proper permissions
    log_info "Setting proper permissions..."
    chmod 700 "$SECRETS_DIR"
    chmod 600 "$SECRETS_DIR"/* 2>/dev/null || true
    log_info "✅ Permissions set"

    # 6. Setup automated backups via crontab
    log_info "Setting up automated database backups..."
    BACKUP_SCRIPT="$TARGET_DIR/docker/postgres/scripts/auto-backup.sh"
    CRON_JOB="0 2 * * * $BACKUP_SCRIPT 7 >> /var/log/kdongs-backup.log 2>&1"

    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        log_info "Backup cron job already exists"
    else
        # Add cron job
        (crontab -l 2>/dev/null || echo ""; echo "$CRON_JOB") | crontab -
        log_info "✅ Automated backups configured (daily at 2 AM, 7-day retention)"
    fi

    # 7. Create backup directory
    BACKUP_DIR="$TARGET_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    log_info "✅ Backup directory created: $BACKUP_DIR"

    print_header "Bootstrap Completed Successfully!"

    echo ""
    log_info "📋 Summary:"
    log_info "   User: $DEPLOY_USER"
    log_info "   Directory: $TARGET_DIR"
    log_info "   Domain: $DOMAIN"
    log_info "   Email: $EMAIL"
    log_info "   Database Password: $DB_PASSWORD_FILE"
    log_info "   Backend .env: $ENV_FILE"
    echo ""

    print_header "Next Steps"
    echo ""
    echo "1️⃣  Configure rclone for remote backups (optional but recommended):"
    echo "    sudo rclone config"
    echo "    Then add to crontab:"
    echo "    0 3 * * * rclone sync $BACKUP_DIR/ remote:kdongs-backups/"
    echo ""
    echo "2️⃣  Setup SSH key for GitHub (if not done):"
    echo "    ssh-keygen -t ed25519 -C '$EMAIL'"
    echo "    cat ~/.ssh/id_ed25519.pub"
    echo "    Add the public key to GitHub: https://github.com/settings/keys"
    echo ""
    echo "3️⃣  Obtain SSL certificate:"
    echo "    cd $TARGET_DIR/docker"
    echo "    docker compose up -d nginx"
    echo "    docker compose run --rm certbot certonly \\"
    echo "      --webroot -w /var/www/certbot \\"
    echo "      -d $DOMAIN -d www.$DOMAIN \\"
    echo "      --email $EMAIL \\"
    echo "      --agree-tos"
    echo ""
    echo "4️⃣  Start the application:"
    echo "    cd $TARGET_DIR/docker"
    echo "    docker compose up -d"
    echo ""
    echo "5️⃣  Check logs:"
    echo "    docker compose logs -f"
    echo ""
    echo "6️⃣  Check container status:"
    echo "    docker compose ps"
    echo ""
    print_header "Important Security Notes"
    echo ""
    log_warn "🔐 Firewall Status:"
    sudo ufw status numbered
    echo ""
    log_warn "🔐 Secrets generated:"
    log_warn "    - Database password: $DB_PASSWORD_FILE"
    log_warn "    - APP_KEY: $APP_KEY_FILE"
    log_warn "🔐 Keep the secrets directory secure!"
    log_warn "🔐 NEVER commit docker/secrets/ to git!"
    log_warn "🔐 Setup SSH keys for GitHub access"
    log_warn "🔐 Configure rclone for remote backups"
    echo ""
    print_header "Setup Complete"
}

# Main execution
main() {
    print_header "Kdongs VPS Bootstrap Script"

    # Validate domain
    if [ "$DOMAIN" = "example.com" ]; then
        log_warn "Using default domain 'example.com'"
        log_warn "For production, run with: $0 your-domain.com your-email@example.com"
        echo ""
    fi

    # Check execution context
    if is_root; then
        log_info "Running as root - executing root setup phase"
        setup_as_root
    else
        # If running as non-root directly, skip to user setup
        # This allows the script to be re-run as user if needed
        log_warn "Running as non-root user: $(whoami)"
        log_info "Assuming root setup is already complete"
        log_info "Proceeding with user setup..."
        echo ""
        setup_as_user
    fi
}

# Run main function
main "$@"
