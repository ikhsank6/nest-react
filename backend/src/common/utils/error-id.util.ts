import { randomBytes } from 'crypto';

export function generateErrorId(): string {
  return randomBytes(6).toString('hex').substring(0, 11);
}
