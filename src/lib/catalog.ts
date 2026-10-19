export const games = [
  { slug: "maze", to: "/play/maze", title: "Happy Maze", blurb: "Wander a little path to a sunny spot.", tone: "bg-sage-soft", icon: "🌼" },
  { slug: "match", to: "/play/match", title: "Match the Memories", blurb: "Turn over gentle pairs, at your pace.", tone: "bg-peach-soft", icon: "🍓" },
  { slug: "find", to: "/play/find", title: "Find the Little Things", blurb: "A quiet garden with small surprises.", tone: "bg-lavender-soft", icon: "🐞" },
  { slug: "puzzle", to: "/play/puzzle", title: "Tiny Puzzle", blurb: "Swap tiles to piece a meadow together.", tone: "bg-butter-soft", icon: "🧩" },
  { slug: "colour", to: "/play/colour", title: "Colour and Create", blurb: "Fill a soft flower with your colours.", tone: "bg-sage-soft", icon: "🎨" },
] as const;

export const exercises = [
  { slug: "box", to: "/calm/box", title: "Box Breathing", blurb: "Four gentle sides of a square.", minutes: "1–3 min", tone: "bg-sage-soft" },
  { slug: "slow", to: "/calm/slow", title: "Slow Breathing", blurb: "Easy, unforced breaths. No holds.", minutes: "1–5 min", tone: "bg-lavender-soft" },
  { slug: "senses", to: "/calm/senses", title: "Five Senses", blurb: "Notice what's around you, step by step.", minutes: "2–4 min", tone: "bg-peach-soft" },
  { slug: "quick", to: "/calm/quick", title: "Quick Grounding", blurb: "Thirty seconds to land where you are.", minutes: "30 sec", tone: "bg-butter-soft" },
  { slug: "relax", to: "/calm/relax", title: "Guided Relaxation", blurb: "A short, soft unwind.", minutes: "1, 3 or 5 min", tone: "bg-sage-soft" },
] as const;

export type ExerciseSlug = (typeof exercises)[number]["slug"];
export const exerciseBySlug = (slug: string) => exercises.find((e) => e.slug === slug) ?? exercises[0];

export const reassurances = [
  "You can take this one moment at a time.",
  "There is no need to solve everything right now.",
  "Would you like to try a short grounding exercise?",
  "It's okay to pause here for as long as you like.",
  "Whatever you're feeling is allowed to be here.",
];

export const reflectionPrompts = [
  "What was one good thing about today?",
  "Who made you feel a little lighter recently?",
  "What's a small comfort you're grateful for?",
  "What's something you did today that you're quietly proud of?",
];

export const starterCollections = [
  "People who make me smile",
  "My favourite places",
  "Little everyday joys",
  "Things I am proud of",
  "Days I want to remember",
  "Reasons to keep going",
];

export const moods = [
  { id: "anxious", label: "A little anxious" },
  { id: "tired", label: "Tired" },
  { id: "low", label: "Feeling low" },
  { id: "restless", label: "Restless" },
  { id: "okay", label: "Doing okay" },
  { id: "joy", label: "Looking for a little joy" },
] as const;
