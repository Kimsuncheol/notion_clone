import { mintColor1 } from '@/constants/color';
import Link from 'next/link';
import React from 'react'

interface TagsCardProps {
  tag: string;
  postCount: number;
  isHighlighted?: boolean;
}

export default function TagsCard({ tag, postCount, isHighlighted = false }: TagsCardProps) {
  return (
    <Link href={`/tags/${tag}`} className="rounded-lg p-4 cursor-pointer w-full">
      <h3 className={`text-lg w-fit bg-gray-400/10 rounded-full px-5 py-2 font-medium mb-2 ${isHighlighted ? 'text-green-400' : 'text-white'}`} style={{ color: mintColor1 }}>
        {tag}
      </h3>
      <p className="text-gray-400 text-sm px-4 py-2">
        {postCount}개의 포스트
      </p>
    </Link>
  );
}