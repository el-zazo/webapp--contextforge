export const DEFAULT_EXCLUDED_PATTERNS = [
  'node_modules/',
  '.git/',
  'dist/',
  'build/',
  '.env',
  '.env.local',
  '*.lock',
  '*.log',
];

export const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico',
  '.mp4', '.mp3', '.wav', '.ogg', '.avi', '.mov',
  '.pdf', '.zip', '.rar', '.7z', '.tar', '.gz',
  '.exe', '.dll', '.so', '.dylib',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.psd', '.ai', '.sketch', '.fig',
  '.db', '.sqlite', '.bin',
]);

export const STEPS = [
  { id: 1, label: 'Configuration' },
  { id: 2, label: 'Import & Select' },
  { id: 3, label: 'Generated Messages' },
];
