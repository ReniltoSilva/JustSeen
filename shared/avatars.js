/* Free avatars: an animal on a gradient. Saved on the user as "animal:fox" */
export const animalAvatars = [
  { id: "fox", emoji: "🦊", from: "#f97316", to: "#fdba74" },
  { id: "panda", emoji: "🐼", from: "#475569", to: "#94a3b8" },
  { id: "koala", emoji: "🐨", from: "#0ea5e9", to: "#7dd3fc" },
  { id: "tiger", emoji: "🐯", from: "#f59e0b", to: "#fde68a" },
  { id: "lion", emoji: "🦁", from: "#ca8a04", to: "#fde047" },
  { id: "frog", emoji: "🐸", from: "#16a34a", to: "#86efac" },
  { id: "monkey", emoji: "🐵", from: "#a16207", to: "#fcd34d" },
  { id: "penguin", emoji: "🐧", from: "#2563eb", to: "#93c5fd" },
  { id: "owl", emoji: "🦉", from: "#7c3aed", to: "#c4b5fd" },
  { id: "octopus", emoji: "🐙", from: "#db2777", to: "#f9a8d4" },
  { id: "bear", emoji: "🐻", from: "#b45309", to: "#fdba74" },
  { id: "rabbit", emoji: "🐰", from: "#c026d3", to: "#f0abfc" },
  { id: "cat", emoji: "🐱", from: "#4f46e5", to: "#a5b4fc" },
  { id: "dog", emoji: "🐶", from: "#0d9488", to: "#5eead4" },
  { id: "unicorn", emoji: "🦄", from: "#9333ea", to: "#f0abfc" },
  { id: "dragon", emoji: "🐲", from: "#059669", to: "#6ee7b7" },
  { id: "wolf", emoji: "🐺", from: "#334155", to: "#94a3b8" },
  { id: "raccoon", emoji: "🦝", from: "#57534e", to: "#d6d3d1" },
  { id: "hamster", emoji: "🐹", from: "#ea580c", to: "#fed7aa" },
  { id: "pig", emoji: "🐷", from: "#e11d48", to: "#fecdd3" },
  { id: "cow", emoji: "🐮", from: "#65a30d", to: "#d9f99d" },
  { id: "giraffe", emoji: "🦒", from: "#d97706", to: "#fef08a" },
  { id: "whale", emoji: "🐳", from: "#0369a1", to: "#bae6fd" },
  { id: "hedgehog", emoji: "🦔", from: "#78350f", to: "#fcd34d" },
];

export const animalValue = (animal) => `animal:${animal.id}`;

/* Same username always lands on the same animal */
const animalForName = (name = "") => {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return animalAvatars[hash % animalAvatars.length];
};

/* What to draw for a user: their photo, their chosen animal, or a default animal */
export const avatarFor = (user) => {
  const avatar = user?.avatar ?? "";
  if (avatar.startsWith("animal:")) {
    const chosen = animalAvatars.find((animal) => avatar === animalValue(animal));
    if (chosen) return { type: "animal", animal: chosen };
  }
  if (avatar) return { type: "photo", src: avatar };
  return { type: "animal", animal: animalForName(user?.username || user?.name) };
};
