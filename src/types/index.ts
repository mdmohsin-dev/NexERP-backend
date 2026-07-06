export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export interface JwtPayload {
  userId: string;
  role: Role;
}

// Augment Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
