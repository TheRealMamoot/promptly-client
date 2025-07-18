import '@styles/SignUp.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, API_ROUTES } from '../config/api';
import { LOGIN_TEXT, SIGNUP_TEXT } from '../constants/text';
import { LoginSchema } from '../validation/userSchema';

// todo: auto navigation from login to home if already logged in

function Login() {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });

    const partial = { ...formData, [name]: value };
    const result = LoginSchema.safeParse(partial);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors as Record<string, string>);
    } else {
      setErrors({});
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    setTouched({
        email: true,
        password: true,
    });

    const result = LoginSchema.safeParse(formData);
    if (!result.success) {
        setErrors(result.error.flatten().fieldErrors as Record<string, string>);
        return;
    }

    try {
      await api.post(API_ROUTES.LOGIN, {
        email: formData.email,
        password: formData.password,
      });
          
        setFormData({ email: '', password: '' });

        navigate('/home'); 

      } catch (error: any) {
        console.error(LOGIN_TEXT.logs.failure, error);

        if (error.response?.status === 401) {
          setApiError(LOGIN_TEXT.alerts.invalidPassword);
        } else if (error.response?.status === 404) {
          setApiError(LOGIN_TEXT.alerts.userNotFound);
        } else {
          setApiError(LOGIN_TEXT.alerts.failure);
        }
      }
    };

  const renderError = (field: string) =>
    touched[field] && errors[field] ? (
      <span className='error-message'>{errors[field]}</span>
    ) : null;

  const getInputClass = (field: string) =>
    touched[field] && errors[field] ? 'input-error' : '';

  return (
    <div className='signup-wrapper'>
      <div className='signup-tab'>
        <h2 className='signup-title login-title'> 
        Log in <Link to="/" className="signup-title-link">{SIGNUP_TEXT.title}</Link>
        </h2>

        {apiError && <div className='form-error-box form-error-top'>{apiError}</div>}

        <form onSubmit={handleSubmit} className='signup-form' noValidate>
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            className={getInputClass('email')}
            required
          />
          {renderError('email')}

          <input
            type='password'
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            className={getInputClass('password')}
            required
          />
          {renderError('password')}

          <button type='submit' className='button button--full'>
            Log In
          </button>
        </form>

        <div className='signup-footer'>
          <p>
            Don't have an account? <Link to='/signup'>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;