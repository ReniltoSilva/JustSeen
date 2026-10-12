/* Password rules for sign-up and password reset. Supabase checks the same
rules on the server (Authentication -> Providers -> Email -> Password requirements),
so they can't be skipped by calling the API directly */

export const passwordRules = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "A number", test: (p) => /\d/.test(p) },
  { id: "symbol", label: "A symbol, like ! ? # or @", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/* Passwords so common that attackers try them first */
const common = ["password", "123456", "qwerty", "letmein", "welcome", "iloveyou", "justseen", "admin"];

/* An error message, or "" when the password is fine */
export const passwordProblem = (password, { email = "", username = "" } = {}) => {
  const missing = passwordRules.filter((rule) => !rule.test(password));
  if (missing.length) return `Your password needs: ${missing.map((rule) => rule.label.toLowerCase()).join(", ")}.`;

  const lower = password.toLowerCase();
  if (common.some((word) => lower.includes(word))) return "That password is too easy to guess. Try something less common.";

  const emailName = email.split("@")[0].toLowerCase();
  if ((emailName.length >= 4 && lower.includes(emailName)) || (username.length >= 4 && lower.includes(username.toLowerCase()))) {
    return "Don't use your email or username in your password.";
  }
  return "";
};

/* 0 to 4, for the strength bar: rules met plus a bonus for length */
export const passwordStrength = (password) => {
  if (!password) return 0;
  const met = passwordRules.filter((rule) => rule.test(password)).length;
  const score = met - 1 + (password.length >= 12 ? 1 : 0);
  return Math.max(0, Math.min(4, score));
};
