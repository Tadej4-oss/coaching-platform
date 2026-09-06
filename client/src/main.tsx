
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>

      <App />
    
  </BrowserRouter>,

  //add strictmode kdr popravs use refresh route calls (zaenkrat dela sam na addProgram)
)
