import prisma from '../lib/prisma';
import type { Request, Response } from 'express';
import { assertOwnershipOrAdmin } from '../utils/auth';

// --------------------
// Helpers
// --------------------
const getCommentOrFail = async (commentId: string, res: Response) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  
  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return null;
  }
  return comment;
}

const ensureCanModify = async (comment: { authorId: string }, req: Request, res: Response) => {
  if (!assertOwnershipOrAdmin(comment.authorId, req.user!)) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

// --------------------
// Public route controllers
// --------------------
const getCommentsByPostId = async (req: Request, res: Response) => {
  const postId = req.params.postId!;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  const commentId = req.params.id!;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};

// --------------------
// Protected route controllers
// --------------------
const createComment = async (req: Request, res: Response) => {
  const postId = req.params.postId!;
  const { content } = req.body;
  const authorId = req.user!.id;

  try {
    const newComment = await prisma.comment.create({
      data: { postId, authorId, content },
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

const updateComment = async (req: Request, res: Response) => {
  const commentId = req.params.id!;
  const { content } = req.body;

  const comment = await getCommentOrFail(commentId, res);
  if (!comment) return;

  if (!ensureCanModify(comment, req, res)) return;

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.id!;

  const comment = await getCommentOrFail(commentId, res);
  if (!comment) return;

  if (!ensureCanModify(comment, req, res)) return;

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

export default {
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};