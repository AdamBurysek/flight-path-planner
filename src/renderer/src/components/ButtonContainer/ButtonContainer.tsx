import React from 'react'

type ButtonContainerProps = {
  startDrawing: () => void
  stopDrawing: () => void
  enableEditing: () => void
  clearDrawing: () => void
  isEditing: boolean
  isDrawing: boolean
  totalLength: number
}

const ButtonContainer: React.FC<ButtonContainerProps> = ({
  startDrawing,
  stopDrawing,
  enableEditing,
  clearDrawing,
  isEditing,
  isDrawing,
  totalLength
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
      {isDrawing ? (
        <button onClick={stopDrawing}>Stop Drawing</button>
      ) : (
        <button onClick={startDrawing}>Start Drawing</button>
      )}
      <button onClick={enableEditing} style={{ backgroundColor: isEditing ? 'green' : 'white' }}>
        Edit
      </button>
      {totalLength ? <button onClick={clearDrawing}>Clear</button> : null}
    </div>
  )
}

export default ButtonContainer
