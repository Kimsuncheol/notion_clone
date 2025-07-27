import { fetchPublicNotes } from "@/services/firebase";
import { NextApiRequest, NextApiResponse } from "next";

// pages/api/public-notes.ts - API Route 캐싱
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Cache-Control 헤더 설정
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    const notes = await fetchPublicNotes(5);
    return res.json(notes);
}