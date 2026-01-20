import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from '../lib/prisma';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
  ignoreExpiration: false
};

passport.use(
  new JwtStrategy(opts, async (payload, done) => {
    try {

      console.log("JWT Payload in passport.ts:", payload);
      if (!payload?.id) {
        return done(null, false);
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;