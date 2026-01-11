import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function RegisterProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nume: '', descriere: '', repository: '' });
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (user && user.role === 'MP') {
      api.get('/projects/users/mp')
        .then(response => setTeamMembers(response.data))
        .catch(() => setTeamMembers([]));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const validateForm = () => {
    if (!formData.nume.trim()) {
      setError('Nume is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await api.post('/projects', { ...formData, team_members: selectedMembers });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (!user || user.role !== 'MP') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-center">Only MP users can create projects</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900">Register Project</h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="nume" className="block text-sm font-medium text-gray-700">
                  Nume
                </label>
                <input
                  id="nume"
                  name="nume"
                  type="text"
                  required
                  value={formData.nume}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="descriere" className="block text-sm font-medium text-gray-700">
                  Descriere
                </label>
                <textarea
                  id="descriere"
                  name="descriere"
                  rows="4"
                  value={formData.descriere}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="repository" className="block text-sm font-medium text-gray-700">
                  Repository
                </label>
                <input
                  id="repository"
                  name="repository"
                  type="text"
                  value={formData.repository}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Echipă (opțional)
                </label>
                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">Nu există alți membri MP disponibili</p>
                  ) : (
                    teamMembers.map(member => (
                      <div key={member.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`member-${member.id}`}
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleMemberToggle(member.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`member-${member.id}`} className="text-sm text-gray-700 cursor-pointer">
                          {member.email}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterProject;
