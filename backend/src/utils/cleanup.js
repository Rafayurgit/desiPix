import { imageService } from "../services/image.service.js";

export async function runCleanup(reason) {
  const now = new Date().toISOString();
  console.log(`[${now}] Cleanup triggered: ${reason}`);
  try {
    await imageService.cleanupCache?.();
    console.log(`[${now}] Cleanup finished`);
  } catch (err) {
    console.error(`[${now}] Cleanup failed:`, err);
  }
}

export function scheduleCleanup() {
  return setInterval(() => runCleanup("periodic"), 60 * 60 * 1000);
}
