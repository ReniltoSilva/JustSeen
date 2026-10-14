/* "@Alex.Cinema " -> "alex.cinema", people often type the @ themselves */
export const cleanUsername = (value) => value.trim().replace(/^@+/, "").toLowerCase();

/* An error message, or "" when the username is fine */
export const usernameProblem = (username) => {
  if (username.length < 3) return "Usernames need at least 3 characters.";
  if (username.length > 20) return "Usernames can be at most 20 characters.";
  if (!/^[a-z0-9._]+$/.test(username)) {
    return "Use only letters, numbers, dots and underscores.";
  }
  return "";
};
