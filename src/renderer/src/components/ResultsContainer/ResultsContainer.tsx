import React from 'react'

type ResultsContainerProps = {
  totalLength: number
  azimuths: string[][]
  distances: string[][]
}

const ResultsContainer: React.FC<ResultsContainerProps> = ({
  totalLength,
  azimuths,
  distances
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
        Total Length: {totalLength.toFixed(2)} km
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
        Azimuths and Distances:
        {azimuths.map((azimuthList, lineIndex) => (
          <div key={lineIndex}>
            <strong>Line {lineIndex + 1}:</strong>
            <ul>
              {azimuthList.map((azimuth, segmentIndex) => (
                <li key={segmentIndex}>
                  Segment {segmentIndex + 1}: Azimuth: {azimuth}, Distance:{' '}
                  {distances[lineIndex][segmentIndex]}
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
