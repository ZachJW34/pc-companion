import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logger(...messages: any) {
  if (import.meta.env.VITE_LOG_LEVEL === "DEBUG") {
    console.log(...messages);
  }
}
