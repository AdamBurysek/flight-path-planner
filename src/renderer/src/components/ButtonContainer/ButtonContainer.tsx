import React from 'react'
import './ButtonContainer.css'

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
    <div className="button-container">
      {isDrawing ? (
        <button onClick={stopDrawing} className="stop-drawing-button">
          Draw
        </button>
      ) : (
        <button onClick={startDrawing} className="start-drawing-button">
          Draw
        </button>
      )}
      <button
        onClick={enableEditing}
        className={isEditing ? 'editing-button-active' : 'editing-button'}
      >
        Edit
      </button>
      {totalLength ? (
        <button onClick={clearDrawing} className="clear-button">
          Clear All
        </button>
      ) : null}
    </div>
  )
}

export default ButtonContainer
