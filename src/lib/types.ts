export type Feeling = "comforting" | "neutral" | "avoid";
/** Where a memory came from. "google_photos" is reserved for the future import flow. */
export type MemorySource = "upload" | "google_photos";

export interface Memory {
  id: string;
  photoUrl: string | null; // displayable URL (data URL for device, signed URL for cloud)
  photoPath: string | null; // storage path (cloud only)
  caption: string;
  date: string; // YYYY-MM-DD
  location: string;
  tags: string[];
  collectionIds: string[];
  feeling: Feeling;
  archived: boolean;
  source: MemorySource;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
}

export type ComfortKind = "exercise" | "message" | "memory" | "reminder";
export interface ComfortItem {
  id: string;
  kind: ComfortKind;
  value: string;
}

export interface Reflection {
  id: string;
  goodThing: string;
  intention: string;
  createdAt: string;
}

export type Mood = "anxious" | "tired" | "low" | "restless" | "okay" | "joy";

export type ActivityResponse = "helped" | "a_little" | "not_this_time";
export interface ActivityFeedback {
  response: ActivityResponse;
  updatedAt: string;
}

export interface Prefs {
  activityFeedback: Record<string, ActivityFeedback>;
  theme: "light" | "dark";
  reduceMotion: boolean;
  sound: boolean;
  haptics: boolean;
  resurfacing: "off" | "sometimes" | "often";
  resurfacePausedUntil: string | null;
  moodSuggestions: boolean;
  preferredExercise: string; // slug of calm exercise
  favouriteGames: string[];
  reminders: { enabled: boolean; time: string; frequency: "daily" | "weekdays" | "weekly" };
}

export const defaultPrefs: Prefs = {
  activityFeedback: {},
  theme: "light",
  reduceMotion: false,
  sound: false,
  haptics: true,
  resurfacing: "sometimes",
  resurfacePausedUntil: null,
  moodSuggestions: true,
  preferredExercise: "box",
  favouriteGames: [],
  reminders: { enabled: false, time: "20:00", frequency: "daily" },
};

export interface NewMemoryInput {
  file: File | null;
  caption: string;
  date: string;
  location: string;
  tags: string[];
  collectionIds: string[];
}
