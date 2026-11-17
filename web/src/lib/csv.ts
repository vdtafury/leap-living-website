/** Quotes a CSV cell; a leading = + - @ is neutralised so Excel cannot run it as a formula. */
export function csvCell(value: unknown): string {
  let text = value instanceof Date ? value.toISOString() : value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}
