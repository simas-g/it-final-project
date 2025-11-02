import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import prisma from "./prisma.js";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
new GoogleStrategy(
    {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    },
async (accessToken, refreshToken, profile, done) => {
    try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
        return done(new Error("No email found in Google profile"), null);
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        if (!user.provider || user.provider !== "google") {
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
            provider: "google",
            providerId: profile.id,
            name: user.name || profile.displayName,
            },
        });
        }
    } else {
        user = await prisma.user.create({
        data: {
            email,
            name: profile.displayName || profile.emails[0].value.split("@")[0],
            provider: "google",
            providerId: profile.id,
            password: null,
            role: "USER",
        },
        });
    }

    return done(null, user);
    } catch (error) {
    return done(error, null);
    }
}
)
);

passport.use(
new FacebookStrategy(
    {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ["id", "emails", "name", "displayName"],
    },
async (accessToken, refreshToken, profile, done) => {
    try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
        return done(new Error("No email found in Facebook profile"), null);
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
        if (!user.provider || user.provider !== "facebook") {
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
            provider: "facebook",
            providerId: profile.id,
            name: user.name || profile.displayName,
            },
        });
        }
    } else {
        user = await prisma.user.create({
        data: {
            email,
            name: profile.displayName || profile.emails[0].value.split("@")[0],
            provider: "facebook",
            providerId: profile.id,
            password: null,
            role: "USER",
        },
        });
    }

    return done(null, user);
    } catch (error) {
    return done(error, null);
    }
}
)
);

export default passport;

