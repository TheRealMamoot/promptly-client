import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import LogoLarge from "../assets/promptly.png";
import LogoTitle from "../components/LogoTitle";
import { LANDING_TEXT, NAV_TEXT } from "../constants/text";

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        <LogoTitle />
        <ul
          className="nav-links"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <li>
            <Link to="/login" className="nav-link">
              {NAV_TEXT.login}
            </Link>
          </li>
          <li>
            <button
              className="button button--small"
              onClick={() => navigate("/signup")}
            >
              {NAV_TEXT.getStarted}
            </button>
          </li>
        </ul>
      </nav>

      <div className="landing">
        <div className="logo-large-container">
          <img
            src={LogoLarge}
            alt="Promptly logo"
            className="logo-image-large"
          />
          <h1 className="landing-title">Promptly</h1>
        </div>
        <p className="subtitle">
          {LANDING_TEXT.subtitleStart}
          <strong>{LANDING_TEXT.subtitleBold}</strong>.
        </p>
        <button className="button" onClick={() => navigate("/signup")}>
          {NAV_TEXT.getStarted}
        </button>
      </div>
    </>
  );
}

export default Landing;
