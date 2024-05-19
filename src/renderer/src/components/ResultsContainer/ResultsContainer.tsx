import React from 'react'

type ResultsContainerProps = {
  totalLength: number
  azimuths: string[][]
  distances: string[][]
  angles: string[][]
  useMiles: boolean
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
        Azimuths, Distances, and Turn Angles:
        {azimuths.map((azimuthList, lineIndex) => (
          <div key={lineIndex}>
            <strong>
              Line {lineIndex + 1}: Total Distance:{' '}
              {distances[lineIndex]
                .reduce((acc, curr) => {
                  const value = parseFloat(curr.split(' ')[0])
                  return acc + (isNaN(value) ? 0 : value)
                }, 0)
                .toFixed(2)}{' '}
              {useMiles ? 'miles' : 'km'}
            </strong>
            <ul>
              {azimuthList.map((azimuth, segmentIndex) => (
                <li key={segmentIndex}>
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
