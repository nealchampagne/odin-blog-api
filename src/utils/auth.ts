export const assertOwnershipOrAdmin = (
  resourceAuthorId: string,
  user: Express.User
) => {
  if (user.role === 'ADMIN' || resourceAuthorId === user.id) {
    return true;
  }
  return false;
};