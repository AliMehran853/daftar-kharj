import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser'
import { getSetting, setSetting, setSettings } from '../db/queries'

/* ─────────────────────────────────────────────
   PIN — PBKDF2 با SHA-256
   ───────────────────────────────────────────── */
const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomSalt() {
  const bytes = new Uint8Array(SALT_BYTES)
  crypto.getRandomValues(bytes)
  return bufToHex(bytes)
}

async function derivePinHash(pin, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return bufToHex(bits)
}

export async function savePin(pin) {
  const salt = randomSalt()
  const hash = await derivePinHash(pin, salt)
  // این‌جا هم هش و salt ذخیره می‌شه، هم pinEnabled روشن می‌شه
  await setSettings({
    pinHash: hash,
    pinSalt: salt,
    pinEnabled: true,
  })
  return true
}

export async function verifyPin(pin) {
  const [hash, salt] = await Promise.all([
    getSetting('pinHash', ''),
    getSetting('pinSalt', ''),
  ])
  if (!hash || !salt) return false
  const candidate = await derivePinHash(pin, salt)
  if (candidate.length !== hash.length) return false
  let diff = 0
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return diff === 0
}

export async function clearPin() {
  await setSettings({
    pinHash: '',
    pinSalt: '',
    pinEnabled: false,
  })
}

/* ─────────────────────────────────────────────
   WebAuthn — اثر انگشت / Face ID
   ───────────────────────────────────────────── */
export async function isBiometricAvailable() {
  if (typeof window === 'undefined') return false
  if (!browserSupportsWebAuthn()) return false
  try {
    return await platformAuthenticatorIsAvailable()
  } catch {
    return false
  }
}

function randomChallenge() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return bufToHex(bytes)
}

export async function registerBiometric(userName = 'شریف') {
  if (!(await isBiometricAvailable())) {
    throw new Error('BIOMETRIC_NOT_SUPPORTED')
  }

  const challenge = randomChallenge()

  const registration = await startRegistration({
    optionsJSON: {
      challenge,
      rp: {
        name: 'دفتر خرج',
        id: window.location.hostname,
      },
      user: {
        id: randomChallenge().slice(0, 16),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    },
  })

  const credentialId = registration.id
  await setSettings({
    biometricCredentialId: credentialId,
    biometricEnabled: true,
  })
  return credentialId
}

export async function verifyBiometric() {
  const credentialId = await getSetting('biometricCredentialId', '')
  if (!credentialId) throw new Error('NO_CREDENTIAL')
  if (!(await isBiometricAvailable())) {
    throw new Error('BIOMETRIC_NOT_SUPPORTED')
  }

  const challenge = randomChallenge()

  const auth = await startAuthentication({
    optionsJSON: {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [
        {
          id: credentialId,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  if (!auth || auth.id !== credentialId) {
    throw new Error('MISMATCH')
  }
  return true
}

export async function removeBiometric() {
  await setSettings({
    biometricCredentialId: '',
    biometricEnabled: false,
  })
}