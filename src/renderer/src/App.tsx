import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import { Draw } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke } from 'ol/style'
import { getLength } from 'ol/sphere'
import LineString from 'ol/geom/LineString'
import Overlay from 'ol/Overlay'
import { Coordinate } from 'ol/coordinate'
import { calculateAzimuth, calculateDistance } from './utils/calculations'

function App() {
  const mapRef = useRef<Map | null>(null)
  const drawRef = useRef<Draw | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const [totalLength, setTotalLength] = useState<number>(0)
  const [azimuths, setAzimuths] = useState<string[][]>([])
  const [overlayElement, setOverlayElement] = useState<HTMLDivElement | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)

  useEffect(() => {
    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 4
        })
      })
    })

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([16.6068, 49.1951]),
        zoom: 12
      })
    })

    const overlayElement = document.createElement('div')
    overlayElement.style.position = 'absolute'
    overlayElement.style.background = 'white'
    overlayElement.style.padding = '5px'
    overlayElement.style.border = '1px solid black'
    overlayElement.style.pointerEvents = 'none'
    setOverlayElement(overlayElement)

    const overlay = new Overlay({
      element: overlayElement,
      positioning: 'bottom-left',
      offset: [15, -15]
    })
    map.addOverlay(overlay)
    setOverlay(overlay)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
      }
    }
  }, [])

  const startDrawing = () => {
    if (mapRef.current && !drawRef.current) {
      const draw = new Draw({
        source: vectorSourceRef.current!,
        type: 'LineString'
      })

      draw.on('drawend', (event) => {
        const geometry = event.feature.getGeometry()
        if (geometry instanceof LineString) {
          const coordinates: Coordinate[] = geometry.getCoordinates()
          const azimuthsList: string[] = []
          for (let i = 0; i < coordinates.length - 1; i++) {
            const azimuth = calculateAzimuth(coordinates[i], coordinates[i + 1])
            azimuthsList.push(azimuth)
          }
          setAzimuths((prevAzimuths) => [...prevAzimuths, azimuthsList])

          const length = getLength(geometry)
          const lengthInKm = length / 1000
          setTotalLength((prevTotal) => prevTotal + lengthInKm)
        } else {
          console.log('Geometry is undefined or not a LineString')
        }
        if (overlay) {
          overlay.setPosition(undefined)
        }
      })

      mapRef.current.addInteraction(draw)
      drawRef.current = draw

      mapRef.current.on('pointermove', (event) => {
        if (
          drawRef.current?.getOverlay()?.getSource()?.getFeatures()?.[0]?.getGeometry() instanceof
          LineString
        ) {
          const geometry = drawRef.current
            .getOverlay()
            .getSource()!
            .getFeatures()[0]
            .getGeometry() as LineString
          const coordinates: Coordinate[] = geometry.getCoordinates()
          if (coordinates.length > 1) {
            const lastPoint: [number, number] = coordinates[coordinates.length - 2] as [
              number,
              number
            ]
            const currentPoint: [number, number] = event.coordinate as [number, number]
            const azimuth = calculateAzimuth(lastPoint, currentPoint)
            const distance = calculateDistance(lastPoint, currentPoint)
            overlayElement!.innerHTML = `Azimuth: ${azimuth}<br>Distance: ${(distance / 1000).toFixed(2)} km`
            overlay!.setPosition([currentPoint[0] + 10, currentPoint[1] - 10])
          }
        }
      })
    }
  }

  const stopDrawing = () => {
    if (mapRef.current && drawRef.current) {
      mapRef.current.removeInteraction(drawRef.current)
      drawRef.current = null
      if (vectorSourceRef.current) {
        vectorSourceRef.current.clear()
        setTotalLength(0)
        setAzimuths([]) // Clear azimuths when stopping drawing
      }
      if (overlay) {
        overlay.setPosition(undefined)
      }
    }
  }

  return (
    <>
      <div
        id="map"
        className="map"
        style={{ width: '100%', height: '100vh', position: 'relative' }}
      ></div>
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
        Azimuths:
        {azimuths.map((azimuthList, lineIndex) => (
          <div key={lineIndex}>
            <strong>Line {lineIndex + 1}:</strong>
            <ul>
              {azimuthList.map((azimuth, segmentIndex) => (
                <li key={segmentIndex}>
                  Segment {segmentIndex + 1}: {azimuth}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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
        <button onClick={startDrawing}>Start Drawing</button>
        <button onClick={stopDrawing}>Stop Drawing</button>
      </div>
    </>
  )
}

export default App
