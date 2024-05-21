import { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import ScaleLine from 'ol/control/ScaleLine'
import { defaults as defaultControls } from 'ol/control'
import XYZ from 'ol/source/XYZ'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import { Draw, Modify, Select } from 'ol/interaction'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

import { getLength } from 'ol/sphere'
import LineString from 'ol/geom/LineString'
import Overlay from 'ol/Overlay'
import { Coordinate } from 'ol/coordinate'
import {
  calculateAzimuth,
  calculateDistance,
  calculateTurnAngle,
  convertDistanceToMiles,
  convertAngleToRadians
} from './utils/calculations'
import ButtonContainer from './components/ButtonContainer/ButtonContainer'
import ResultsContainer from './components/ResultsContainer/ResultsContainer'
import MapLayer from './components/MapLayer/MapLayer'
import UnitsSwitchContainer from './components/UnitsSwitchContainer/UnitsSwitchContainer'
import { Stroke, Style } from 'ol/style'

function App() {
  const mapRef = useRef<Map | null>(null)
  const drawRef = useRef<Draw | null>(null)
  const modifyRef = useRef<Modify | null>(null)
  const selectRef = useRef<Select | null>(null)
  const scaleLineControlRef = useRef<ScaleLine | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const [totalLengthKm, setTotalLengthKm] = useState<number>(0)
  const [totalLengthMiles, setTotalLengthMiles] = useState<number>(0)
  const [azimuths, setAzimuths] = useState<string[][]>([])
  const [distancesKm, setDistancesKm] = useState<string[][]>([])
  const [distancesMiles, setDistancesMiles] = useState<string[][]>([])
  const [anglesDeg, setAnglesDeg] = useState<string[][]>([])
  const [anglesRad, setAnglesRad] = useState<string[][]>([])
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [overlayElement, setOverlayElement] = useState<HTMLDivElement | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [useMiles, setUseMiles] = useState<boolean>(false)
  const [useRadians, setUseRadians] = useState<boolean>(false)

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

    const scaleLineControl = new ScaleLine({
      units: 'metric',
      className: 'scale-line'
    })

    scaleLineControlRef.current = scaleLineControl

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
        center: fromLonLat([16.62, 49.19]), // Coordinates for Prague, Czech Republic
        zoom: 12
      }),
      controls: defaultControls().extend([scaleLineControl])
    })

    const overlayElement = document.createElement('div')
    overlayElement.id = 'overlay'
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

  useEffect(() => {
    if (scaleLineControlRef.current) {
      scaleLineControlRef.current.setUnits(useMiles ? 'imperial' : 'metric')
    }
  }, [useMiles])

  const startDrawing = () => {
    if (mapRef.current && !drawRef.current) {
      const draw = new Draw({
        source: vectorSourceRef.current!,
        type: 'LineString'
      })

      if (!isDrawing) {
        setIsDrawing(true)
      }

      draw.on('drawend', (event) => {
        const geometry = event.feature.getGeometry()
        if (geometry instanceof LineString) {
          const coordinates: Coordinate[] = geometry.getCoordinates()
          const azimuthsList: string[] = []
          const distancesKmList: string[] = []
          const distancesMilesList: string[] = []
          const anglesDegList: string[] = []
          const anglesRadList: string[] = []

          for (let i = 0; i < coordinates.length - 1; i++) {
            const azimuth = calculateAzimuth(coordinates[i], coordinates[i + 1])
            const distanceKm = calculateDistance(coordinates[i], coordinates[i + 1]) / 1000
            const distanceMiles = convertDistanceToMiles(distanceKm)

            azimuthsList.push(azimuth)
            distancesKmList.push(`${distanceKm.toFixed(2)} km`)
            distancesMilesList.push(`${distanceMiles.toFixed(2)} miles`)

            if (i > 0) {
              const { angle: angleDeg, direction } = calculateTurnAngle(
                coordinates[i - 1],
                coordinates[i],
                coordinates[i + 1]
              )
              const angleRad = convertAngleToRadians(angleDeg)

              anglesDegList.push(`${angleDeg.toFixed(2)}° ${direction}`)
              anglesRadList.push(`${angleRad.toFixed(2)} rad ${direction}`)
            } else {
              anglesDegList.push('N/A')
              anglesRadList.push('N/A')
            }
          }

          setAzimuths((prevAzimuths) => [...prevAzimuths, azimuthsList])
          setDistancesKm((prevDistances) => [...prevDistances, distancesKmList])
          setDistancesMiles((prevDistances) => [...prevDistances, distancesMilesList])
          setAnglesDeg((prevAngles) => [...prevAngles, anglesDegList])
          setAnglesRad((prevAngles) => [...prevAngles, anglesRadList])

          const lengthKm = getLength(geometry) / 1000
          const lengthMiles = convertDistanceToMiles(lengthKm)

          setTotalLengthKm((prevTotal) => prevTotal + lengthKm)
          setTotalLengthMiles((prevTotal) => prevTotal + lengthMiles)
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
            const distanceKm = calculateDistance(lastPoint, currentPoint) / 1000
            const distanceMiles = convertDistanceToMiles(distanceKm)
            let overlayText = `Azimuth:<br> ${azimuth}<br>Distance:<br> ${
              useMiles ? distanceMiles.toFixed(2) + ' miles' : distanceKm.toFixed(2) + ' km'
            }`

            if (coordinates.length > 2) {
              const secondLastPoint: [number, number] = coordinates[coordinates.length - 3] as [
                number,
                number
              ]
              const { angle: angleDeg, direction } = calculateTurnAngle(
                secondLastPoint,
                lastPoint,
                currentPoint
              )
              const angleRad = convertAngleToRadians(angleDeg)
              overlayText += `<br>Turn Angle:<br>${
                useRadians ? angleRad.toFixed(2) + ' rad' : angleDeg.toFixed(2) + '°'
              } ${direction}`
            }
            overlayElement!.innerHTML = overlayText
            overlay!.setPosition([currentPoint[0] + 10, currentPoint[1] - 10])
          }
        }
      })
    }
  }

  const stopDrawing = () => {
    if (mapRef.current && drawRef.current) {
      if (isDrawing) {
        setIsDrawing(false)
      }
      mapRef.current.removeInteraction(drawRef.current)
      drawRef.current = null
      if (overlay) {
        overlay.setPosition(undefined)
      }
    }
  }

  const clearAll = () => {
    if (mapRef.current && vectorSourceRef.current) {
      vectorSourceRef.current.clear()
      setTotalLengthKm(0)
      setTotalLengthMiles(0)
      setAzimuths([])
      setDistancesKm([])
      setDistancesMiles([])
      setAnglesDeg([])
      setAnglesRad([])
      if (overlay) {
        overlay.setPosition(undefined)
      }
    }
  }

  const enableEditing = () => {
    if (mapRef.current) {
      if (isEditing) {
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
          console.log(features)
          let totalLenKm = 0
          let totalLenMiles = 0
          const newAzimuths: string[][] = []
          const newDistancesKm: string[][] = []
          const newDistancesMiles: string[][] = []
          const newAnglesDeg: string[][] = []
          const newAnglesRad: string[][] = []

          features.forEach((feature) => {
            const geometry = feature.getGeometry()
            if (geometry instanceof LineString) {
              const coordinates: Coordinate[] = geometry.getCoordinates()
              const azimuthsList: string[] = []
              const distancesKmList: string[] = []
              const distancesMilesList: string[] = []
              const anglesDegList: string[] = []
              const anglesRadList: string[] = []

              for (let i = 0; i < coordinates.length - 1; i++) {
                const azimuth = calculateAzimuth(coordinates[i], coordinates[i + 1])
                const distanceKm = calculateDistance(coordinates[i], coordinates[i + 1]) / 1000
                const distanceMiles = convertDistanceToMiles(distanceKm)

                azimuthsList.push(azimuth)
                distancesKmList.push(`${distanceKm.toFixed(2)} km`)
                distancesMilesList.push(`${distanceMiles.toFixed(2)} miles`)

                if (i > 0) {
                  const { angle: angleDeg, direction } = calculateTurnAngle(
                    coordinates[i - 1],
                    coordinates[i],
                    coordinates[i + 1]
                  )
                  const angleRad = convertAngleToRadians(angleDeg)

                  anglesDegList.push(`${angleDeg.toFixed(2)}° ${direction}`)
                  anglesRadList.push(`${angleRad.toFixed(2)} rad ${direction}`)
                } else {
                  anglesDegList.push('N/A')
                  anglesRadList.push('N/A')
                }
              }

              newAzimuths.push(azimuthsList)
              newDistancesKm.push(distancesKmList)
              newDistancesMiles.push(distancesMilesList)
              newAnglesDeg.push(anglesDegList)
              newAnglesRad.push(anglesRadList)

              const lengthKm = getLength(geometry) / 1000
              totalLenKm += lengthKm
              totalLenMiles += convertDistanceToMiles(lengthKm)
            }
          })

          setTotalLengthKm(totalLenKm)
          setTotalLengthMiles(totalLenMiles)
          setAzimuths(newAzimuths)
          setDistancesKm(newDistancesKm)
          setDistancesMiles(newDistancesMiles)
          setAnglesDeg(newAnglesDeg)
          setAnglesRad(newAnglesRad)
        })

        mapRef.current.addInteraction(select)
        mapRef.current.addInteraction(modify)

        selectRef.current = select
        modifyRef.current = modify
        setIsEditing(true)
      }
    }
  }

  const deleteSegment = (lineIndex: number, segmentIndex: number) => {
    if (!vectorSourceRef.current) return

    const features = vectorSourceRef.current.getFeatures()
    if (lineIndex < 0 || lineIndex >= features.length) return

    const geometry = features[lineIndex].getGeometry() as LineString
    const coordinates = geometry.getCoordinates()

    if (segmentIndex < 0 || segmentIndex >= coordinates.length - 1) return

    coordinates.splice(segmentIndex + 1, 1)
    if (coordinates.length < 2) {
      vectorSourceRef.current.removeFeature(features[lineIndex])
    } else {
      geometry.setCoordinates(coordinates)
    }

    updateStateFromFeatures()
  }

  const updateStateFromFeatures = () => {
    if (!vectorSourceRef.current) return

    const features = vectorSourceRef.current.getFeatures()
    let totalLenKm = 0
    let totalLenMiles = 0
    const newAzimuths: string[][] = []
    const newDistancesKm: string[][] = []
    const newDistancesMiles: string[][] = []
    const newAnglesDeg: string[][] = []
    const newAnglesRad: string[][] = []

    features.forEach((feature) => {
      const geometry = feature.getGeometry()
      if (geometry instanceof LineString) {
        const coordinates: Coordinate[] = geometry.getCoordinates()
        const azimuthsList: string[] = []
        const distancesKmList: string[] = []
        const distancesMilesList: string[] = []
        const anglesDegList: string[] = []
        const anglesRadList: string[] = []

        for (let i = 0; i < coordinates.length - 1; i++) {
          const azimuth = calculateAzimuth(coordinates[i], coordinates[i + 1])
          const distanceKm = calculateDistance(coordinates[i], coordinates[i + 1]) / 1000
          const distanceMiles = convertDistanceToMiles(distanceKm)

          azimuthsList.push(azimuth)
          distancesKmList.push(`${distanceKm.toFixed(2)} km`)
          distancesMilesList.push(`${distanceMiles.toFixed(2)} miles`)

          if (i > 0) {
            const { angle: angleDeg, direction } = calculateTurnAngle(
              coordinates[i - 1],
              coordinates[i],
              coordinates[i + 1]
            )
            const angleRad = convertAngleToRadians(angleDeg)

            anglesDegList.push(`${angleDeg.toFixed(2)}° ${direction}`)
            anglesRadList.push(`${angleRad.toFixed(2)} rad ${direction}`)
          } else {
            anglesDegList.push('N/A')
            anglesRadList.push('N/A')
          }
        }

        newAzimuths.push(azimuthsList)
        newDistancesKm.push(distancesKmList)
        newDistancesMiles.push(distancesMilesList)
        newAnglesDeg.push(anglesDegList)
        newAnglesRad.push(anglesRadList)

        const lengthKm = getLength(geometry) / 1000
        totalLenKm += lengthKm
        totalLenMiles += convertDistanceToMiles(lengthKm)
      }
    })

    setTotalLengthKm(totalLenKm)
    setTotalLengthMiles(totalLenMiles)
    setAzimuths(newAzimuths)
    setDistancesKm(newDistancesKm)
    setDistancesMiles(newDistancesMiles)
    setAnglesDeg(newAnglesDeg)
    setAnglesRad(newAnglesRad)
  }

  const highlightFeature = (lineIndex: number, segmentIndex: number) => {
    if (!vectorSourceRef.current) return

    const features = vectorSourceRef.current.getFeatures()
    if (lineIndex < 0 || lineIndex >= features.length) return

    const geometry = features[lineIndex].getGeometry() as LineString
    const coordinates = geometry.getCoordinates()

    if (segmentIndex < 0 || segmentIndex >= coordinates.length - 1) return

    const targetCoordinate = coordinates[segmentIndex + 1]
    console.log(targetCoordinate) // Log the coordinate of segment + 1
  }

  return (
    <>
      <MapLayer />
      {totalLengthKm ? (
        <ResultsContainer
          totalLength={useMiles ? totalLengthMiles : totalLengthKm}
          azimuths={azimuths}
          distances={useMiles ? distancesMiles : distancesKm}
          angles={useRadians ? anglesRad : anglesDeg}
          useMiles={useMiles}
          onDeleteSegment={deleteSegment}
          onHoverSegment={highlightFeature}
        />
      ) : null}
      <ButtonContainer
        startDrawing={startDrawing}
        stopDrawing={stopDrawing}
        enableEditing={enableEditing}
        isEditing={isEditing}
        clearDrawing={clearAll}
        isDrawing={isDrawing}
        totalLength={totalLengthKm}
      />
      <UnitsSwitchContainer
        useMiles={useMiles}
        useRadians={useRadians}
        setUseMiles={setUseMiles}
        setUseRadians={setUseRadians}
      />
    </>
  )
}

export default App
