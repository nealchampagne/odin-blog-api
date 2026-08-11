import { JwtUserPayload } from "./jwt.js";

declare global {
  namespace Express {
    interface User extends JwtUserPayload {}
    
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};