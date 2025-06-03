
#!/bin/bash

# Family Dashboard Kiosk Mode Startup Script

echo "Starting Family Dashboard in Kiosk Mode..."

# Wait for network and X server
sleep 15

# Wait for the dashboard service to be ready
while ! curl -s http://localhost:5000 > /dev/null; do
    echo "Waiting for Family Dashboard to start..."
    sleep 5
done

echo "Family Dashboard is ready, starting kiosk mode..."

# Start Chromium in kiosk mode
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
    --max_old_space_size=200 \
    --disable-background-timer-throttling \
    --disable-renderer-backgrounding \
    --disable-backgrounding-occluded-windows \
    --autoplay-policy=no-user-gesture-required \
    http://localhost:5000
