import { NextRequest, NextResponse } from 'next/server';
import { fetchUserPostsPage } from '@/services/my-post/firebase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userEmail = searchParams.get('userEmail');
  const tagName = searchParams.get('tag');
  const tagId = searchParams.get('tagId');
  const startAfterDocId = searchParams.get('startAfterDocId');
  const limitCount = Number(searchParams.get('limit') || '10');

  if (!userEmail) {
    return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });
  }

  const normalizedTag = tagName ? tagName.trim().toLowerCase() : undefined;
  const isAllTag = normalizedTag === 'all';

  const tag = normalizedTag && !isAllTag
    ? { id: tagId || normalizedTag, name: normalizedTag }
    : undefined;

  const { posts, lastDocId, hasMore } = await fetchUserPostsPage(userEmail, tag, {
    limitCount,
    startAfterDocId,
  });

  return NextResponse.json({
    posts,
    hasMore,
    lastDocId: lastDocId ?? null,
  });
}

