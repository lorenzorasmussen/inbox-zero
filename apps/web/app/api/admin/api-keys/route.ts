import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/utils/middleware';
import prisma from '@/utils/prisma';
import { z } from 'zod';

// Validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const deleteApiKeySchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Types
export type CreateApiKeyResponse = {
  success: boolean;
  key?: {
    id: string;
    keyId: string;
    name: string;
    description?: string;
    hashedKey: string;
    createdAt: string;
  };
  error?: string;
};

export type ListApiKeysResponse = {
  keys: Array<{
    id: string;
    keyId: string;
    name: string;
    description?: string;
    hashedKey: string;
    isActive: boolean;
    createdAt: string;
    lastUsedAt?: string;
    usageCount: number;
  }>;
  total: number;
};

export type DeleteApiKeyResponse = {
  success: boolean;
  error?: string;
};

// API handlers
export const GET = withAuth(async (request: NextRequest) => {
  const { userId } = request.auth;

  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        keyId: true,
        name: true,
        description: true,
        hashedKey: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
        usageCount: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.apiKey.count({ where: { userId } });

    const response: ListApiKeysResponse = { keys, total };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest) => {
  const { userId } = request.auth;

  try {
    const body = await request.json();
    const validation = createApiKeySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error?.message || 'Invalid request body' },
        { status: 400 }
      );
    }

    // Generate a simple API key (in real implementation, this would be more secure)
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const hashedKey = `hashed_${keyId}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: validation.data.name,
        description: validation.data.description,
        keyId,
        hashedKey,
        isActive: true,
      },
    });

    const response: CreateApiKeyResponse = {
      success: true,
      key: {
        id: apiKey.id,
        keyId,
        name: apiKey.name,
        description: apiKey.description,
        hashedKey,
        createdAt: apiKey.createdAt.toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  const { userId } = request.auth;

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    const validation = deleteApiKeySchema.safeParse({ id: keyId });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error?.message || 'Invalid key ID' },
        { status: 400 }
      );
    }

    // Check if key belongs to user
    const existingKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!existingKey) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    // Soft delete (deactivate) the key
    await prisma.apiKey.update({
      where: { id: keyId, userId },
      data: { isActive: false },
    });

    const response: DeleteApiKeyResponse = { success: true };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
});
