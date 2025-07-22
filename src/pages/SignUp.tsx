import "@styles/SignUp.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "../assets/google.svg";
import { api, API_ROUTES } from "../config/api";
import { SIGNUP_TEXT } from "../constants/text";
import { UserSchema } from "../validation/userSchema";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });

    setApiError("");

    const partial = { ...formData, [name]: value };
    const result = UserSchema.safeParse(partial);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors as Record<string, string>);
    } else {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const result = UserSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors as Record<string, string>);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: SIGNUP_TEXT.alerts.mismatch });
      return;
    }

    try {
      const response = await api.post(API_ROUTES.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log(SIGNUP_TEXT.logs.success, response.data);
      
      await api.post(API_ROUTES.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      navigate("/home");
    } catch (error: any) {
      console.error(SIGNUP_TEXT.logs.failure, error);

      if (error.response) {
        const status = error.response.status;

        if (status === 409) {
          setApiError(SIGNUP_TEXT.alerts.conflict);
        } else if (status === 400) {
          setApiError(SIGNUP_TEXT.alerts.invalid);
        } else {
          setApiError(SIGNUP_TEXT.alerts.server);
        }
      } else {
        setApiError(SIGNUP_TEXT.alerts.network);
      }
    }
  };

  const renderError = (field: string) => {
    return touched[field] && errors[field] ? (
      <span className="error-message">{errors[field]}</span>
    ) : null;
  };

  const getInputClass = (field: string) => {
    return touched[field] && errors[field] ? "input-error" : "";
  };

  return (
    <>
      <div className="signup-wrapper">
        <div className="signup-tab">
          <h2 className="signup-title">
            Start{" "}
            <a href="/" className="signup-title-link">
              {SIGNUP_TEXT.title}
            </a>
          </h2>
          <p className="signup-subtitle">{SIGNUP_TEXT.subtitle}</p>
          {apiError && (
            <div className="form-error-box form-error-top">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} className="signup-form" noValidate>
            <input
              type="text"
              name="name"
              placeholder={SIGNUP_TEXT.placeholders.name}
              value={formData.name}
              onChange={handleChange}
              className={getInputClass("name")}
              required
            />
            {renderError("name")}

            <input
              type="email"
              name="email"
              placeholder={SIGNUP_TEXT.placeholders.email}
              value={formData.email}
              onChange={handleChange}
              className={getInputClass("email")}
              required
            />
            {renderError("email")}

            <input
              type="password"
              name="password"
              placeholder={SIGNUP_TEXT.placeholders.password}
              value={formData.password}
              onChange={handleChange}
              className={getInputClass("password")}
              required
            />
            {renderError("password")}

            <input
              type="password"
              name="confirmPassword"
              placeholder={SIGNUP_TEXT.placeholders.confirmPassword}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={getInputClass("confirmPassword")}
              required
            />
            {renderError("confirmPassword")}

            <button type="submit" className="button button--full">
              {SIGNUP_TEXT.button}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account? <Link to="/login">Log In</Link>
            </p>
            <div className="divider">
              <span>or</span>
            </div>
            <button
              className="google-button"
              onClick={() => alert("Google sign-up is not implemented yet.")}
            >
              <img src={GoogleIcon} alt="Google" /> Sign up with Google
            </button>
            <p className="terms">
              By signing up to create an account I accept Promptly's{" "}
              <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
