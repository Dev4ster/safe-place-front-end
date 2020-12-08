import React from 'react'
import {Route, BrowserRouter} from 'react-router-dom'

import Home from './pages/Home'
import Register from './pages/Register'
import Points from './pages/Points'

const Routes = () => {
  return (
    <BrowserRouter>
      <Route path="/" component={Home} exact />
      <Route path="/cadastro" component={Register} />
      <Route path="/pontos" component={Points} />
    </BrowserRouter>
  )
}

export default Routes;