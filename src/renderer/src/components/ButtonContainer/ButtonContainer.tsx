import React from 'react'

type ButtonContainerProps = {
  startDrawing: () => void
  stopDrawing: () => void
  enableEditing: () => void
  clearDrawing: () => void
  isEditing: boolean
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({
  startDrawing,
  stopDrawing,
  enableEditing,
  clearDrawing,
  isEditing
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}
    >
      <button onClick={startDrawing} disabled={isEditing}>
        Start Drawing
      </button>
      <button onClick={stopDrawing} disabled={isEditing}>
        Stop Drawing
      </button>
      <button onClick={enableEditing} style={{ backgroundColor: isEditing ? 'green' : 'white' }}>
        Edit
      </button>
      <button onClick={clearDrawing} disabled={isEditing}>
        Clear
      </button>
    </div>
  )
}

export default ButtonContainer
