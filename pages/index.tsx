import type { GetStaticProps } from 'next'
import axios from 'axios'
import DeviceList from '../components/DeviceList'

interface Props {
  initialDevices: any[]
  error?: string
}

export default function Home({ initialDevices, error }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <DeviceList initialDevices={initialDevices} initialError={error} />
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Get access token
    const tokenResponse = await axios.post('https://api2.arduino.cc/iot/v1/clients/token', 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.ARDUINO_CLIENT_ID || '',
        client_secret: process.env.ARDUINO_CLIENT_SECRET || '',
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

    const devices = Array.from(deviceMap.values())

    return {
      props: {
        initialDevices: devices
      },
      revalidate: 60 // Revalidate every 60 seconds
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      props: {
        initialDevices: [],
        error: 'Failed to fetch devices'
      }
    }
  }
} 