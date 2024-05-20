import React from 'react'
import './UnitsSwitchContainer.css'

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
    <div className="units-switch-container">
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
