import { adminVerifyGetResponse, adminVerifyPostResponse } from './admin-verify-logic.js'

type VercelRequest = {
  method?: string
  body?: unknown
}

type VercelResponse = {
  status: (code: number) => { json: (body: unknown) => void }
  setHeader: (name: string, value: string) => void
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    res.status(200).json(adminVerifyGetResponse())
    return
  }

  if (req.method === 'POST') {
    res.status(200).json(adminVerifyPostResponse(req.body))
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
