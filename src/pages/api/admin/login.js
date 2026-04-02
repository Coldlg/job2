import { serialize } from "cookie";

// Store this in your .env file as: ADMIN_PASSWORD=your_secure_password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Rate limiting: simple in-memory store
const loginAttempts = new Map();
const MAX_ATTEMPTS = 2;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      "unknown";

    // Check rate limiting
    const attempts = loginAttempts.get(ip);
    if (attempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

      if (attempts.count >= MAX_ATTEMPTS && timeSinceLastAttempt < LOCKOUT_TIME) {
        const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
        return res.status(429).json({
          error: `Хэт олон оролдлого. ${remainingTime} минутын дараа дахин оролдоно уу.`,
        });
      }

      // Reset if lockout time has passed
      if (timeSinceLastAttempt >= LOCKOUT_TIME) {
        loginAttempts.delete(ip);
      }
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Нууц үг оруулна уу" });
    }

    // Verify password
    if (password === ADMIN_PASSWORD) {
      // Clear login attempts on success
      loginAttempts.delete(ip);

      // Set secure cookie
      const cookie = serialize("admin_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      res.setHeader("Set-Cookie", cookie);
      console.log(`[LOGIN SUCCESS] IP: ${ip}`);

      return res.status(200).json({ success: true });
    } else {
      // Track failed attempt
      const current = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      loginAttempts.set(ip, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });

      console.log(`[LOGIN FAILED] IP: ${ip} - Attempts: ${current.count + 1}`);

      return res.status(401).json({ error: "Нууц үг буруу байна" });
    }
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return res.status(500).json({ error: "Серверийн алдаа" });
  }
}
