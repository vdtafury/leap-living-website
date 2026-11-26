import { randomBytes } from 'node:crypto'
import { hash, verify } from '@node-rs/argon2'

/**
 * Argon2id with the library defaults (m=19 MiB, t=2, p=1: the OWASP minimum). Prebuilt
 * binaries come from npm, so nothing compiles on the host.
 */
const ARGON2ID = 2 // Algorithm.Argon2id (a const enum, so the number is used directly)

export const MIN_PASSWORD_LENGTH = 12
export const MAX_PASSWORD_LENGTH = 128

const COMMON = new Set([
  'password1234',
  'password12345',
  '123456789012',
  'qwertyuiop12',
  'leapliving123',
  'leapliving1234',
  'admin1234567',
  'changeme1234',
])

/** A reason the password is not acceptable, or null. Length over composition rules (NIST). */
export function passwordProblem(password: string, username = ''): string | null {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  if (password.length > MAX_PASSWORD_LENGTH) return `Use at most ${MAX_PASSWORD_LENGTH} characters.`
  const lower = password.toLowerCase()
  if (COMMON.has(lower)) return 'This password is too common.'
  if (username && lower.includes(username.toLowerCase()))
    return 'The password must not contain the username.'
  if (new Set(password).size < 5) return 'Use a less repetitive password.'
  return null
}

export function hashPassword(password: string): Promise<string> {
  return hash(password, { algorithm: ARGON2ID })
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password)
  } catch {
    return false // malformed hash: treat as a wrong password, never as a crash
  }
}

/**
 * A valid hash of a random string. Verifying against it when the username does not exist
 * makes "unknown user" take as long as "wrong password", so timing does not reveal usernames.
 */
let dummyHash: Promise<string> | null = null
export function timingDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(`dummy-${randomBytes(16).toString('hex')}`).catch((error) => {
    dummyHash = null
    throw error
  })
  return dummyHash
}
