import type { PasswordValidationStatus } from "firebase/auth";

export type PasswordCheck = {
  label: string;
  met: boolean;
};

export function passwordChecks(status: PasswordValidationStatus): PasswordCheck[] {
  const options = status.passwordPolicy.customStrengthOptions;
  const checks: PasswordCheck[] = [];

  if (options.minPasswordLength) {
    checks.push({
      label: `At least ${options.minPasswordLength} characters`,
      met: status.meetsMinPasswordLength ?? false,
    });
  }
  if (options.containsLowercaseLetter) {
    checks.push({ label: "A lowercase letter", met: status.containsLowercaseLetter ?? false });
  }
  if (options.containsUppercaseLetter) {
    checks.push({ label: "An uppercase letter", met: status.containsUppercaseLetter ?? false });
  }
  if (options.containsNumericCharacter) {
    checks.push({ label: "A number", met: status.containsNumericCharacter ?? false });
  }
  if (options.containsNonAlphanumericCharacter) {
    checks.push({
      label: "A special character",
      met: status.containsNonAlphanumericCharacter ?? false,
    });
  }

  return checks;
}