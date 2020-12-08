import React, {useEffect, useState} from 'react'
import { TileLayer, Marker, MapContainer, Popup } from 'react-leaflet'
import { FiCheckCircle, FiChevronRight, FiXCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

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

interface LoadPointsDTO  {
  uf?: string,
  city?: string[],
  assessments?: number[]
}


const Points = () => {
  const [points, setPoints] = useState<PointsDATA[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [selectedPoint, setSelectedPoint] = useState<PointsDATASelected>(null)
  const [citys, setCitys] = useState([])
  const [assessments, setAssessments] = useState<AssessmentsData[]>([])


  // filter
  const [selectedUf, setSelectedUf] = useState<string>()
  const [selectedCitys, setSelectedCitys] = useState<string[]>([])
  const [filterAssessments, setFilterAssessments] = useState<string[]>([])




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
    setSelectedUf(data.label)
  }

  const loadPoints = async ( data? : LoadPointsDTO) => {
    const response = await api.get('/points', {params:{
      uf: data?.uf,
      citys: data?.city.join(','),
      assessments: data?.assessments.join(',')
    }})
    setPoints(response.data)
  }

  useEffect(()=>{
    const loadAssessments = async () => {
      const response = await api.get('/assessments')
      console.log(response.data)
      setAssessments(response.data)
    }
    loadPoints()
    loadAssessments()
  }, [])

  useEffect(()=>{
    if(selectedUf || selectedCitys || filterAssessments){
        loadPoints({
        uf:selectedUf,
        city:selectedCitys,
        assessments: filterAssessments.map(ass => {
          const findAss = assessments.find(asf => asf.assessment === ass)
          return findAss.id
        })
      })
    }
    
  }, [selectedUf, selectedCitys, filterAssessments, assessments])


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
                  <a id="ir" href={`https://www.google.com/maps/place/${point.latitude},${point.longitude}`} target="__blank">
                    <FiChevronRight color="#fff" size={20} />
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
          </MapContainer>
          <div id="panel" style={{
            height: selectedPoint && window.innerWidth <= 900 
            ? '90%' :  window.innerWidth > 900 ? '100vh' : '40%'
          }}>
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
                suggestions={assessments.map(ass => ass.assessment)}
              />

                  {selectedPoint && (
                    <small>{selectedPoint?.address} - {selectedPoint?.city}, {selectedPoint?.uf}</small>
                  )}
                </fieldset>
                {selectedPoint && (
                <div className="selected-point">
                  <h2>{selectedPoint.title}</h2>
                  <a href={`mailto:${selectedPoint.email}`}>
                    <h3>{selectedPoint.email}</h3>
                  </a>
                  <a href={`https://wa.me/${selectedPoint.whatsapp}`}>
                    <FaWhatsapp color="#25D334" size={20} />
                    <h4>{selectedPoint.whatsapp}</h4>
                  </a>
                  <div className="assessments">
                  <h2>Avaliação do estabelecimento</h2>
                    <ul>
                      {selectedPoint?.assessments.map(assessment => (
                        <li key={assessment.assessment + Math.random()}>
                          {assessment.has ? 
                          <FiCheckCircle size={30} color="#4BD4DD" /> 
                          : <FiXCircle size={30} color="#F36F6F" />}
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