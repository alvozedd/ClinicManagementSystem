import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import './styles/mobileResponsive.css'
import './styles/buttonFixes.css'
import './styles/buttonStyleFixes.css'
import './styles/mobileButtonFixes.css'
import './styles/darkMode.css'
import './styles/mobileBackgroundFix.css'
import './styles/3DStyles.css'
import App3D from './App3D.jsx'
import { AuthProvider } from './context/AuthContext'
import store from './store/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App3D />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
