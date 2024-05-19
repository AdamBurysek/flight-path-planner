import React from 'react'

type UnitsSwitchContainerProps = {
  useMiles: boolean
  useRadians: boolean
  setUseMiles: (value: boolean) => void
  setUseRadians: (value: boolean) => void
}

const UnitsSwitchContainer: React.FC<UnitsSwitchContainerProps> = ({
  useMiles,
  useRadians,
  setUseMiles,
  setUseRadians
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1px',
        width: '150px'
      }}
    >
      <button onClick={() => setUseMiles(!useMiles)}>
        Distance: {useMiles ? 'Miles' : 'Kilometers'}
      </button>
      <button onClick={() => setUseRadians(!useRadians)}>
        Turn Angle: {useRadians ? 'Radians' : 'Degrees'}
      </button>
    </div>
  )
}

export default UnitsSwitchContainer
