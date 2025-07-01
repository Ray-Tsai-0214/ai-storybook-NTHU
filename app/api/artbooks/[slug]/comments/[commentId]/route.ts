import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { updateComment, deleteComment, validateCommentContent } from "@/lib/api/comments";

// Input validation schema for updating comments
const updateCommentSchema = z.object({
	content: z
		.string()
		.min(1, "Comment content is required")
		.max(1000, "Comment must be less than 1000 characters"),
});

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string; commentId: string }> }
) {
	try {
		// Get session from Better Auth
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updateCommentSchema.parse(body);
		const { slug, commentId } = await params;

		// Update comment using centralized API function
		const comment = await updateComment(commentId, slug, validatedData, session.user.id);

		return NextResponse.json({
			message: "Comment updated successfully",
			comment,
		});
	} catch (error) {
		console.error("Update comment error:", error);

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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string; commentId: string }> }
) {
	try {
		// Get session from Better Auth
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { slug, commentId } = await params;

		// Delete comment using centralized API function
		await deleteComment(commentId, slug, session.user.id);

		return NextResponse.json({
			message: "Comment deleted successfully",
		});
	} catch (error) {
		console.error("Delete comment error:", error);

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
