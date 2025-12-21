import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import { storage } from "./storage";

const rpName = "تطابق - Tatābuk";
const rpID = process.env.REPLIT_DEV_DOMAIN?.replace("https://", "").split(":")[0] || "localhost";
const origin = process.env.REPLIT_DEV_DOMAIN || `http://localhost:5000`;

export async function generateRegistrationOptionsForUser(userId: string, userName: string) {
  const existingCredentials = await storage.getWebauthnCredentialsByUser(userId);
  
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    excludeCredentials: existingCredentials.map((cred) => ({
      id: cred.credentialId,
      transports: (cred.transports || []) as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await storage.createWebauthnChallenge({
    challenge: options.challenge,
    userId,
    type: "registration",
    expiresAt,
  });

  return options;
}

export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON,
  deviceName?: string
) {
  const challengeRecord = await storage.getWebauthnChallenge(response.response.clientDataJSON);
  
  const credentials = await storage.getWebauthnCredentialsByUser(userId);
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("المستخدم غير موجود");
  }

  const challenges = await getAllUserChallenges(userId, "registration");
  if (challenges.length === 0) {
    throw new Error("لم يتم العثور على تحدي صالح");
  }
  
  const latestChallenge = challenges[0];
  
  if (new Date() > latestChallenge.expiresAt) {
    await storage.deleteWebauthnChallenge(latestChallenge.challenge);
    throw new Error("انتهت صلاحية التحدي");
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: latestChallenge.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  await storage.deleteWebauthnChallenge(latestChallenge.challenge);

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("فشل التحقق من التسجيل");
  }

  const { credential } = verification.registrationInfo;

  await storage.createWebauthnCredential({
    userId,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64"),
    counter: credential.counter,
    deviceType: "platform",
    transports: response.response.transports || [],
    deviceName: deviceName || "جهاز غير معروف",
    lastUsedAt: new Date(),
  });

  return { verified: true };
}

async function getAllUserChallenges(userId: string, type: string) {
  await storage.deleteExpiredWebauthnChallenges();
  const result: any[] = [];
  return result;
}

export async function generateAuthenticationOptionsForUser(userId?: string) {
  let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = [];

  if (userId) {
    const credentials = await storage.getWebauthnCredentialsByUser(userId);
    allowCredentials = credentials.map((cred) => ({
      id: cred.credentialId,
      transports: (cred.transports || []) as AuthenticatorTransportFuture[],
    }));
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await storage.createWebauthnChallenge({
    challenge: options.challenge,
    userId: userId || null,
    type: "authentication",
    expiresAt,
  });

  return options;
}

export async function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string
) {
  const credential = await storage.getWebauthnCredentialById(response.id);
  
  if (!credential) {
    throw new Error("لم يتم العثور على بيانات الاعتماد");
  }

  const challengeRecord = await storage.getWebauthnChallenge(expectedChallenge);
  
  if (!challengeRecord) {
    throw new Error("لم يتم العثور على تحدي صالح");
  }

  if (new Date() > challengeRecord.expiresAt) {
    await storage.deleteWebauthnChallenge(expectedChallenge);
    throw new Error("انتهت صلاحية التحدي");
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialId,
      publicKey: Buffer.from(credential.publicKey, "base64"),
      counter: credential.counter,
      transports: (credential.transports || []) as AuthenticatorTransportFuture[],
    },
  });

  await storage.deleteWebauthnChallenge(expectedChallenge);

  if (!verification.verified) {
    throw new Error("فشل التحقق");
  }

  await storage.updateWebauthnCredential(credential.id, {
    counter: verification.authenticationInfo.newCounter,
    lastUsedAt: new Date(),
  });

  const user = await storage.getUser(credential.userId);
  
  if (!user) {
    throw new Error("المستخدم غير موجود");
  }

  return { verified: true, user };
}

export { rpID, origin };
