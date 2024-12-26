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
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
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
    
    // First get the list of devices
    const devicesResponse = await axios.get(`${ARDUINO_API_URL}/devices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    // Then get the associated things for each device
    const devices = devicesResponse.data
    const thingsPromises = devices.map(device => 
      axios.get(`${ARDUINO_API_URL}/things`, {
        params: {
          device_id: device.id
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
    )

    const thingsResponses = await Promise.all(thingsPromises)
    const devicesWithThings = devices.map((device, index) => ({
      ...device,
      things: thingsResponses[index].data
    }))

    return res.status(200).json(devicesWithThings)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return res.status(500).json({ 
      message: 'Error fetching devices', 
      error: error.response?.data || error.message 
    })
  }
} 