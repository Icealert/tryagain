import { useState } from 'react'

interface Property {
  id: string
  name: string
  type: string
  permission: string
  value: any
  update_strategy: string
  variable_name: string
}

interface Thing {
  id: string
  name: string
  device_id: string
  created_at: string
  properties: Property[]
}

interface Device {
  id: string
  name: string
  things: Thing[]
}

interface Props {
  initialDevices: Device[]
  initialError?: string
}

export default function DeviceList({ initialDevices, initialError }: Props) {
  const [devices] = useState<Device[]>(initialDevices)
  const [error] = useState<string | null>(initialError || null)

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
                Device ID: {device.id}
              </span>
            </div>
            
            {device.things && device.things.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-medium text-lg mb-2">Things</h3>
                <div className="grid gap-4 pl-4">
                  {device.things.map((thing) => (
                    <div key={thing.id} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-medium text-md">{thing.name}</h4>
                      <p className="text-sm text-gray-500">Created: {new Date(thing.created_at).toLocaleDateString()}</p>
                      {thing.properties && thing.properties.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Properties:</p>
                          <ul className="list-disc list-inside pl-2">
                            {thing.properties.map((prop) => (
                              <li key={prop.id} className="text-sm text-gray-600">
                                {prop.name} ({prop.type})
                                {prop.value !== undefined && (
                                  <span className="ml-2 text-blue-600">
                                    = {JSON.stringify(prop.value)}
                                  </span>
                                )}
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