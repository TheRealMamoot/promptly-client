import { Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}

export default App;