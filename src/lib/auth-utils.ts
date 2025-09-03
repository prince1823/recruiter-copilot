export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getStoredUserId(): string | null {
  return sessionStorage.getItem('userId');
}

export function setStoredUserId(userId: string): void {
  sessionStorage.setItem('userId', userId);
}

export function getStoredUsername(): string | null {
  return sessionStorage.getItem('username');
}

export function setStoredUsername(username: string): void {
  sessionStorage.setItem('username', username);
}

export function setLoginTime(): void {
  sessionStorage.setItem('loginTime', Date.now().toString());
}

export function clearSession(): void {
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('loginTime');
}

export function isAuthenticated(): boolean {
  return !!getStoredUserId();
}