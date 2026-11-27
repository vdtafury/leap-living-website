import { startPixxiLeadWorker } from './leads'
import { startPixxiSyncWorker } from './sync'

/** Starts background Pixxi CRM workers once per process when PIXXI_API_TOKEN is set. */
export function startPixxiWorkers() {
  startPixxiLeadWorker()
  startPixxiSyncWorker()
}
