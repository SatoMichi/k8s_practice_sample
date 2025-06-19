import { mount } from 'svelte'
import './styles/app.scss'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
/* Force rebuild with SCSS fix - Thu Jun 19 14:47:30 JST 2025 */
/* Trigger CI/CD rebuild - Thu Jun 19 15:43:32 JST 2025 */
