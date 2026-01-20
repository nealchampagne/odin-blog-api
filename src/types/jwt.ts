export interface JwtUserPayload {
  id: string;
  role: 'USER' | 'ADMIN';
}