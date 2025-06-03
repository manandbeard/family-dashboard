
# Family Dashboard - Raspberry Pi Installation Guide

This guide will help you install and configure the Family Dashboard on a Raspberry Pi 4 for optimal performance on a 25" monitor.

## Recommended Operating System

**Raspberry Pi OS 64-bit (Bookworm)** - Latest stable version
- Download from: https://www.raspberrypi.com/software/
- Use Raspberry Pi Imager for easy installation
- Enable SSH during imaging if you want remote access

## Prerequisites

1. Raspberry Pi 4 (4GB+ RAM recommended) with Raspberry Pi OS 64-bit
2. 25" monitor connected via HDMI
3. Keyboard and mouse (for initial setup)
4. Internet connection
5. MicroSD card (32GB+ recommended)

## Automated Installation

Run this single command to automatically install everything (replace `yourusername/family-dashboard` with your actual GitHub repository):

```bash
GITHUB_REPO=yourusername/family-dashboard curl -sSL https://raw.githubusercontent.com/yourusername/family-dashboard/main/install-pi.sh | bash
```

Or download and run the installation script manually:

```bash
wget https://raw.githubusercontent.com/yourusername/family-dashboard/main/install-pi.sh
chmod +x install-pi.sh
GITHUB_REPO=yourusername/family-dashboard ./install-pi.sh
```

## Manual Installation Steps

### 1. Update Your Pi
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl chromium-browser
```

### 2. Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Clone/Copy Your Project
```bash
cd /home/pi
# Copy your project files here or clone from repository
# Make sure all files from your Replit are in /home/pi/family-dashboard/
```

### 4. Install Dependencies and Build
```bash
cd /home/pi/family-dashboard
npm install
npm run build
```

### 5. Set Up Auto-Start Service
```bash
sudo cp family-dashboard.service /etc/systemd/system/
sudo systemctl enable family-dashboard.service
sudo systemctl start family-dashboard.service
```

### 6. Configure Kiosk Mode
```bash
# Create autostart directory
mkdir -p /home/pi/.config/autostart

# Create kiosk autostart file
cat > /home/pi/.config/autostart/family-dashboard.desktop << EOF
[Desktop Entry]
Type=Application
Name=Family Dashboard Kiosk
Exec=/home/pi/family-dashboard/start-kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF
```

## Performance Optimizations

### GPU Memory Split
```bash
sudo raspi-config
# Advanced Options > Memory Split > Set to 128 or 256
```

### Enable hardware acceleration
```bash
echo 'gpu_mem=128' | sudo tee -a /boot/config.txt
echo 'dtoverlay=vc4-kms-v3d' | sudo tee -a /boot/config.txt
```

### Disable unnecessary services
```bash
sudo systemctl disable bluetooth
sudo systemctl disable cups
sudo systemctl disable triggerhappy
```

## Network Configuration

The dashboard runs on port 5000 and is accessible at:
- Local: http://localhost:5000
- Network: http://[PI_IP_ADDRESS]:5000

To find your Pi's IP address:
```bash
hostname -I
```

## Troubleshooting

### Check service status
```bash
sudo systemctl status family-dashboard.service
```

### View logs
```bash
sudo journalctl -u family-dashboard.service -f
```

### Manual start for testing
```bash
cd /home/pi/family-dashboard
./pi-startup.sh
```

### Restart the dashboard
```bash
sudo systemctl restart family-dashboard.service
```

## Keyboard Shortcuts

- **F11**: Toggle fullscreen in browser
- **Escape**: Exit screensaver
- **Ctrl+Shift+I**: Open developer tools (for debugging)
- **Ctrl+R**: Refresh page

## Auto-Updates

To set up automatic updates, create a cron job:
```bash
crontab -e
# Add this line to check for updates daily at 3 AM:
0 3 * * * cd /home/pi/family-dashboard && git pull && npm run build && sudo systemctl restart family-dashboard.service
```

## Directory Structure

```
/home/pi/family-dashboard/
├── server/           # Backend server files
├── client/           # Frontend files
├── family-photos/    # Photo storage directory
├── pi-startup.sh     # Startup script
├── start-kiosk.sh    # Kiosk mode script
└── family-dashboard.service  # Systemd service file
```

## Default Settings

- **Port**: 5000
- **Photo Directory**: `/home/pi/family-dashboard/family-photos`
- **Screensaver**: 10 minutes
- **Time Format**: 12-hour
- **Weather**: Default demo data (add API key in settings)

## Support

If you encounter issues:
1. Check the service logs
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Try manual startup for debugging
