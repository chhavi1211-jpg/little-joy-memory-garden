import { exercises, games } from "./catalog";
import type { ActivityFeedback } from "./types";

export const activities = [...exercises, ...games];
export const activityAtPath = (path: string) => activities.find((activity) => activity.to === path.replace(/\/$/, ""));

export function wasHelpful(feedback: ActivityFeedback | undefined) {
  return feedback?.response === "helped" || feedback?.response === "a_little";
}