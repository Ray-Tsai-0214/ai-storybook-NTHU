import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";


// Input validation schema
const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  verificationCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = changeEmailSchema.parse(body);

    // Check if email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.newEmail,
        id: { not: session.user.id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email address is already in use" },
        { status: 400 }
      );
    }

    // If no verification code provided, send verification email
    if (!validatedData.verificationCode) {
      // Generate verification code
      const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code
      await prisma.verification.upsert({
        where: {
          identifier_value: {
            identifier: `email_change_${session.user.id}`,
            value: verificationCode,
          }
        },
        update: {
          value: verificationCode,
          expiresAt,
          updatedAt: new Date(),
        },
        create: {
          identifier: `email_change_${session.user.id}`,
          value: verificationCode,
          expiresAt,
        }
      });

      // TODO: Send verification email
      // In a real application, you would send an email here
      console.log(`Verification code for ${validatedData.newEmail}: ${verificationCode}`);

      return NextResponse.json({
        message: "Verification code sent to your new email address",
        requiresVerification: true,
      });
    }

    // If verification code provided, verify and update email
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: `email_change_${session.user.id}`,
        value: validatedData.verificationCode,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Update email
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: validatedData.newEmail,
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

    return NextResponse.json({
      message: "Email address updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Change email error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get verification status
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if there's a pending email change verification
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: `email_change_${session.user.id}`,
        expiresAt: { gt: new Date() }
      }
    });

    return NextResponse.json({
      hasPendingVerification: !!verification,
      expiresAt: verification?.expiresAt,
    });

  } catch (error) {
    console.error("Get verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}