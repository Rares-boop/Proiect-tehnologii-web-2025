import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

function Home() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/projects')
        .then(response => setProjects(response.data))
        .catch(() => setProjects([]));
      
      if (user.role === 'USER') {
        api.get('/bugs')
          .then(response => setBugs(response.data))
          .catch(() => setBugs([]));
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {user ? `Welcome back, ${user.email}!` : 'Welcome to Big Bounty Application'}
        </h2>
        {user && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-600">No projects yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                  <div 
                    key={project.id} 
                    onClick={() => {
                      if (user?.role === 'MP' && Number(project.created_by) === Number(user.id)) {
                        navigate(`/view-bugs?project=${project.id}`);
                      }
                    }}
                    className={`bg-white p-6 rounded-lg shadow-md ${
                      user?.role === 'MP' && Number(project.created_by) === Number(user.id) 
                        ? 'cursor-pointer hover:shadow-lg transition-shadow' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{project.nume}</h4>
                      {project.is_tester === 1 && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Tester</span>
                      )}
                    </div>
                    {project.descriere && (
                      <p className="text-gray-600 mb-2">{project.descriere}</p>
                    )}
                    {project.repository && (
                      <p className="text-sm text-blue-600 mb-2">{project.repository}</p>
                    )}
                    <p className="text-sm text-gray-500">Created by: {project.creator_email}</p>
                    {user?.role === 'MP' && Number(project.created_by) === Number(user.id) && (
                      <p className="text-sm text-purple-600 mt-2 font-medium">Click to view bugs →</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {user && user.role === 'USER' && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">My Reported Bugs</h3>
            {bugs.length === 0 ? (
              <p className="text-gray-600">No bugs reported yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bugs.map(bug => (
                  <div key={bug.id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{bug.project_name}</h4>
                    </div>
                    <p className="text-gray-600 mb-3">{bug.description}</p>
                    <div className="flex gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bug.severity}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        bug.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                        bug.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bug.priority}
                      </span>
                    </div>
                    {bug.commit_link && (
                      <a 
                        href={bug.commit_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 mb-2 block"
                      >
                        Commit Link
                      </a>
                    )}
                    <p className="text-sm text-gray-500">
                      {new Date(bug.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
