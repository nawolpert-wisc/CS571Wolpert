import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'

function Home() {
  return (
    <Container className="py-5">
      <h1>Home</h1>
      <p>
        This is a dummy client-side-only React app using React Bootstrap for
        UI and React Router (declarative mode) for navigation.
      </p>
      <Button variant="primary">React Bootstrap button</Button>
    </Container>
  )
}

export default Home
