import { JwtUserPayload } from "./jwt";

declare global {
  namespace Express {
    interface User extends JwtUserPayload {}
    
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};