import { useEffect, useState } from 'react'
import axios from 'axios'
import DeviceList from '../components/DeviceList'

export default function Home() {
  const [devices, setDevices] = useState([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Get access token
        const tokenResponse = await axios.post('https://api2.arduino.cc/iot/v1/clients/token', 
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_ID || '',
            client_secret: process.env.NEXT_PUBLIC_ARDUINO_CLIENT_SECRET || '',
            audience: 'https://api2.arduino.cc/iot'
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )

        const accessToken = tokenResponse.data.access_token

        // Get things (which includes devices)
        const thingsResponse = await axios.get('https://api2.arduino.cc/iot/v2/things', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        // Get properties for each thing
        const things = thingsResponse.data
        const propertiesPromises = things.map(thing => 
          axios.get(`https://api2.arduino.cc/iot/v2/things/${thing.id}/properties`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
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
        setDevices(devicesArray)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch devices')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <DeviceList initialDevices={devices} initialError={error} />
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </main>
  )
} 