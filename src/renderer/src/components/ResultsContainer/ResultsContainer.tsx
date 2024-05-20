import React from 'react'
import './ResultsContainer.css'

type ResultsContainerProps = {
  totalLength: number
  azimuths: string[][]
  distances: string[][]
  angles: string[][]
  useMiles: boolean
  onDeleteSegment: (lineIndex: number, segmentIndex: number) => void
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  totalLength,
  azimuths,
  distances,
  angles,
  useMiles,
  onDeleteSegment
}) => {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          padding: '5px'
        }}
      >
        Total Length: {totalLength.toFixed(2)} {useMiles ? 'miles' : 'km'}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          background: 'white',
          padding: '5px'
        }}
      >
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
                <li key={segmentIndex} className="segment-item">
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
