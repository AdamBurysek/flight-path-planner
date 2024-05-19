import React from 'react'

type ResultsContainerProps = {
  totalLength: number
  azimuths: string[][]
  distances: string[][]
  angles: string[][]
  useMiles: boolean // Add this prop to handle unit toggle
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  totalLength,
  azimuths,
  distances,
  angles,
  useMiles // Destructure the new prop
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
        Azimuths, Distances, and Angles:
        {azimuths.map((azimuthList, lineIndex) => (
          <div key={lineIndex}>
            <strong>Line {lineIndex + 1}:</strong>
            <ul>
              {azimuthList.map((azimuth, segmentIndex) => (
                <li key={segmentIndex}>
                  Segment {segmentIndex + 1}: Azimuth: {azimuth}, Distance:{' '}
                  {distances[lineIndex][segmentIndex]}, Angle: {angles[lineIndex][segmentIndex]}
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
