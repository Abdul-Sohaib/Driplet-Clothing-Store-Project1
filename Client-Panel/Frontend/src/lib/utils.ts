import { clsx, type ClassValue } from "clsx"

// Fallback implementation for `tailwind-merge` when the package isn't installed.
// This simple function returns the composed className unchanged; for full
// Tailwind class conflict resolution, install `tailwind-merge`.
function twMerge(className: string) {
  return className;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
