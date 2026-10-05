export const WMU_DOMAIN = "wmich.edu";

export function isWmuEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${WMU_DOMAIN}`);
}