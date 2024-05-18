import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import { Draw, Modify, Select } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke } from 'ol/style'
import { getLength } from 'ol/sphere'
import LineString from 'ol/geom/LineString'
import Overlay from 'ol/Overlay'
import { Coordinate } from 'ol/coordinate'
import { calculateAzimuth, calculateDistance } from './utils/calculations'
import ButtonContainer from './components/ButtonContainer/ButtonContainer'
import ResultsContainer from './components/ResultsContainer/ResultsContainer'
import MapLayer from './components/MapLayer/MapLayer'

function App() {
  const mapRef = useRef<Map | null>(null)
  const drawRef = useRef<Draw | null>(null)
  const modifyRef = useRef<Modify | null>(null)
  const selectRef = useRef<Select | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const [totalLength, setTotalLength] = useState<number>(0)
  const [azimuths, setAzimuths] = useState<string[][]>([])
  const [distances, setDistances] = useState<string[][]>([])
  const [isEditing, setIsEditing] = useState<boolean>(false)
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
          const distancesList: string[] = []
          for (let i = 0; i < coordinates.length - 1; i++) {
            const azimuth = calculateAzimuth(coordinates[i], coordinates[i + 1])
            const distance = calculateDistance(coordinates[i], coordinates[i + 1]) / 1000
            azimuthsList.push(azimuth)
            distancesList.push(`${distance.toFixed(2)} km`)
          }
          setAzimuths((prevAzimuths) => [...prevAzimuths, azimuthsList])
          setDistances((prevDistances) => [...prevDistances, distancesList])

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
        setAzimuths([])
        setDistances([])
      }
      if (overlay) {
        overlay.setPosition(undefined)
      }
    }
  }

  const enableEditing = () => {
    if (mapRef.current) {
      if (isEditing) {
        // Disable editing
        if (selectRef.current) {
          mapRef.current.removeInteraction(selectRef.current)
          selectRef.current = null
        }
        if (modifyRef.current) {
          mapRef.current.removeInteraction(modifyRef.current)
          modifyRef.current = null
        }
        setIsEditing(false)
      } else {
        const select = new Select()
        const modify = new Modify({ source: vectorSourceRef.current! })

        modify.on('modifyend', () => {
          const features = vectorSourceRef.current!.getFeatures()
          let totalLen = 0
          const newAzimuths: string[][] = []
          const newDistances: string[][] = []

          features.forEach((feature) => {
            const geometry = feature.getGeometry()
            if (geometry instanceof LineString) {
              const coordinates: Coordinate[] = geometry.getCoordinates()
              const azimuthsList: string[] = []
              const distancesList: string[] = []
              for (let i = 0; i < coordinates.length - 1; i++) {
                const azimuth = calculateAzimuth(coordinates[i], coordinates[i + 1])
                const distance = calculateDistance(coordinates[i], coordinates[i + 1]) / 1000
                azimuthsList.push(azimuth)
                distancesList.push(`${distance.toFixed(2)} km`)
              }
              newAzimuths.push(azimuthsList)
              newDistances.push(distancesList)

              const length = getLength(geometry)
              totalLen += length
            }
          })

          setTotalLength(totalLen / 1000)
          setAzimuths(newAzimuths)
          setDistances(newDistances)
        })

        mapRef.current.addInteraction(select)
        mapRef.current.addInteraction(modify)

        selectRef.current = select
        modifyRef.current = modify
        setIsEditing(true)
      }
    }
  }

  return (
    <>
      <MapLayer />
      {totalLength ? (
        <ResultsContainer totalLength={totalLength} azimuths={azimuths} distances={distances} />
      ) : null}
      <ButtonContainer
        startDrawing={startDrawing}
        stopDrawing={stopDrawing}
        enableEditing={enableEditing}
        isEditing={isEditing}
      />
    </>
  )
}

export default App
