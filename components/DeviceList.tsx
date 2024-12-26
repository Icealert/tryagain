import { useState, useEffect } from 'react'
import axios from 'axios'

interface Thing {
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

interface Device {
  id: string
  name: string
  serial: string
  type: string
  things: Thing[]
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
      <div className="grid gap-6">
        {devices.map((device) => (
          <div 
            key={device.id}
            className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-xl">{device.name}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {device.type}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              <p><span className="font-medium">Serial:</span> {device.serial}</p>
              <p><span className="font-medium">Device ID:</span> {device.id}</p>
            </div>
            
            {device.things && device.things.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-medium text-lg mb-2">Associated Things</h3>
                <div className="grid gap-4 pl-4">
                  {device.things.map((thing) => (
                    <div key={thing.id} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-medium text-md">{thing.name}</h4>
                      <p className="text-sm text-gray-500">Created: {new Date(thing.created_at).toLocaleDateString()}</p>
                      {thing.properties && thing.properties.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Properties:</p>
                          <ul className="list-disc list-inside pl-2">
                            {thing.properties.map((prop, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {prop.name} ({prop.type})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No things associated with this device</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 