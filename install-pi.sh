
#!/bin/bash

# Family Dashboard - Raspberry Pi Automated Installation Script
# Run with: GITHUB_REPO=manandbeard/family-dashboard curl -sSL https://raw.githubusercontent.com/manandbeard/family-dashboard/main/install-pi.sh | bash

set -e

echo "🏠 Family Dashboard - Raspberry Pi Installation"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    print_warning "This script is designed for Raspberry Pi. Continuing anyway..."
fi

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root (don't use sudo)"
   exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing required packages..."
sudo apt install -y git curl chromium-browser unzip

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js ${node_version} and npm ${npm_version} installed"

# Create project directory
PROJECT_DIR="/home/nhell/family-dashboard"
print_status "Setting up project directory at ${PROJECT_DIR}..."

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Project directory already exists. Backing up..."
    sudo mv "$PROJECT_DIR" "${PROJECT_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Download project files from GitHub
print_status "Downloading Family Dashboard files..."
if [ -z "$GITHUB_REPO" ]; then
    echo "Usage: GITHUB_REPO=manandbeard/family-dashboard $0"
    echo "Or edit this script to set your GitHub repository URL"
    read -p "Enter your GitHub repository (format: username/repo-name): " GITHUB_REPO
fi

if [ -n "$GITHUB_REPO" ]; then
    git clone "https://github.com/manandbeard/family-dashboard.git" .
    print_success "Downloaded files from GitHub repository: ${GITHUB_REPO}"
else
    print_error "No GitHub repository specified. Exiting."
    exit 1
fi

# Create necessary directories
mkdir -p family-photos
mkdir -p server/photos

# Install npm dependencies (if package.json exists)
if [ -f "package.json" ]; then
    print_status "Installing npm dependencies..."
    npm install
    
    print_status "Building application..."
    npm run build
else
    print_warning "package.json not found. Please copy your project files first."
fi

# Make scripts executable
print_status "Setting up executable permissions..."
chmod +x pi-startup.sh 2>/dev/null || print_warning "pi-startup.sh not found"

# Create kiosk startup script
print_status "Creating kiosk startup script..."
cat > start-kiosk.sh << 'EOF'
#!/bin/bash

# Wait for network
sleep 10

# Start Family Dashboard in kiosk mode
DISPLAY=:0 chromium-browser \
    --kiosk \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --disable-features=TranslateUI \
    --disable-ipc-flooding-protection \
    --aggressive-cache-discard \
    --memory-pressure-off \
    --max_old_space_size=100 \
    http://localhost:5000 &
EOF

chmod +x start-kiosk.sh

# Install systemd service
if [ -f "family-dashboard.service" ]; then
    print_status "Installing systemd service..."
    sudo cp family-dashboard.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable family-dashboard.service
else
    print_warning "family-dashboard.service not found. Service not installed."
fi

# Set up autostart for kiosk mode
print_status "Setting up kiosk mode autostart..."
mkdir -p /home/nhell/.config/autostart

cat > /home/nhell/.config/autostart/family-dashboard.desktop << EOF
[Desktop Entry]
Type=Application
Name=Family Dashboard Kiosk
Exec=${PROJECT_DIR}/start-kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

# Performance optimizations
print_status "Applying performance optimizations..."

# GPU memory split
if ! grep -q "gpu_mem=" /boot/config.txt; then
    echo 'gpu_mem=128' | sudo tee -a /boot/config.txt
fi

# Hardware acceleration
if ! grep -q "dtoverlay=vc4-kms-v3d" /boot/config.txt; then
    echo 'dtoverlay=vc4-kms-v3d' | sudo tee -a /boot/config.txt
fi

# Disable unnecessary services
print_status "Disabling unnecessary services..."
sudo systemctl disable bluetooth 2>/dev/null || true
sudo systemctl disable cups 2>/dev/null || true
sudo systemctl disable triggerhappy 2>/dev/null || true

# Create sample photos directory with proper permissions
print_status "Setting up photos directory..."
sudo chown -R pi:pi /home/nhell/family-dashboard/family-photos
sudo chmod 755 /home/nhell/family-dashboard/family-photos

print_success "Installation completed!"
echo ""
echo "=============================================="
echo "🎉 Family Dashboard Installation Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Copy your Family Dashboard project files to: ${PROJECT_DIR}"
echo "2. Add photos to: ${PROJECT_DIR}/family-photos/"
echo "3. Start the service: sudo systemctl start family-dashboard.service"
echo "4. Reboot to start kiosk mode: sudo reboot"
echo ""
echo "Access your dashboard at: http://localhost:5000"
echo "Or from network: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "Logs: sudo journalctl -u family-dashboard.service -f"
echo "Status: sudo systemctl status family-dashboard.service"
echo ""
print_warning "Remember to configure your settings (weather API, etc.) in the dashboard!"
EOF
