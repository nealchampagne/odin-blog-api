import prisma from '../lib/prisma';
import type { Request, Response } from 'express';

// --------------------
// Helpers
// --------------------
const getPostOrFail = async (postId: string, res: Response) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { comments: true },
  });
  
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return null;
  }
  return post;
}

// --------------------
// Public posts controllers
// --------------------
const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id!;

  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { comments: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.published && !isAdmin) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {

    const isAdmin = req.user?.role === 'ADMIN';

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    
    const skip = (page - 1) * pageSize;

    const where = isAdmin ? {} : { published: true };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({
        where,
      })
    ]);

    res.json({
      data: posts,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// --------------------
// Admin-only posts routes
// --------------------

const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [totalPosts, draftPosts, publishedPosts, totalComments, totalUsers] =
      await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { published: false } }),
        prisma.post.count({ where: { published: true } }),
        prisma.comment.count(),
        prisma.user.count()
      ]);
      
    res.json({
      totalPosts,
      draftPosts,
      publishedPosts,
      totalComments,
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load stats" });
  }
};

const createPost = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const authorId = req.user!.id;

  try {
    if (!title.trim() || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const newPost = await prisma.post.create({
      data: { authorId, title, content },
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
};

const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id!;
  const { title, content } = req.body;

  const post = await getPostOrFail(postId, res);
  if (!post) return;

  try {
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    console.log(post);
    console.log(req.user);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
  }
};

const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id!;

  const post = await getPostOrFail(postId, res);
  if (!post) return;

  try {
    await prisma.post.delete({
      where: { id: postId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

const publishPost = async (req: Request, res: Response) => {
  const postId = req.params.id!;

  const post = await getPostOrFail(postId, res);
  if (!post) return;

  try {
    const publishedPost = await prisma.post.update({
      where: { id: postId },
      data: { published: true },
    });
    res.json(publishedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish post' });
  }
};

const unpublishPost = async (req: Request, res: Response) => {
  const postId = req.params.id!;

  const post = await getPostOrFail(postId, res);
  if (!post) return;

  try {
    const unpublishedPost = await prisma.post.update({
      where: { id: postId },
      data: { published: false },
    });
    res.json(unpublishedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish post' });
  }
};

export default {
  getPostById,
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  getAdminStats,
};