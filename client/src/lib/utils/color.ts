// Predefined colors from the design specification
export const COLORS = {
  SOFT_CORAL: '#F8A195',
  SAGE_GREEN: '#B3C9AB',
  SKY_BLUE: '#A4CCE3',
  DUSTY_LAVENDER: '#C3B1D0',
  SOFT_YELLOW: '#E8D3A2',
  OFF_WHITE: '#FAFAFA',
  LIGHT_GRAY: '#F0F0F0',
  TEXT_GRAY: '#7A7A7A',
  DIVIDER_GRAY: '#DADADA',
  RICH_BLACK: '#111111'
};

// Default weekday colors
export const WEEKDAY_COLORS = [
  COLORS.SOFT_CORAL,
  COLORS.SAGE_GREEN,
  COLORS.SKY_BLUE,
  COLORS.DUSTY_LAVENDER,
  COLORS.SOFT_CORAL,
  COLORS.SOFT_YELLOW,
  COLORS.SOFT_YELLOW
];

// Function to ensure text color has sufficient contrast with background
export function getTextColor(backgroundColor: string): string {
  // Remove the '#' character if present
  const hex = backgroundColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.6 ? COLORS.RICH_BLACK : '#FFFFFF';
}

// Function to get a weather icon based on condition code
export function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': 'sun',
    'Clouds': 'cloud',
    'Rain': 'cloud-rain',
    'Drizzle': 'cloud-drizzle',
    'Thunderstorm': 'cloud-lightning',
    'Snow': 'cloud-snow',
    'Mist': 'cloud-fog',
    'Smoke': 'cloud-fog',
    'Haze': 'cloud-fog',
    'Dust': 'wind',
    'Fog': 'cloud-fog',
    'Sand': 'wind',
    'Ash': 'wind',
    'Squall': 'wind',
    'Tornado': 'wind'
  };

  return iconMap[condition] || 'sun';
}

// Function to get hexadecimal from a color name
export function getHexFromColorName(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    'soft-coral': COLORS.SOFT_CORAL,
    'sage-green': COLORS.SAGE_GREEN,
    'sky-blue': COLORS.SKY_BLUE,
    'dusty-lavender': COLORS.DUSTY_LAVENDER,
    'soft-yellow': COLORS.SOFT_YELLOW
  };

  return colorMap[colorName.toLowerCase()] || COLORS.SOFT_CORAL;
}

// Color palette for user selection
export const colorPalette = [
  { name: 'Coral', value: '#F8A195' },
  { name: 'Sage', value: '#B3C9AB' },
  { name: 'Sky', value: '#A4CCE3' },
  { name: 'Lavender', value: '#C3B1D0' },
  { name: 'Sand', value: '#E8D3A2' },
  { name: 'Ocean', value: '#64B5F6' },
  { name: 'Forest', value: '#81C784' },
  { name: 'Berry', value: '#E57373' },
  { name: 'Royal', value: '#9575CD' },
  { name: 'Mint', value: '#4DB6AC' }
];