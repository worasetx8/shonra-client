// Simple token verification utility
export function verifyToken(token: string): any {
  try {
    const payload = Buffer.from(token, "base64").toString("utf-8");
    const user = JSON.parse(payload);

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - user.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      throw new Error("Token expired");
    }

    return user;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export function requireAuth() {
  // Check if we're in browser environment
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("auth-token");
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch (error) {
    localStorage.removeItem("auth-token");
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth-token");
    window.location.href = "/backoffice/login";
  }
}
