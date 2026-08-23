import { nanoid } from 'nanoid';

export function generateSlug(): string {
  return nanoid(10);
}

export function validateIdeaText(text: unknown): { valid: boolean; sanitized?: string; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Please describe your SaaS idea.' };
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Please describe your SaaS idea.' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Keep it under 500 characters. If you can\'t describe it that briefly, the idea might be too complicated.' };
  }
  
  if (trimmed.length < 10) {
    return { valid: false, error: 'Give us a bit more to work with. At least a sentence.' };
  }
  
  return { valid: true, sanitized: trimmed };
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
