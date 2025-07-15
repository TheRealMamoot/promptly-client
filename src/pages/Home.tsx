import '@/styles/Home.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoTitle from '../components/LogoTitle';
import { api, API_ROUTES } from '../config/api';

export default function Home() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get(API_ROUTES.ME)

        setUserInfo(response.data.user);
        setLoadingUser(false);
      } catch (error: any) {
        console.error('Authentication check failed, redirecting to login:', error);
        setUserInfo(null);
        setLoadingUser(false);
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);
  
  const handleSignOut = async () => { 
    try {
      await api.post(API_ROUTES.LOGOUT); 
      setUserInfo(null);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout API call:', error);
      setUserInfo(null);
      navigate('/login');
    }
  };

  if (loadingUser) {
    return (
      <div className="app-container">
        <div className="user-info">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
      return null;
  }

  return (
    <div className="app-container">
      <header className="header">
        <LogoTitle />
        <div className="user-info">
              {userInfo.email} <button onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      <div className="message-input-container">
        <textarea
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message to ChatGPT. Type '/' to pull up your shortcuts..."
        />
      </div>

      {/* <div className="footer">
        {['ChatGPT', 'Gemini', 'Claude', 'DeepSeek', 'Mistral'].map((platform) => (
          <button key={platform}>{platform}</button>
        ))}
      </div> */}
    </div>
  );
}