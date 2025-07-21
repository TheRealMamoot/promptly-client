import "@styles/NotFound.css";
import { Link } from "react-router-dom";
import "../index.css";

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <h1 className="not-found-h1">404</h1>
        <h2 className="not-found-h2">Page Not Found</h2>
        <p className="not-found-p">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-button">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
