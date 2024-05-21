import React from 'react'
import './ResultsContainer.css'

type ResultsContainerProps = {
  totalLength: number
  azimuths: string[][]
  distances: string[][]
  angles: string[][]
  useMiles: boolean
  onDeleteSegment: (lineIndex: number, segmentIndex: number) => void
  onHoverSegment: (lineIndex: number, segmentIndex: number) => void // Add this line
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  totalLength,
  azimuths,
  distances,
  angles,
  useMiles,
  onDeleteSegment,
  onHoverSegment // Add this line
}) => {
  const handleMouseEnter = (lineIndex: number, segmentIndex: number) => {
    console.log(`Line: ${lineIndex}, Segment: ${segmentIndex}`)
    onHoverSegment(lineIndex, segmentIndex) // Call this function on hover
  }

  return (
    <>
      <div className="total-length-container">
        Total Length: {totalLength.toFixed(2)} {useMiles ? 'miles' : 'km'}
      </div>
      <div className="results-container">
        Azimuths, Distances, and Turn Angles:
        {azimuths.map((azimuthList, lineIndex) => (
          <div key={lineIndex}>
            <strong>
              Line {lineIndex + 1} (Total Distance:{' '}
              {distances[lineIndex].reduce((acc, dist) => acc + parseFloat(dist), 0).toFixed(2)}{' '}
              {useMiles ? 'miles' : 'km'}):
            </strong>
            <ul>
              {azimuthList.map((azimuth, segmentIndex) => (
                <li
                  key={segmentIndex}
                  className="segment-item"
                  onMouseEnter={() => handleMouseEnter(lineIndex, segmentIndex)}
                >
                  <button
                    className="delete-button"
                    onClick={() => onDeleteSegment(lineIndex, segmentIndex)}
                  >
                    Delete
                  </button>
                  Segment {segmentIndex + 1}: Azimuth: {azimuth}, Distance:{' '}
                  {distances[lineIndex][segmentIndex]}, Turn Angle:{' '}
                  {angles[lineIndex][segmentIndex]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

export default ResultsContainer
