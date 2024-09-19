import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export class FetchError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logger(...messages: any) {
  if (import.meta.env.VITE_LOG_LEVEL === "DEBUG") {
    console.log(...messages);
  }
}

type FetchArgs = Parameters<typeof global.fetch>;

export async function fetchJson(...args: FetchArgs) {
  const res = await fetch(...args);
  const json = await res.json();

  if (res.ok) {
    return json;
  } else {
    throw new FetchError(json.message, res.status);
  }
}
