import { useEffect, useState } from 'react'
import axios from 'axios'
import DeviceList from '../components/DeviceList'

const API_BASE_URL = 'https://api2.arduino.cc/iot/v2'
const AUTH_BASE_URL = 'https://api2.arduino.cc/iot/v1'

export default function Home() {
  const [devices, setDevices] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Step 1: Get access token using client credentials
        const tokenResponse = await axios({
          method: 'post',
          url: `${AUTH_BASE_URL}/clients/token`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_ID || '',
            client_secret: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_SECRET || '',
            audience: 'https://api2.arduino.cc/iot'
          }).toString()
        })

        const accessToken = tokenResponse.data.access_token

        // Step 2: Get list of devices
        const devicesResponse = await axios({
          method: 'get',
          url: `${API_BASE_URL}/devices`,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        // Step 3: Get things for each device
        const deviceThingsPromises = devicesResponse.data.map(async (device: any) => {
          const thingsResponse = await axios({
            method: 'get',
            url: `${API_BASE_URL}/things`,
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            params: {
              device_id: device.id
            }
          })

          return {
            ...device,
            things: thingsResponse.data
          }
        })

        const devicesWithThings = await Promise.all(deviceThingsPromises)
        setDevices(devicesWithThings)
        setLoading(false)
      } catch (err: any) {
        console.error('Error:', err.response?.data || err.message)
        setError(err.response?.data?.message || err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}
      <DeviceList initialDevices={devices} initialError={error} />
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </main>
  )
} 