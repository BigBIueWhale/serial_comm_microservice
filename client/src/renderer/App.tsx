import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { SerialCommPage } from './src/pages/SerialComm.page';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SerialCommPage />} />
      </Routes>
    </Router>
  );
}
