import './App.css'
import Barplot from './barplot'

function App() {

  return (
    <>
      <section id="center">
        
        <div>
          <h1>Country Distribution of Students</h1>
        </div>
      </section>
      <section id="center">
        <Barplot />
      </section>

      <section id="spacer"></section>
    </>
  )
}

export default App
