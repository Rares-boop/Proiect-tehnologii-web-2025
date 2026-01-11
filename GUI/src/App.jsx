import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProject from './pages/RegisterProject';
import RegisterTester from './pages/RegisterTester';
import RegisterBug from './pages/RegisterBug';
import ViewBugs from './pages/ViewBugs';
import ManageTeam from './pages/ManageTeam';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-project" element={<RegisterProject />} />
        <Route path="/register-tester" element={<RegisterTester />} />
        <Route path="/register-bug" element={<RegisterBug />} />
        <Route path="/view-bugs" element={<ViewBugs />} />
        <Route path="/manage-team" element={<ManageTeam />} />
      </Routes>
    </Router>
  );
}

export default App;
