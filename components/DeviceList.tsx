import { useState, useEffect } from 'react'
import axios from 'axios'

interface Device {
  id: string
  name: string
  device_id: string
  created_at: string
  properties: Array<{
    name: string
    variable_name: string
    type: string
  }>
}

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('/api/devices')
        setDevices(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch devices')
        setLoading(false)
        console.error('Error:', err)
      }
    }

    fetchDevices()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Arduino IoT Cloud Devices</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <div 
            key={device.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <h2 className="font-semibold text-lg mb-2">{device.name}</h2>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Device ID:</span> {device.device_id}</p>
              <p><span className="font-medium">Created:</span> {new Date(device.created_at).toLocaleDateString()}</p>
              {device.properties && device.properties.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Properties:</p>
                  <ul className="list-disc list-inside pl-2">
                    {device.properties.map((prop, index) => (
                      <li key={index} className="text-sm">
                        {prop.name} ({prop.type})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 