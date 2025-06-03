import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import { useSettings } from '@/lib/hooks/useSettings';
import { useEffect } from 'react';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.theme) {
      const root = document.documentElement;

      // Apply dark/light mode
      if (settings.theme.mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Apply font size
      const fontSizeMap = { small: '14px', normal: '16px', large: '18px' };
      const fontSize = fontSizeMap[settings.theme.fontSize || 'normal'];
      document.body.style.fontSize = fontSize;
      root.style.setProperty('--font-size-base', fontSize);

      // Apply accent color
      if (settings.theme.accentColor) {
        const color = settings.theme.accentColor.replace('#', '');
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        // Convert RGB to HSL
        const rgbToHsl = (r: number, g: number, b: number) => {
          r /= 255; g /= 255; b /= 255;
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }

          return [h * 360, s * 100, l * 100];
        };

        const [h, s, l] = rgbToHsl(r, g, b);
        root.style.setProperty('--accent-hsl', `${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%`);
      }

      // Apply weekday colors
      if (settings.theme.weekdays) {
        settings.theme.weekdays.forEach((color, index) => {
          root.style.setProperty(`--day-color-${index}`, color);
        });
      }

      // Apply weekend color
      if (settings.theme.weekend) {
        root.style.setProperty('--weekend-color', settings.theme.weekend);
      }
    }
  }, [settings.theme]);

  useEffect(() => {
    if (settings?.timeFormat === '24h') {
      document.documentElement.setAttribute('data-time-format', '24h');
    } else {
      document.documentElement.setAttribute('data-time-format', '12h');
    }
  }, [settings?.timeFormat]);

  // Pi-specific optimizations
  useEffect(() => {
    // Disable text selection for cleaner kiosk mode
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Optimize for 25" monitor viewing distance
    document.documentElement.style.fontSize = '18px';

    // Add keyboard shortcuts for Pi without touch
    const handleKeyboard = (e: KeyboardEvent) => {
      // F11 for fullscreen toggle
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
      // Escape to exit screensaver
      if (e.key === 'Escape') {
        // This will be handled by the screensaver component
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background cursor-default">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}