import "@styles/LogoTitle.css";
import { Link } from "react-router-dom";
import Logo from "../assets/promptly.png";

function LogoTitle() {
  return (
    <Link to="/" className="logo-text">
      <img src={Logo} alt="Promptly logo" className="logo-image-small" />
      <span className="logo-title">Promptly</span>
    </Link>
  );
}

export default LogoTitle;
