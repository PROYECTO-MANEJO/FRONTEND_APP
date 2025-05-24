import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { AppRouter } from './router/AppRouter'
import { store } from './store'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Provider store={store}>
        <AppRouter />
      </Provider>
  </BrowserRouter>
)
