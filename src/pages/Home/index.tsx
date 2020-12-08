import React from 'react'
import { FiLogIn, FiArrowRightCircle, FiSave } from 'react-icons/fi'
import {Link} from 'react-router-dom'
import './styles.css'

import HomeFigure from '../../assets/home-background.svg'

const Home =  () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
        <h1>Safe Place</h1>
        <Link to="pontos">
              <span>
                <FiArrowRightCircle />
              </span>
              <strong>Ver lugares</strong>
            </Link>
        </header>
        <div className="content-flex">
          <main>
            <h1>Saiba se para onde você está indo é seguro.</h1>
            <p>A plataforma Safeplace tem como proposta apontar como estão as medidas de prevenção contra o coronavírus nos estabelecimentos, em um mapa que contenham as indidações de cabines de descontamição, aferição de temperatura, capacidade para grandes públicos e disponibilização de àlcool em gel.</p>
            <Link to="cadastro">
              <span>
                <FiSave size={30} strokeWidth={2} />
              </span>
              <strong>Cadastre um lugar seguro</strong>
            </Link>
          </main>
          <img src={HomeFigure} />
        </div>
      </div>
      <footer>
          <div>
            Feito com ❤️ com ReactJs <a href="http://">Ver repositório e a equipe de desenvolvimento</a>
          </div>
        </footer>
    </div>
  )
}

export default Home