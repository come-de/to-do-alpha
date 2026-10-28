import { taskStore } from "@/app/lib/shared-data";
import type { CustomerCallData, CustomerCallImport, CustomerCallRecord, CustomerCallSettings } from "./customer-call-audit-parser";

export type { CustomerCallData, CustomerCallImport, CustomerCallRecord, CustomerCallSettings } from "./customer-call-audit-parser";
const DATA_KEY = "customer-call-audit/data-v1.json";
const DEFAULT_SETTINGS: CustomerCallSettings = { shortCallThresholdSeconds: 60 };

export async function readCustomerCallData(): Promise<CustomerCallData> {
  const store = taskStore();
  if (!await store.getMetadata(DATA_KEY, { consistency: "strong" })) return { calls: [], imports: [], settings: DEFAULT_SETTINGS };
  const value = await store.get(DATA_KEY, { type: "json", consistency: "strong" });
  if (!value || typeof value !== "object") return { calls: [], imports: [], settings: DEFAULT_SETTINGS };
  const data = value as Partial<CustomerCallData>;
  const settings = data.settings && Number.isInteger(data.settings.shortCallThresholdSeconds)
    ? { shortCallThresholdSeconds: Math.min(600, Math.max(1, data.settings.shortCallThresholdSeconds)) }
    : DEFAULT_SETTINGS;
  return {
    calls: Array.isArray(data.calls) ? data.calls as CustomerCallRecord[] : [],
    imports: Array.isArray(data.imports) ? data.imports as CustomerCallImport[] : [],
    settings,
  };
}

export async function writeCustomerCallData(data: CustomerCallData) {
  await taskStore().setJSON(DATA_KEY, data);
}
