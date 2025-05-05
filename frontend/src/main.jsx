import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import './styles/mobileResponsive.css'
import './styles/buttonFixes.css' // Import button fixes
import './styles/buttonStyleFixes.css' // Import specific button style fixes
import './styles/mobileButtonFixes.css' // Import mobile button fixes
import './styles/darkMode.css' // Import dark mode styles
import './styles/mobileBackgroundFix.css' // Import mobile background fixes
import './styles/darkRectangleFix.css' // Import dark rectangle fix
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import store from './store/store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
