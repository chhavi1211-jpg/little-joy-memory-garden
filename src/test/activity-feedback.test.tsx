import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppDataProvider, useAppData } from "@/lib/app-data";
import { ActivityCheckIn } from "@/components/ActivityCheckIn";
import { HelpfulActivities } from "@/components/HelpfulActivities";
import { activityAtPath, wasHelpful } from "@/lib/activity-feedback";

const cloud = vi.hoisted(() => ({ upsert: vi.fn(), session: null as null | { user: { id: string } } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    getSession: async () => ({ data: { session: cloud.session } }),
  },
  from: () => ({
    select: () => ({ order: () => ({ data: [], limit: () => ({ data: [] }) }), eq: () => ({ maybeSingle: () => ({ data: null }) }) }),
    upsert: cloud.upsert,
  }),
} }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a> }));

function Flow() {
  const { ready } = useAppData();
  return ready ? <><ActivityCheckIn slug="senses" /><HelpfulActivities kind="calm" /></> : null;
}
const start = () => render(<AppDataProvider><Flow /></AppDataProvider>);

beforeEach(() => { localStorage.clear(); cloud.session = null; cloud.upsert.mockReset(); });
afterEach(cleanup);

describe("optional activity feedback", () => {
  it("skipping stores no response", async () => {
    start();
    fireEvent.click(await screen.findByRole("button", { name: "Skip check-in" }));
    expect(localStorage.getItem("alh:prefs")).toBeNull();
    expect(screen.queryByRole("region", { name: "Activities that helped you" })).toBeNull();
  });
  it.each(["Yes, it helped", "A little"])("%s saves privately and resurfaces after remount", async (label) => {
    const view = start();
    fireEvent.click(await screen.findByRole("button", { name: label }));
    await screen.findByRole("link", { name: /Five Senses/ });
    const saved = JSON.parse(localStorage.getItem("alh:prefs") ?? "{}");
    expect(saved.activityFeedback.senses.response).toBe(label === "A little" ? "a_little" : "helped");
    view.unmount();
    start();
    expect(await screen.findByRole("link", { name: /Five Senses/ })).toHaveAttribute("href", "/calm/senses");
  });
  it("not this time replaces positive feedback without recommending it", async () => {
    localStorage.setItem("alh:prefs", JSON.stringify({ activityFeedback: { senses: { response: "helped", updatedAt: "2026-11-02" } } }));
    start();
    fireEvent.click(await screen.findByRole("button", { name: "Not this time" }));
    await waitFor(() => expect(JSON.parse(localStorage.getItem("alh:prefs") ?? "{}").activityFeedback.senses.response).toBe("not_this_time"));
    expect(screen.queryByRole("link", { name: /Five Senses/ })).toBeNull();
  });
  it("a failed account save leaves feedback unanswered and allows skipping", async () => {
    cloud.session = { user: { id: "account-owner" } };
    cloud.upsert.mockResolvedValue({ error: new Error("offline") });
    start();
    fireEvent.click(await screen.findByRole("button", { name: "Yes, it helped" }));
    await screen.findByRole("alert");
    expect(localStorage.getItem("alh:prefs")).toBeNull();
    expect(screen.queryByRole("link", { name: /Five Senses/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Skip check-in" }));
    expect(screen.queryByRole("region", { name: "Optional activity check-in" })).toBeNull();
  });
  it("accounts save the response with their owner ID", async () => {
    cloud.session = { user: { id: "account-owner" } };
    cloud.upsert.mockResolvedValue({ error: null });
    start();
    fireEvent.click(await screen.findByRole("button", { name: "A little" }));
    await screen.findByRole("link", { name: /Five Senses/ });
    expect(cloud.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "account-owner", data: expect.objectContaining({ activityFeedback: expect.objectContaining({ senses: expect.objectContaining({ response: "a_little" }) }) }) }));
  });
  it("only positive responses count as helpful", () => {
    expect(wasHelpful(undefined)).toBe(false);
    expect(wasHelpful({ response: "not_this_time", updatedAt: "" })).toBe(false);
    expect(wasHelpful({ response: "a_little", updatedAt: "" })).toBe(true);
    expect(wasHelpful({ response: "helped", updatedAt: "" })).toBe(true);
  });
  it("identifies catalog activities, never the discovery page", () => {
    expect(activityAtPath("/calm/quick/")?.slug).toBe("quick");
    expect(activityAtPath("/play/colour")?.slug).toBe("colour");
    expect(activityAtPath("/calm")).toBeUndefined();
  });
});