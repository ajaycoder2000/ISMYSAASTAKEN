import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';

// Cache stats for 5 minutes
let cachedStats: { scans24h: number; scansTotal: number; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedStats);
    }
    
    await dbConnect();
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [scans24h, scansTotal] = await Promise.all([
      Scan.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
      Scan.countDocuments(),
    ]);
    
    cachedStats = { scans24h, scansTotal, timestamp: Date.now() };
    
    return NextResponse.json({ scans24h, scansTotal });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ scans24h: 0, scansTotal: 0 });
  }
}
