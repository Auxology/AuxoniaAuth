import {Argon2id} from "oslo/password";

const ALLOWED_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes confusing characters like 0,1,I,O
const RECOVERY_CODE_LENGTH = 10;
const RECOVERY_CODE_COUNT = 10;

const Argon = new Argon2id();

function generateSingleRecoveryCode(): string {
  let code = '';
  for (let i = 0; i < RECOVERY_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ALLOWED_CHARS.length);
    code += ALLOWED_CHARS[randomIndex];
  }
  return code;
}

export function generateRecoveryCodes(): string[] {
  const codes = new Set<string>();
  
  // Generate unique codes until we have the desired count
  while (codes.size < RECOVERY_CODE_COUNT) {
    codes.add(generateSingleRecoveryCode());
  }
  
  return Array.from(codes);
}

export async function hashRecoveryCode(code: string):Promise<string> {
    return await Argon.hash(code);
}

export function verifyRecoveryCode(code: string, hash: string):Promise<boolean> {
    return Argon.verify(hash, code);
}