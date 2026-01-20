import type { JwtUserPayload } from "../types/jwt";

export const assertOwnershipOrAdmin = (
  resourceAuthorId: string,
  user: JwtUserPayload
) => {
  return user.role === "ADMIN" || resourceAuthorId === user.id;
};
