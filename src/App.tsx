import './App.css';
import './index.css';

function App() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">Promptly</div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Login</a></li>
        </ul>
      </nav>

      <div className="landing">
        <h1 className="title">Promptly</h1>
        <p className="subtitle">
          Your personal prompt organizer. Create, favorite, and manage your best ideas — promptly.
        </p>
        <button className="button">Get Started</button>
      </div>
    </>
  );
}

export default App;