import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

function ViewBugs() {
  const [searchParams] = useSearchParams();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ severity: '', priority: '', project: searchParams.get('project') || '' });
  const [modalBug, setModalBug] = useState(null);

  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const fetchAllBugs = async () => {
    const user = getUser();
    if (!user) return [];
    try {
      const projectsRes = await api.get('/projects');
      const mpProjects = projectsRes.data.filter(
        p => Number(p.created_by) === Number(user.id) || Number(p.is_member) === 1
      );
      const allBugs = [];
      for (const project of mpProjects) {
        try {
          const bugsRes = await api.get(`/projects/${project.id}/bugs`);
          allBugs.push(...bugsRes.data);
        } catch (err) {
          console.error(`Error fetching bugs for project ${project.id}:`, err);
        }
      }
      return allBugs;
    } catch (err) {
      console.error('Error fetching bugs:', err);
      return [];
    }
  };

  useEffect(() => {
    const user = getUser();
    if (user && user.role === 'MP') {
      const fetchProjects = async () => {
        try {
          const projectsRes = await api.get('/projects');
          const mpProjects = projectsRes.data.filter(
            p => Number(p.created_by) === Number(user.id) || Number(p.is_member) === 1
          );
          setProjects(mpProjects);
        } catch (err) {
          console.error('Error fetching projects:', err);
          setProjects([]);
        }
      };
      fetchProjects();
      fetchAllBugs().then(setBugs);
    }
  }, []);

  useEffect(() => {
    const projectParam = searchParams.get('project') || '';
    setFilters(prev => ({ ...prev, project: projectParam }));
  }, [searchParams]);

  const assignBug = async (bugId) => {
    try {
      await api.post(`/bugs/${bugId}/assign`);
      const allBugs = await fetchAllBugs();
      setBugs(allBugs);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign bug');
    }
  };

  const updateBugStatus = async (bugId, status, commitLink) => {
    try {
      await api.put(`/bugs/${bugId}/status`, { status, commit_link: commitLink });
      const allBugs = await fetchAllBugs();
      setBugs(allBugs);
      setModalBug(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bug status');
    }
  };

  const filteredBugs = bugs.filter(bug => {
    if (filters.severity && bug.severity !== filters.severity) return false;
    if (filters.priority && bug.priority !== filters.priority) return false;
    if (filters.project && Number(bug.project_id) !== Number(filters.project)) return false;
    return true;
  });

  const user = getUser();

  if (!user || user.role !== 'MP') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-center">Only MP users can view bugs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">View Bugs</h2>
          {filters.project && (() => {
            const selectedProject = projects.find(p => Number(p.id) === Number(filters.project));
            if (selectedProject && Number(selectedProject.created_by) === Number(user?.id)) {
              return (
                <a
                  href={`/manage-team?project=${filters.project}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Manage Team
                </a>
              );
            }
            return null;
          })()}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Project
              </label>
              <select
                value={filters.project}
                onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.nume}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tester
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commit Link
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-3 py-2 text-center text-gray-500">
                    No bugs found
                  </td>
                </tr>
              ) : (
                filteredBugs.map(bug => (
                  <tr key={bug.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bug.project_name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">
                      {bug.description}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        bug.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        bug.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        bug.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bug.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        bug.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                        bug.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bug.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {bug.tester_email}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {bug.commit_link ? (
                        <a
                          href={bug.commit_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Link
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bug.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        bug.status === 'Fixed' ? 'bg-green-100 text-green-800' :
                        bug.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        bug.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bug.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {bug.assigned_to_email || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {!bug.assigned_to ? (
                        <button
                          onClick={() => assignBug(bug.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Assign
                        </button>
                      ) : Number(bug.assigned_to) === Number(user?.id) ? (
                        <button
                          onClick={() => setModalBug(bug)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 whitespace-nowrap"
                        >
                          Update
                        </button>
                      ) : (
                        <span className="text-gray-600">Assigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalBug && <UpdateBugModal bug={modalBug} onClose={() => setModalBug(null)} onSave={updateBugStatus} />}
    </div>
  );
}

function UpdateBugModal({ bug, onClose, onSave }) {
  const [status, setStatus] = useState(bug.status || 'Open');
  const [commitLink, setCommitLink] = useState(bug.commit_link || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(bug.id, status, commitLink);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Update Bug Status</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Fixed">Fixed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commit Link
              </label>
              <input
                type="text"
                value={commitLink}
                onChange={(e) => setCommitLink(e.target.value)}
                placeholder="Enter commit link (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ViewBugs;
