import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Input validation schema for updating comments
const updateCommentSchema = z.object({
	content: z
		.string()
		.min(1, "Comment content is required")
		.max(1000, "Comment must be less than 1000 characters"),
});

// Helper function to sanitize HTML content
function sanitizeContent(content: string): string {
	// Remove any potential HTML tags and dangerous characters
	return content
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/javascript:/gi, "") // Remove javascript: protocols
		.replace(/on\w+=/gi, "") // Remove event handlers
		.trim();
}

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

		// Sanitize the content
		const sanitizedContent = sanitizeContent(validatedData.content);

		// Find the artbook's post
		const artbook = await prisma.artbook.findUnique({
			where: { slug },
			include: { post: true },
		});

		if (!artbook || !artbook.post) {
			return NextResponse.json(
				{ error: "Artbook or post not found" },
				{ status: 404 }
			);
		}

		// Find the comment and verify ownership
		const existingComment = await prisma.comment.findUnique({
			where: { id: commentId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
			},
		});

		if (!existingComment) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		// Verify that the comment belongs to this post
		if (existingComment.postId !== artbook.post.id) {
			return NextResponse.json(
				{ error: "Comment does not belong to this artbook" },
				{ status: 400 }
			);
		}

		// Verify ownership - only the comment author can edit
		if (existingComment.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Forbidden - You can only edit your own comments" },
				{ status: 403 }
			);
		}

		// Update the comment
		const updatedComment = await prisma.comment.update({
			where: { id: commentId },
			data: {
				content: sanitizedContent,
				updatedAt: new Date(),
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				_count: {
					select: {
						replies: true,
						likes: true,
					},
				},
				likes: {
					where: {
						userId: session.user.id,
					},
					select: {
						id: true,
					},
				},
			},
		});

		// Transform the comment to include like information
		const transformedComment = {
			...updatedComment,
			likeCount: updatedComment._count.likes,
			userLiked: updatedComment.likes.length > 0,
			likes: undefined, // Remove the raw likes array from response
		};

		return NextResponse.json({
			message: "Comment updated successfully",
			comment: transformedComment,
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

		// Find the artbook's post
		const artbook = await prisma.artbook.findUnique({
			where: { slug },
			include: { post: true },
		});

		if (!artbook || !artbook.post) {
			return NextResponse.json(
				{ error: "Artbook or post not found" },
				{ status: 404 }
			);
		}

		// Find the comment and verify ownership
		const existingComment = await prisma.comment.findUnique({
			where: { id: commentId },
			include: {
				_count: {
					select: {
						replies: true,
					},
				},
			},
		});

		if (!existingComment) {
			return NextResponse.json({ error: "Comment not found" }, { status: 404 });
		}

		// Verify that the comment belongs to this post
		if (existingComment.postId !== artbook.post.id) {
			return NextResponse.json(
				{ error: "Comment does not belong to this artbook" },
				{ status: 400 }
			);
		}

		// Verify ownership - only the comment author can delete
		if (existingComment.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Forbidden - You can only delete your own comments" },
				{ status: 403 }
			);
		}

		// Check if comment has replies
		if (existingComment._count.replies > 0) {
			// Instead of hard deletion, we could soft delete or replace content
			// For now, we'll prevent deletion of comments with replies
			return NextResponse.json(
				{
					error:
						"Cannot delete comment with replies. Consider editing the content instead.",
				},
				{ status: 400 }
			);
		}

		// Delete the comment (this will cascade to any replies due to schema constraints)
		await prisma.comment.delete({
			where: { id: commentId },
		});

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
