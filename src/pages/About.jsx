import Container from 'react-bootstrap/Container'

function About() {
  return (
    <Container className="py-5">
      <h1>About</h1>
      <p>
        Navigating here happened entirely client-side via React Router,
        proving the app works as a static site with no server involved.
      </p>
    </Container>
  )
}

export default About
