import { useEffect, useState } from 'react'
import axios from 'axios'
import DeviceList from '../components/DeviceList'

// Configure axios defaults
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.withCredentials = false

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }
})

export default function Home() {
  const [devices, setDevices] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching with credentials:', {
          clientId: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_ID,
          hasSecret: !!process.env.NEXT_PUBLIC_ARDUINO_CLIENT_SECRET
        })

        // Get access token
        const tokenResponse = await axiosInstance.post(
          'https://api2.arduino.cc/iot/v1/clients/token',
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_ID || '',
            client_secret: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_SECRET || '',
            audience: 'https://api2.arduino.cc/iot'
          }).toString()
        )

        const accessToken = tokenResponse.data.access_token
        console.log('Got access token:', !!accessToken)

        // Configure headers for subsequent requests
        const apiConfig = {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }

        // Get things (which includes devices)
        const thingsResponse = await axiosInstance.get(
          'https://api2.arduino.cc/iot/v2/things',
          apiConfig
        )

        console.log('Got things:', thingsResponse.data.length)

        // Get properties for each thing
        const things = thingsResponse.data
        const propertiesPromises = things.map(thing => 
          axiosInstance.get(
            `https://api2.arduino.cc/iot/v2/things/${thing.id}/properties`,
            apiConfig
          )
        )

        const propertiesResponses = await Promise.all(propertiesPromises)
        const thingsWithProperties = things.map((thing, index) => ({
          ...thing,
          properties: propertiesResponses[index].data
        }))

        // Group things by device
        const deviceMap = new Map()
        thingsWithProperties.forEach(thing => {
          if (!deviceMap.has(thing.device_id)) {
            deviceMap.set(thing.device_id, {
              id: thing.device_id,
              name: thing.device_name || 'Unknown Device',
              things: []
            })
          }
          deviceMap.get(thing.device_id).things.push(thing)
        })

        const devicesArray = Array.from(deviceMap.values())
        console.log('Processed devices:', devicesArray.length)
        setDevices(devicesArray)
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching data:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setError(`Failed to fetch devices: ${err.message}`)
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