import React from 'react'

const MapLayer: React.FC = (): JSX.Element => {
  return (
    <div
      id="map"
      className="map"
      style={{ width: '100%', height: '100vh', position: 'relative' }}
    ></div>
  )
}

export default MapLayer
