import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { User } from "@/types";

// Types for user operations
export interface UpdateProfileData {
  name: string;
  image?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailData {
  newEmail: string;
  verificationCode?: string;
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  updatedAt: Date;
}

export interface EmailVerificationStatus {
  hasPendingVerification: boolean;
  expiresAt?: Date;
}

export interface EmailChangeResponse {
  message: string;
  requiresVerification?: boolean;
  user?: UserProfile;
}

// Update user profile (name and image)
export async function updateUserProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      image: data.image,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      updatedAt: true,
    }
  });
}

// Get user account for password verification
export async function getUserAccount(userId: string) {
  return await prisma.account.findFirst({
    where: {
      userId: userId,
      providerId: "credential", // Better Auth uses "credential" for email/password
      password: { not: null }
    }
  });
}

// Change user password
export async function changeUserPassword(userId: string, data: ChangePasswordData): Promise<void> {
  // Find user's account with password
  const account = await getUserAccount(userId);

  if (!account || !account.password) {
    throw new Error("No password found for this account");
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(
    data.currentPassword,
    account.password
  );

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

  // Update password in the account
  await prisma.account.update({
    where: { id: account.id },
    data: {
      password: hashedNewPassword,
      updatedAt: new Date(),
    }
  });
}

// Check if email is available for a user
export async function isEmailAvailable(email: string, excludeUserId: string): Promise<boolean> {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
      id: { not: excludeUserId }
    }
  });

  return !existingUser;
}

// Create email verification code
export async function createEmailVerificationCode(userId: string): Promise<string> {
  const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.verification.upsert({
    where: {
      identifier_value: {
        identifier: `email_change_${userId}`,
        value: verificationCode,
      }
    },
    update: {
      value: verificationCode,
      expiresAt,
      updatedAt: new Date(),
    },
    create: {
      identifier: `email_change_${userId}`,
      value: verificationCode,
      expiresAt,
    }
  });

  return verificationCode;
}

// Verify email change code and update email
export async function verifyAndChangeEmail(
  userId: string, 
  newEmail: string, 
  verificationCode: string
): Promise<UserProfile> {
  // Check if email is still available
  if (!await isEmailAvailable(newEmail, userId)) {
    throw new Error("Email address is already in use");
  }

  // Verify the code
  const verification = await prisma.verification.findFirst({
    where: {
      identifier: `email_change_${userId}`,
      value: verificationCode,
      expiresAt: { gt: new Date() }
    }
  });

  if (!verification) {
    throw new Error("Invalid or expired verification code");
  }

  // Update email
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      emailVerified: true,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      updatedAt: true,
    }
  });

  // Delete verification record
  await prisma.verification.delete({
    where: { id: verification.id }
  });

  return updatedUser;
}

// Process email change request
export async function processEmailChange(
  userId: string, 
  data: ChangeEmailData
): Promise<EmailChangeResponse> {
  // Check if email is available
  if (!await isEmailAvailable(data.newEmail, userId)) {
    throw new Error("Email address is already in use");
  }

  // If no verification code provided, send verification email
  if (!data.verificationCode) {
    const verificationCode = await createEmailVerificationCode(userId);

    // TODO: Send verification email
    // In a real application, you would send an email here
    console.log(`Verification code for ${data.newEmail}: ${verificationCode}`);

    return {
      message: "Verification code sent to your new email address",
      requiresVerification: true,
    };
  }

  // If verification code provided, verify and update email
  const updatedUser = await verifyAndChangeEmail(userId, data.newEmail, data.verificationCode);

  return {
    message: "Email address updated successfully",
    user: updatedUser,
  };
}

// Get email verification status
export async function getEmailVerificationStatus(userId: string): Promise<EmailVerificationStatus> {
  const verification = await prisma.verification.findFirst({
    where: {
      identifier: `email_change_${userId}`,
      expiresAt: { gt: new Date() }
    }
  });

  return {
    hasPendingVerification: !!verification,
    expiresAt: verification?.expiresAt,
  };
}

// Validate profile data
export function validateProfileData(data: UpdateProfileData): void {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error("Name is required");
  }
  
  if (data.name.length > 100) {
    throw new Error("Name must be less than 100 characters");
  }
}

// Validate password data
export function validatePasswordData(data: ChangePasswordData): void {
  if (!data.currentPassword) {
    throw new Error("Current password is required");
  }
  
  if (!data.newPassword || data.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long");
  }
}

// Validate email data
export function validateEmailData(data: ChangeEmailData): void {
  if (!data.newEmail) {
    throw new Error("New email is required");
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.newEmail)) {
    throw new Error("Invalid email address");
  }
}