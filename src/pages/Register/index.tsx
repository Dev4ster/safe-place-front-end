import React, { useEffect, useState, ChangeEvent, useRef, FormEvent } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import {Link} from 'react-router-dom'

import { TileLayer, Marker, MapContainer, useMapEvents } from 'react-leaflet'
import { toast } from 'react-toastify';

import api from '../../services/api'
import axios from 'axios'

import './styles.css'
import { Dispatch } from 'react'
import { SetStateAction } from 'react'

interface Assessments {
  id: number, 
  assessment: string
}

interface UFDTO {
  sigla: string, 
  nome: string
}

interface MunicipiosDTO {
  id: number, 
  nome: string
}

interface MyComponentDTO {
  locationCB: Dispatch<SetStateAction<[number, number]>>
}

function MyComponent({locationCB} : MyComponentDTO) {
  const [location, setLocation] = useState<[number,number]>([0, 0])
  const map = useMapEvents({
    click: (e) => {
      setLocation([e.latlng.lat, e.latlng.lng])
    },
    locationfound: (location) => {
      setLocation([location.latlng.lat, location.latlng.lng])
    },
  })

  locationCB(location)
  useEffect(()=>{
   // map.locate()
  }, [])

  return <Marker position={location} />
}

const Register = () => {
  const [assessments, setAssessments] = useState<Assessments[]>([])
  const [ufs, setUfs] = useState<UFDTO[]>([])
  const [municipios, setMunicipios] = useState<MunicipiosDTO[]>([])

  //form
  const [position, setPosition] = useState<[number, number]>([0, 0])
  const [uf, setUf] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [whats, setWhats] = useState('')
  const [assessmentsPoint, setAssessmentsPoint] = useState<number[]>([])


  const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
    setUf(event.target.value)
  }

  const handleAdd = (item : Assessments) => {
    const contain = assessmentsPoint.findIndex(itemArr => itemArr === item.id)

    if(contain>=0){
      const items = assessmentsPoint.filter(itemArr => itemArr !== item.id)
      setAssessmentsPoint(items)
    }else {
      setAssessmentsPoint(prev => [...prev, item.id])
    }
  }

  const handleSubmit = async (e: FormEvent) =>{
    e.preventDefault();
    const data = {
      address: "",
      title: nome,
      whatsapp: whats,
      email,
      city: municipio,
      uf,
      latitude:position[0],
      longitude: position[1],
      assessments: assessments.map(assessment => ({
        assessment_id: assessment.id,
        has: assessmentsPoint.includes(assessment.id)
      }))
    }
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse.php?lat=${data.latitude}&lon=${data.longitude}&zoom=18&format=jsonv2`)
    data.address = response.data.name
    toast('enviando', {type: 'success'})
    console.log(data)
  }


  useEffect(()=>{
    const loadAssessments = async () => {
      const response = await api.get('/assessments')
      setAssessments(response.data)
    }
    loadAssessments();
  }, [])

  useEffect(()=>{
    console.log(position)
  }, [position])
  
  useEffect(()=>{
   fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
   .then(res=> res.json())
   .then(setUfs)
  }, [])

  useEffect(()=>{
    if(uf){
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(res=> res.json())
      .then(setMunicipios)
    }
   }, [uf])

  
  return (
    <div id="page-create-point">
      <header>
        <h1>Safe Place</h1>
        <Link to="/">
          <FiArrowLeft />
              Voltar para home
            </Link>
        </header>
    <form onSubmit={handleSubmit}>
      <h1>Cadastro de um lugar seguro</h1>

      <fieldset>
        <legend>
          <h2>Dados</h2>
        </legend>

        <div className="field">
          <label htmlFor="title">Nome do local</label>
          <input type="text" 
          name="title" 
          id="title" 
          value={nome} 
          onChange={e=>setNome(e.target.value)} 
          required
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-mail do local</label>
            <input 
            type="email" 
            name="email" 
            id="email"
            value={email}
            onChange={e=>setEmail(e.target.value)} 
            />
          </div>
          <div className="field">
            <label htmlFor="whats">WhatsApp do local</label>
            <input 
            type="text" 
            name="whats" 
            id="whats"
            value={whats}
            onChange={e=>setWhats(e.target.value)} 
            />
          </div>
        </div>
      </fieldset>


      <fieldset>
        <legend>
          <h2>Endereço</h2>
          <span>Selecione o endereço no mapa</span>
        </legend>

        <MapContainer 
        center={[ -23.5790555,-46.6419057]} 
        zoom={10} 
        >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
       <MyComponent 
       locationCB={setPosition} 
       />
      </MapContainer>

        <div className="field-group">
        <div className="field">
            <label htmlFor="city">Cidade
            {municipios.length === 0 &&  (<small> - Selecione uma uf</small>)}
            </label>
            <select name="city" id="city" 
            
            onChange={e => setMunicipio(e.target.value)}
            value={municipio}
            
            required
            >
              <option value="">Selecione a cidade</option>
              {municipios.map(municipio => (
                  <option 
                  value={municipio.nome} 
                  key={municipio.id}>{municipio.nome}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="uf">Estado</label>
            <select name="uf" id="uf" 
            onChange={handleSelectUf} 
            required
            value={uf}>
              <option value="">Selecione uma uf</option>
              {ufs.map(uf => (
                  <option value={uf.sigla}>{uf.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>
          <h2>Avaliações</h2>
          <span>Selecione os tipos de prevenção que o local possui</span>
        </legend>

        <ul className="items-grid">
          {assessments.map((item) => (
            <li key={item.id} 
            onClick={() => 
            handleAdd(item)} 
            className={assessmentsPoint.includes(item.id) ? 'selected' : ''}>
              <span>{item.assessment}</span>
            </li>
          ))}
        </ul>
      </fieldset>

      <button type="submit">
        Cadastrar Lugar seguro
      </button>
    </form>
    </div>
  )
}

export default Register