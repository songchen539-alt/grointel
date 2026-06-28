export const GROINTEL_HEARTBEAT_CRON = "0 0 * * *";

export type GroIntelLifeStatus = {
  mode: "hobby_safe_cron";
  status: "alive";
  cronSchedule: string;
  cronDescription: string;
  platformLimit: string;
  nextScheduledHeartbeatAt: string;
  manualTickAvailable: boolean;
  manualTickPath: string;
  realityLoop: string[];
};

export function nextDailyUtcHeartbeat(now = new Date()) {
  const next = new Date(now);
  next.setUTCHours(0, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

export function getGroIntelLifeStatus(now = new Date()): GroIntelLifeStatus {
  return {
    mode: "hobby_safe_cron",
    status: "alive",
    cronSchedule: GROINTEL_HEARTBEAT_CRON,
    cronDescription: "Daily production heartbeat at 00:00 UTC",
    platformLimit: "Vercel Hobby supports cron at a minimum interval of once per day.",
    nextScheduledHeartbeatAt: nextDailyUtcHeartbeat(now),
    manualTickAvailable: true,
    manualTickPath: "/api/grointel/heartbeat?limit=2",
    realityLoop: [
      "Observe balanced Web3 demand and supply targets",
      "Save raw observations, signals, and evidence into world memory",
      "Seed and merge Web3 growth event memory",
      "Expose World status for product and smoke verification",
    ],
  };
}
