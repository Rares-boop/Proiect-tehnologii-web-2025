import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";

function EditProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [formData, setFormData] = useState({
    nume: "",
    descriere: "",
    repository: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!user || user.role !== "MP" || !projectId) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await api.get("/projects");
        const project = response.data.find(
          (p) => Number(p.id) === Number(projectId)
        );
        if (project && Number(project.created_by) === Number(user.id)) {
          setFormData({
            nume: project.nume || "",
            descriere: project.descriere || "",
            repository: project.repository || "",
          });
        } else {
          setError("Project not found or you do not have permission");
        }
      } catch (err) {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nume.trim()) {
      setError("Nume is required");
      return;
    }

    try {
      await api.put(`/projects/${projectId}`, formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  if (!user || user.role !== "MP") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-center">
              Only MP users can edit projects
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-center">Project ID is required</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
              Edit Project
            </h2>
          </div>
          <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nume"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nume
                </label>
                <input
                  id="nume"
                  name="nume"
                  type="text"
                  required
                  value={formData.nume}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="descriere"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descriere
                </label>
                <textarea
                  id="descriere"
                  name="descriere"
                  rows="4"
                  value={formData.descriere}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base resize-y"
                />
              </div>
              <div>
                <label
                  htmlFor="repository"
                  className="block text-sm font-medium text-gray-700"
                >
                  Repository
                </label>
                <input
                  id="repository"
                  name="repository"
                  type="text"
                  value={formData.repository}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProject;
