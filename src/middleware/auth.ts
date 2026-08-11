import passport from './passport.js';

export const requireAuth = 
  passport.authenticate('jwt', { session: false });