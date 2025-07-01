import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { processEmailChange, getEmailVerificationStatus, validateEmailData } from "@/lib/api/users";


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

    // Process email change using centralized API function
    const result = await processEmailChange(session.user.id, validatedData);

    return NextResponse.json(result);

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

    // Get verification status using centralized API function
    const result = await getEmailVerificationStatus(session.user.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Get verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}