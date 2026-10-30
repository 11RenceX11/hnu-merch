/** Reads a text field from FormData. Returns "" when it is missing or is a file. */
export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
