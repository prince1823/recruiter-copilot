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
  sessionStorage.removeItem('jwtToken');
  sessionStorage.removeItem('tokenExpiry');
}

export function isAuthenticated(): boolean {
  return isTokenValid();
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}

export function generateTimestamp(): string {
  return new Date().toISOString();
}

// JWT Token management functions
export function getStoredToken(): string | null {
  return sessionStorage.getItem('jwtToken');
}

export function setStoredToken(token: string): void {
  sessionStorage.setItem('jwtToken', token);
}

export function getTokenExpiry(): number | null {
  const expiry = sessionStorage.getItem('tokenExpiry');
  return expiry ? parseInt(expiry) : null;
}

export function setTokenExpiry(expiry: number): void {
  sessionStorage.setItem('tokenExpiry', expiry.toString());
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  
  // Check if token expires in the next 5 minutes (300 seconds)
  const now = Math.floor(Date.now() / 1000);
  return expiry <= (now + 300);
}

export function isTokenValid(): boolean {
  const token = getStoredToken();
  const userId = getStoredUserId();
  return !!(token && userId && !isTokenExpired());
}