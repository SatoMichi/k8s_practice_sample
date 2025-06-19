import { mount } from 'svelte'
import './styles/app.scss'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
/* Force rebuild Thu Jun 19 14:36:12 JST 2025 */
