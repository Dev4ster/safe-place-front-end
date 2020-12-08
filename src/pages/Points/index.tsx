import React, {useEffect, useState} from 'react'
import { TileLayer, Marker, MapContainer, Popup } from 'react-leaflet'
import { FiCheckCircle, FiChevronRight } from 'react-icons/fi'
import AsyncSelect from 'react-select/async';

import Chips, {Chip} from 'react-chips'

import './styles.css'

import api from '../../services/api'

import Icon from '../../assets/pin.svg'


interface PointsDATA {
  id: number
  title: string
  email: string
  whatsapp: string
  address: string
  city: string
  uf: string
  latitude: number
  longitude: number
}

type PointsDATASelected  = PointsDATA & {
  assessments: {
    assessment: string,
    has: boolean
  }[]
}

interface UFDTO {
  sigla: string
  nome: string
}

interface AssessmentsData {
  id: number
  assessment: string
}


const Points = () => {
  const [points, setPoints] = useState<PointsDATA[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [selectedPoint, setSelectedPoint] = useState<PointsDATASelected>(null)
  const [citys, setCitys] = useState([])
  const [selectedCitys, setSelectedCitys] = useState<string[]>([])
  const [filterAssessments, setFilterAssessments] = useState<string[]>([])
  const [assessments, setAssessments] = useState<string[]>([])

  const loadPoint = async (id: number): Promise<PointsDATASelected>  => {
    const response = await api.get('/points/'+id)
    setSelectedPoint(response.data)
    return response.data
  }

  const mapResponseToValuesAndLabels = (data : PointsDATASelected) => ({
    value: data.id,
    label: data.title + ', \n' + data.address + ' - ' + data.city + ', ' + data.uf,
  });

  async function callApi(value) {
    const response = await api.get('/points', {params: {
      title: value
    }})
    const dataMapped = response.data.map(mapResponseToValuesAndLabels)
    .filter((i) => i.label.toLowerCase().includes(value.toLowerCase()))
    return dataMapped;
  }

  const handleSelectPoint = async (data: {value: number, label: string}) => {
    const res = await loadPoint(data.value)
    const pointPresent = points.find(point=> point.id === data.value)
    if(!pointPresent){
      setPoints(prevPoints => [...prevPoints, res])
    }
  }

  const loadUfs = () => new Promise((resolve, reject) => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(res=> res.json())
    .then(res=> res.map((res: UFDTO) => ({
      label: res.sigla,
      value: res.sigla
    })))
    .then(resolve)
    .catch(reject)
  })

  const handleSelectUf = async (data: {value: number, label: string}) => {
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${data.value}/municipios`)
    .then(res=> res.json())
    .then((res: {nome: string}[]) => res.map(city => city.nome))
    .then(setCitys)
  }

  useEffect(()=>{
    const loadPoints = async () => {
      const response = await api.get('/points')
      setPoints(response.data)
    }

    const loadAssessments = async () => {
      const response = await api.get('/assessments')
      console.log(response.data)
      setAssessments(response.data.map((ass: AssessmentsData) => ass.assessment))
    }
    loadPoints()
    loadAssessments()
  }, [])


  return (
    <div id="points-page">
      <main>
        <MapContainer 
            center={[ -23.5790555,-46.6419057]} 
            zoom={10} 
            >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map(point => (
            <Marker 
            position={[ point.latitude, point.longitude]} 
            title={point.title}
            alt={point.title}
            eventHandlers={{
              click:(e) => {
                //loadPoint(point.id)
              },
            }}
            >
              <Popup 
              onClose={()=>setSelectedPoint(null)}
              onOpen={()=>{loadPoint(point.id)}}
              >
                <div id="content-popup">
                  <strong>
                    {point.address} - {point.city}, {point.uf}
                  </strong>
                  <a id="ir" href="#!sd" target="__blank">
                    <FiChevronRight color="#fff" size={20} />
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
          </MapContainer>
          <div id="panel">
            <div className="content">
              <h1>Insira abaixo o lugar que você deseja visitar.</h1>

              <fieldset>
              <AsyncSelect
                cacheOptions
                loadOptions={callApi}
                onInputChange={(data) => {
                  console.log(data);
                }}
                onChange={handleSelectPoint}
                placeholder="Nome do local ou endereço"
                defaultOptions
              />
              <small>Filtros</small>
              <div className="filters-line">
              <AsyncSelect
                cacheOptions
                loadOptions={loadUfs}
                onChange={handleSelectUf}
                placeholder="Uf"
                defaultOptions
              />      
              <Chips
                value={selectedCitys}
                onChange={setSelectedCitys}
                placeholder="Munícipios"
                suggestions={citys}
              />
              </div>

              <Chips
                value={filterAssessments}
                onChange={setFilterAssessments}
                placeholder="Avaliações"
                suggestions={assessments}
              />

                  {selectedPoint && (
                    <small>{selectedPoint?.address} - {selectedPoint?.city}, {selectedPoint?.uf}</small>
                  )}
                </fieldset>
                {selectedPoint && (
                <div className="selected-point">
                  <h2>{selectedPoint.title}</h2>
                  <div className="assessments">
                  <h2>Avaliação do estabelecimento</h2>
                    <ul>
                      {selectedPoint?.assessments.map(assessment => (
                        <li key={assessment.assessment + Math.random()}>
                          <FiCheckCircle size={30} color="#4BD4DD" />
                          <span>{assessment.assessment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a 
                  className="report"
                  href="#!" 
                  target="_blank" 
                  rel="noopener noreferrer">
                    reportar dados incorretos
                  </a>
              </div>
                )}
            </div>
          </div>
        </main>
    </div>
  
  )
}

export default Points