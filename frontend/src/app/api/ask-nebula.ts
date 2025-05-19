// pages/api/ask-nebula.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { type Address as ViemAddress } from 'viem'; 

interface RequestBodyFromFrontend {
    message?: string; 
    userWalletAddress?: ViemAddress; 
    testMessage?: string; 
}
type ResponseData = {
  message?: string;
  receivedBody?: RequestBodyFromFrontend;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log(`[API Route Test] ${req.method} request received at /api/ask-nebula`);
  if (req.method === 'POST') {
    console.log("[API Route Test] Request body:", req.body);
    res.status(200).json({ message: 'Test successful! API route /api/ask-nebula is working.', receivedBody: req.body });
  } else if (req.method === 'GET') {
    res.status(200).json({ message: 'Test successful via GET! API route /api/ask-nebula is working.' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}