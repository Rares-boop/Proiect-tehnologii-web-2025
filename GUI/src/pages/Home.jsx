import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (user) {
      api.get('/projects')
        .then(response => setProjects(response.data))
        .catch(() => setProjects([]));
      
      if (user.role === 'TST') {
        api.get('/bugs')
          .then(response => setBugs(response.data))
          .catch(() => setBugs([]));
      }
    }
  }, []);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleDeleteBug = async (bugId) => {
    if (!window.confirm('Are you sure you want to delete this bug?')) {
      return;
    }

    try {
      await api.delete(`/bugs/${bugId}`);
      setBugs(bugs.filter(b => b.id !== bugId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete bug');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          {user ? `Welcome back, ${user.email}!` : 'Welcome to Bug Bounty Application'}
        </h2>
        {user && (
          <div className="mt-6 sm:mt-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-600">No projects yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => {
                  const isCreator = user?.role === 'MP' && Number(project.created_by) === Number(user.id);
                  const isMember = user?.role === 'MP' && Number(project.is_member) === 1;
                  const canViewBugs = isCreator || isMember;
                  
                  return (
                    <div 
                      key={project.id} 
                      onClick={() => {
                        if (canViewBugs) {
                          navigate(`/view-bugs?project=${project.id}`);
                        }
                      }}
                      className={`bg-white p-4 sm:p-6 rounded-lg shadow-md relative ${
                        canViewBugs 
                          ? 'cursor-pointer hover:shadow-lg transition-shadow' 
                          : ''
                      }`}
                    >
                      {isCreator && (
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center text-sm font-bold"
                        >
                          ×
                        </button>
                      )}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900">{project.nume}</h4>
                        {project.is_tester === 1 && (
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">Tester</span>
                        )}
                      </div>
                      {project.descriere && (
                        <p className="text-sm sm:text-base text-gray-600 mb-2 break-words">{project.descriere}</p>
                      )}
                      {project.repository && (
                        <p className="text-xs sm:text-sm text-blue-600 mb-2 break-all">{project.repository}</p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-500">Created by: {project.creator_email}</p>
                      {canViewBugs && (
                        <p className="text-xs sm:text-sm text-purple-600 mt-2 font-medium">Click to view bugs →</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {user && user.role === 'TST' && (
          <div className="mt-8 sm:mt-12">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">My Reported Bugs</h3>
            {bugs.length === 0 ? (
              <p className="text-gray-600">No bugs reported yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bugs.map(bug => (
                  <div key={bug.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md relative">
                    <button
                      onClick={() => handleDeleteBug(bug.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center text-sm font-bold"
                    >
                      ×
                    </button>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900">{bug.project_name}</h4>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{bug.description}</p>
                    <div className="flex gap-2 mb-2 flex-wrap">
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
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        bug.status === 'Fixed' ? 'bg-green-100 text-green-800' :
                        bug.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        bug.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bug.status || 'Open'}
                      </span>
                    </div>
                    {bug.commit_link && (
                      <a 
                        href={bug.commit_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 mb-2 block break-all"
                      >
                        Commit Link
                      </a>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500">
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
