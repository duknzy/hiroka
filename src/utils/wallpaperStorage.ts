export interface WallpaperSettings {
  imageUrl: string | null;
  opacity: number; // 0.05 to 0.70
  blur: number; // 0 to 20 px
  overlay: 'light' | 'dark';
}

const STORAGE_KEY = 'passroute_custom_wallpaper_v1';

export const DEFAULT_WALLPAPER_SETTINGS: WallpaperSettings = {
  imageUrl: null,
  opacity: 0.15,
  blur: 4,
  overlay: 'light',
};

export function loadWallpaperSettings(): WallpaperSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_WALLPAPER_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load wallpaper from localStorage:', e);
  }
  return DEFAULT_WALLPAPER_SETTINGS;
}

export function saveWallpaperSettings(settings: WallpaperSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save wallpaper to localStorage:', e);
  }
}

export function clearWallpaperSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}

/**
 * Resizes and compresses an uploaded image file into a DataURL (JPEG 0.85, max dimension 1920)
 * to ensure it fits comfortably within localStorage without lag or quota errors.
 */
export async function processUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
