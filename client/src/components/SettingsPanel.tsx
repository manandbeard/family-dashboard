import { useState, useEffect } from 'react';
import { X, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppSettings, CalendarFeed, InsertCalendarFeed } from '@shared/schema';
import { colorPalette } from '@/lib/utils/color';

interface SettingsPanelProps {
  active: boolean;
  settings: AppSettings;
  feeds: CalendarFeed[];
  onClose: () => void;
  onUpdateSetting: (key: string, value: any) => Promise<boolean>;
  onResetDefaults: () => Promise<boolean>;
  onAddCalendarFeed: (feed: InsertCalendarFeed) => Promise<boolean>;
  onUpdateCalendarFeed: (id: number, feed: Partial<InsertCalendarFeed>) => Promise<boolean>;
  onDeleteCalendarFeed: (id: number) => Promise<boolean>;
  onRefreshCalendars: () => Promise<boolean>;
  isRefreshing?: boolean;
  uploadPhoto: (file: File) => Promise<void>;
}

export function SettingsPanel({ 
  active, 
  settings, 
  feeds,
  onClose, 
  onUpdateSetting, 
  onResetDefaults,
  onAddCalendarFeed,
  onUpdateCalendarFeed,
  onDeleteCalendarFeed,
  onRefreshCalendars,
  isRefreshing = false,
  uploadPhoto
}: SettingsPanelProps) {
  const [isAddCalendarOpen, setIsAddCalendarOpen] = useState(false);
  const [newCalendar, setNewCalendar] = useState<Partial<InsertCalendarFeed>>({
    name: '',
    url: '',
    color: '#F8A195',
    type: 'person',
    active: true
  });
  
  // Get the meal calendar (if any)
  const mealCalendar = feeds.find(feed => feed.type === 'meal');
  
  // Get person calendars
  const personCalendars = feeds.filter(feed => feed.type === 'person');
  
  const handleAddCalendar = async () => {
    if (!newCalendar.name || !newCalendar.url) return;
    
    const success = await onAddCalendarFeed(newCalendar as InsertCalendarFeed);
    if (success) {
      setNewCalendar({
        name: '',
        url: '',
        color: '#F8A195',
        type: 'person',
        active: true
      });
      setIsAddCalendarOpen(false);
    }
  };
  
  const updateMealCalendar = async (url: string) => {
    if (mealCalendar) {
      await onUpdateCalendarFeed(mealCalendar.id, { url });
    } else {
      await onAddCalendarFeed({
        name: 'Family Meals',
        url,
        color: '#F8A195',
        type: 'meal',
        active: true
      });
    }
  };
  
  return (
    <div 
      className={`fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-40 overflow-y-auto transition-transform duration-500 ${
        active ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#111111]">Settings</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-[#7A7A7A] hover:text-[#111111]"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Calendar Feeds Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-[#DADADA] pb-2">Calendar Feeds</h3>
          
          <div className="space-y-4">
            {/* Person Calendars */}
            {personCalendars.map(calendar => (
              <div key={calendar.id} className="border border-[#DADADA] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: calendar.color }}
                    ></div>
                    <span className="font-bold">{calendar.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDeleteCalendarFeed(calendar.id)}
                    className="text-[#7A7A7A] hover:text-red-500 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-3">
                  <Label htmlFor={`calendar-url-${calendar.id}`} className="block text-sm text-[#7A7A7A] mb-1">
                    Calendar URL
                  </Label>
                  <Input 
                    id={`calendar-url-${calendar.id}`}
                    value={calendar.url} 
                    onChange={(e) => onUpdateCalendarFeed(calendar.id, { url: e.target.value })}
                    className="w-full text-sm"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm text-[#7A7A7A] mb-1">Color</Label>
                  <div className="flex">
                    {colorPalette.map(color => (
                      <button
                        key={color.value}
                        className={`color-swatch ${calendar.color === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => onUpdateCalendarFeed(calendar.id, { color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add Calendar Button */}
            <Dialog open={isAddCalendarOpen} onOpenChange={setIsAddCalendarOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-[#7A7A7A] text-[#7A7A7A] hover:text-[#111111] hover:border-[#111111]"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Family Member Calendar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="new-calendar-name">Name</Label>
                    <Input 
                      id="new-calendar-name"
                      placeholder="e.g. Mom, Dad, Kids" 
                      value={newCalendar.name || ''}
                      onChange={(e) => setNewCalendar({...newCalendar, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-calendar-url">iCal URL</Label>
                    <Input 
                      id="new-calendar-url"
                      placeholder="https://calendar.google.com/..." 
                      value={newCalendar.url || ''}
                      onChange={(e) => setNewCalendar({...newCalendar, url: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-calendar-type">Calendar Type</Label>
                    <Select 
                      value={newCalendar.type || 'person'} 
                      onValueChange={(value) => setNewCalendar({...newCalendar, type: value})}
                    >
                      <SelectTrigger id="new-calendar-type">
                        <SelectValue placeholder="Select calendar type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="person">Person Calendar</SelectItem>
                        <SelectItem value="meal">Meal Calendar</SelectItem>
                        <SelectItem value="todo">To Do Calendar</SelectItem>
                        <SelectItem value="notes">Notes Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                    {newCalendar.type === 'notes' && (
                      <p className="text-xs text-[#7A7A7A] mt-1">
                        Events from this calendar will appear as family notes
                      </p>
                    )}
                    {newCalendar.type === 'todo' && (
                      <p className="text-xs text-[#7A7A7A] mt-1">
                        Events from this calendar will appear in the To Do List
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex mt-1">
                      {colorPalette.map(color => (
                        <button
                          key={color.value}
                          className={`color-swatch ${newCalendar.color === color.value ? 'selected' : ''}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setNewCalendar({...newCalendar, color: color.value})}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddCalendar}>Add Calendar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Display Settings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-[#DADADA] pb-2">Display Settings</h3>
          
          <div className="space-y-4">
            {/* Photo Slideshow Settings */}
            <div className="space-y-4 mb-4">
              <h4 className="font-semibold text-sm text-[#7A7A7A]">Photo Display Settings</h4>
              
              <div>
                <Label htmlFor="slideshow-interval" className="block text-[#7A7A7A] mb-2">
                  Slideshow Interval
                </Label>
                <Select 
                  value={settings.slideshowInterval?.toString() || "7"} 
                  onValueChange={(value) => onUpdateSetting('slideshowInterval', parseInt(value))}
                >
                  <SelectTrigger id="slideshow-interval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="7">7 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="transition-duration" className="block text-[#7A7A7A] mb-2">
                  Transition Duration
                </Label>
                <Select 
                  value={settings.transitionDuration?.toString() || "750"} 
                  onValueChange={(value) => onUpdateSetting('transitionDuration', parseInt(value))}
                >
                  <SelectTrigger id="transition-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">0.5 seconds</SelectItem>
                    <SelectItem value="750">0.75 seconds</SelectItem>
                    <SelectItem value="1000">1 second</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transition-style" className="block text-[#7A7A7A] mb-2">
                  Transition Style
                </Label>
                <Select 
                  value={settings.transitionStyle || "slide"} 
                  onValueChange={(value) => onUpdateSetting('transitionStyle', value)}
                >
                  <SelectTrigger id="transition-style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slide">Slide</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Format */}
            <div className="flex items-center justify-between">
              <Label className="text-[#7A7A7A]">Time Format</Label>
              <RadioGroup 
                value={settings.timeFormat} 
                onValueChange={(value) => onUpdateSetting('timeFormat', value)}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="12h" id="time-12h" />
                  <Label htmlFor="time-12h">12-hour</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="24h" id="time-24h" />
                  <Label htmlFor="time-24h">24-hour</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Screensaver Timeout */}
            <div>
              <Label htmlFor="screensaver-timeout" className="block text-[#7A7A7A] mb-2">
                Screensaver Timeout
              </Label>
              <Select 
                value={settings.screensaverTimeout.toString()} 
                onValueChange={(value) => onUpdateSetting('screensaverTimeout', parseInt(value))}
              >
                <SelectTrigger id="screensaver-timeout">
                  <SelectValue placeholder="Select timeout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Photo Directory */}
            <div>
              <Label htmlFor="photo-directory" className="block text-[#7A7A7A] mb-2">
                Photo Directory
              </Label>
              <div className="flex">
                <Input 
                  id="photo-directory"
                  value={settings.photoDirectory} 
                  onChange={(e) => onUpdateSetting('photoDirectory', e.target.value)}
                  className="flex-grow rounded-r-none"
                />
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => uploadPhoto(file));
                    e.target.value = ''; // Reset input
                  }}
                />
                <Button 
                  variant="default" 
                  className="rounded-l-none bg-[#111111]"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  Upload Photos
                </Button>
              </div>
              <p className="text-xs mt-1 text-[#7A7A7A]">
                Restart required for directory changes to take effect
              </p>
            </div>
            
            {/* Weather Location */}
            <div>
              <Label htmlFor="weather-location" className="block text-[#7A7A7A] mb-2">
                Weather Location (Zipcode)
              </Label>
              <Input 
                id="weather-location"
                placeholder="Enter zipcode (e.g. 90210)"
                value={settings.weatherLocation === 'auto' ? '' : settings.weatherLocation}
                onChange={(e) => onUpdateSetting('weatherLocation', e.target.value || 'auto')}
              />
              <p className="text-xs text-[#7A7A7A] mt-1">
                Leave empty for automatic location detection
              </p>
            </div>

            {/* Family Name */}
            <div>
              <Label htmlFor="family-name" className="block text-[#7A7A7A] mb-2">
                Family Name
              </Label>
              <Input 
                id="family-name"
                value={settings.familyName} 
                onChange={(e) => onUpdateSetting('familyName', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Meals Calendar Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-[#DADADA] pb-2">Meals Calendar</h3>
          
          <div>
            <Label htmlFor="meals-calendar-url" className="block text-[#7A7A7A] mb-2">
              Meals Calendar URL
            </Label>
            <Input 
              id="meals-calendar-url"
              value={mealCalendar?.url || ''} 
              onChange={(e) => updateMealCalendar(e.target.value)}
              className="w-full text-sm"
            />
            <p className="text-xs text-[#7A7A7A] mt-1">
              Events from this calendar will appear in the "MEAL" section
            </p>
          </div>
        </div>

        {/* To Do List Calendar */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-[#DADADA] pb-2">To Do List Calendar</h3>
          
          <div>
            <Label htmlFor="todo-calendar-url" className="block text-[#7A7A7A] mb-2">
              To Do List Calendar URL
            </Label>
            <Input 
              id="todo-calendar-url"
              value={feeds.find(feed => feed.type === 'todo')?.url || ''} 
              onChange={(e) => {
                const todoFeed = feeds.find(feed => feed.type === 'todo');
                if (todoFeed) {
                  updateCalendarFeed(todoFeed.id, { url: e.target.value });
                } else {
                  onAddCalendarFeed({
                    name: 'To Do List',
                    url: e.target.value,
                    color: '#F8A195',
                    type: 'todo',
                    active: true
                  });
                }
              }}
              className="w-full text-sm"
            />
            <p className="text-xs text-[#7A7A7A] mt-1">
              Events from this calendar will appear in the To Do List. The event title will become the task title, and the event description will become the task details.
            </p>
          </div>
        </div>
        
        {/* Theme Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-[#DADADA] pb-2">Theme Settings</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme-mode" className="block text-[#7A7A7A] mb-2">
                Theme Mode
              </Label>
              <Select 
                value={settings.theme?.mode || 'light'} 
                onValueChange={(value) => onUpdateSetting('theme', { ...settings.theme, mode: value })}
              >
                <SelectTrigger id="theme-mode">
                  <SelectValue placeholder="Select theme mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-[#7A7A7A] mb-2">
                Accent Color
              </Label>
              <div className="flex gap-2">
                {['#F8A195', '#B3C9AB', '#A4CCE3', '#C3B1D0', '#E8D3A2'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${settings.theme?.accentColor === color ? 'ring-2 ring-offset-2 ring-[#111111]' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onUpdateSetting('theme', { ...settings.theme, accentColor: color })}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="font-size" className="block text-[#7A7A7A] mb-2">
                Font Size
              </Label>
              <Select 
                value={settings.theme?.fontSize || 'normal'} 
                onValueChange={(value) => onUpdateSetting('theme', { ...settings.theme, fontSize: value })}
              >
                <SelectTrigger id="font-size">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b border-[#DADADA] pb-2">System</h3>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-[#111111] text-white"
              onClick={onRefreshCalendars}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing Calendars...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Calendars
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={onResetDefaults}
            >
              Reset to Default Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plus icon component
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
