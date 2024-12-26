import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const ARDUINO_API_URL = 'https://api2.arduino.cc/iot/v2'

async function getAccessToken() {
  try {
    const response = await axios.post('https://api2.arduino.cc/iot/v1/clients/token', {
      grant_type: 'client_credentials',
      client_id: process.env.ARDUINO_CLIENT_ID,
      client_secret: process.env.ARDUINO_CLIENT_SECRET,
      audience: 'https://api2.arduino.cc/iot'
    })
    return response.data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const accessToken = await getAccessToken()
    
    const response = await axios.get(`${ARDUINO_API_URL}/devices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return res.status(200).json(response.data)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return res.status(500).json({ message: 'Error fetching devices' })
  }
} 