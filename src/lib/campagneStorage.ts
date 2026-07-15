import path from 'path';

export const VIDEO_DIR = 'C:\\VideoCampagne';

export const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska',
};

export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 Mo

// path.basename empêche toute tentative de traversée de répertoire (../..)
export function resolveVideoPath(fileName: string): string {
  return path.join(VIDEO_DIR, path.basename(fileName));
}
