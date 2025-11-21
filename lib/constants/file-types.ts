// Allowed file types for workspace files (similar to Upwork)

export const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': { ext: '.pdf', category: 'document', icon: '📄' },
  'application/msword': { ext: '.doc', category: 'document', icon: '📄' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', category: 'document', icon: '📄' },
  'text/plain': { ext: '.txt', category: 'document', icon: '📄' },
  'application/rtf': { ext: '.rtf', category: 'document', icon: '📄' },
  'application/vnd.oasis.opendocument.text': { ext: '.odt', category: 'document', icon: '📄' },

  // Spreadsheets
  'application/vnd.ms-excel': { ext: '.xls', category: 'document', icon: '📊' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: '.xlsx', category: 'document', icon: '📊' },
  'text/csv': { ext: '.csv', category: 'document', icon: '📊' },
  'application/vnd.oasis.opendocument.spreadsheet': { ext: '.ods', category: 'document', icon: '📊' },

  // Presentations
  'application/vnd.ms-powerpoint': { ext: '.ppt', category: 'document', icon: '📊' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: '.pptx', category: 'document', icon: '📊' },
  'application/vnd.oasis.opendocument.presentation': { ext: '.odp', category: 'document', icon: '📊' },
  'application/x-iwork-keynote-sffkey': { ext: '.key', category: 'document', icon: '📊' },

  // Images
  'image/jpeg': { ext: '.jpg', category: 'image', icon: '🖼️' },
  'image/png': { ext: '.png', category: 'image', icon: '🖼️' },
  'image/gif': { ext: '.gif', category: 'image', icon: '🖼️' },
  'image/svg+xml': { ext: '.svg', category: 'image', icon: '🖼️' },
  'image/webp': { ext: '.webp', category: 'image', icon: '🖼️' },
  'image/bmp': { ext: '.bmp', category: 'image', icon: '🖼️' },
  'image/tiff': { ext: '.tiff', category: 'image', icon: '🖼️' },
  'image/x-tiff': { ext: '.tif', category: 'image', icon: '🖼️' },

  // Video files
  'video/mp4': { ext: '.mp4', category: 'video', icon: '🎥' },
  'video/quicktime': { ext: '.mov', category: 'video', icon: '🎥' },
  'video/x-msvideo': { ext: '.avi', category: 'video', icon: '🎥' },
  'video/webm': { ext: '.webm', category: 'video', icon: '🎥' },
  'video/x-ms-wmv': { ext: '.wmv', category: 'video', icon: '🎥' },
  'video/x-matroska': { ext: '.mkv', category: 'video', icon: '🎥' },

  // Audio files
  'audio/mpeg': { ext: '.mp3', category: 'audio', icon: '🎵' },
  'audio/wav': { ext: '.wav', category: 'audio', icon: '🎵' },
  'audio/x-wav': { ext: '.wav', category: 'audio', icon: '🎵' },
  'audio/aac': { ext: '.aac', category: 'audio', icon: '🎵' },
  'audio/ogg': { ext: '.ogg', category: 'audio', icon: '🎵' },
  'audio/mp4': { ext: '.m4a', category: 'audio', icon: '🎵' },
  'audio/flac': { ext: '.flac', category: 'audio', icon: '🎵' },

  // Design files
  'image/vnd.adobe.photoshop': { ext: '.psd', category: 'design', icon: '🎨' },
  'application/postscript': { ext: '.ai', category: 'design', icon: '🎨' },
  'application/x-xd': { ext: '.xd', category: 'design', icon: '🎨' },
  'application/x-sketch': { ext: '.sketch', category: 'design', icon: '🎨' },
  'application/x-figma': { ext: '.fig', category: 'design', icon: '🎨' },

  // Archives
  'application/zip': { ext: '.zip', category: 'archive', icon: '📦' },
  'application/x-rar-compressed': { ext: '.rar', category: 'archive', icon: '📦' },
  'application/x-7z-compressed': { ext: '.7z', category: 'archive', icon: '📦' },
  'application/x-tar': { ext: '.tar', category: 'archive', icon: '📦' },
  'application/gzip': { ext: '.gz', category: 'archive', icon: '📦' },

  // Code files
  'text/javascript': { ext: '.js', category: 'code', icon: '💻' },
  'text/typescript': { ext: '.ts', category: 'code', icon: '💻' },
  'application/json': { ext: '.json', category: 'code', icon: '💻' },
  'text/html': { ext: '.html', category: 'code', icon: '💻' },
  'text/css': { ext: '.css', category: 'code', icon: '💻' },
  'text/x-python': { ext: '.py', category: 'code', icon: '💻' },
  'text/x-java': { ext: '.java', category: 'code', icon: '💻' },
  'text/x-c': { ext: '.c', category: 'code', icon: '💻' },
  'text/x-c++': { ext: '.cpp', category: 'code', icon: '💻' },
  'text/x-php': { ext: '.php', category: 'code', icon: '💻' },
  'text/x-ruby': { ext: '.rb', category: 'code', icon: '💻' },
  'text/x-go': { ext: '.go', category: 'code', icon: '💻' },
  'text/x-rust': { ext: '.rs', category: 'code', icon: '💻' },
  'text/x-swift': { ext: '.swift', category: 'code', icon: '💻' },
  'text/x-kotlin': { ext: '.kt', category: 'code', icon: '💻' },
  'text/markdown': { ext: '.md', category: 'code', icon: '💻' },
  'text/xml': { ext: '.xml', category: 'code', icon: '💻' },
  'application/xml': { ext: '.xml', category: 'code', icon: '💻' },
} as const

// File size limits
export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB - workspace files
export const MAX_PAYMENT_PROOF_SIZE = 10 * 1024 * 1024 // 10MB - payment proof uploads
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB - video files (optional, not enforced yet)
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024 // 50MB - audio files (optional, not enforced yet)

// Dangerous file types that should NEVER be allowed
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.vbs', '.jar',
  '.sys', '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg',
  '.scr', '.com', '.pif', '.application', '.gadget', '.msp',
  '.cpl', '.hta', '.ins', '.isp', '.jse', '.ws', '.wsf',
  '.scf', '.lnk', '.inf', '.reg'
]

export const DANGEROUS_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-executable',
  'application/x-ms-dos-executable',
  'application/x-msdos-program',
  'application/x-sh',
  'application/x-bat',
  'application/x-java-archive'
]

export const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_FILE_TYPES)

export const ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).map(t => t.ext)

export function isFileTypeAllowed(mimeType: string): boolean {
  return mimeType in ALLOWED_FILE_TYPES
}

export function getFileCategory(mimeType: string): string {
  return ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]?.category || 'other'
}

export function getFileIcon(mimeType: string): string {
  return ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES]?.icon || '📎'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export function isDangerousFile(filename: string, mimeType?: string): boolean {
  const ext = `.${getFileExtension(filename).toLowerCase()}`

  // Check if extension is dangerous
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return true
  }

  // Check if MIME type is dangerous
  if (mimeType && DANGEROUS_MIME_TYPES.includes(mimeType)) {
    return true
  }

  return false
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`
    }
  }

  // Check if dangerous file
  if (isDangerousFile(file.name, file.type)) {
    return {
      valid: false,
      error: 'This file type is not allowed for security reasons'
    }
  }

  // Check if MIME type is allowed
  if (!isFileTypeAllowed(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please upload a different file format.`
    }
  }

  return { valid: true }
}

export function getAcceptedFileTypes(): string {
  // Returns a string for the HTML accept attribute
  return ALLOWED_EXTENSIONS.join(',')
}
