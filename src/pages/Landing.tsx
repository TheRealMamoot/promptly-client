import { useNavigate } from 'react-router-dom';
import '../App.css';
import { LANDING_TEXT, NAV_TEXT } from '../constants/text';

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        <div className="logo">{LANDING_TEXT.title}</div>
        <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <li><a href="#">{NAV_TEXT.login}</a></li>
          <li>
            <button className="button button--small" onClick={() => navigate('/signup')}>
              {NAV_TEXT.getStarted}
            </button>
          </li>
        </ul>
      </nav>

      <div className="landing">
        <h1 className="title">{LANDING_TEXT.title}</h1>
        <p className="subtitle">
          {LANDING_TEXT.subtitleStart}
          <strong>{LANDING_TEXT.subtitleBold}</strong>.
        </p>
        <button className="button" onClick={() => navigate('/signup')}>
          {NAV_TEXT.getStarted}
        </button>
      </div>
    </>
  );
}

export default Landing;