import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";

function ManageTesters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [testers, setTesters] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchTesters = async () => {
    if (!projectId) return;
    try {
      const response = await api.get(`/projects/${projectId}/testers`);
      setTesters(response.data || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You can only view testers of your own projects");
      } else {
        setError(err.response?.data?.message || "Failed to load testers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "MP" || !projectId || hasLoadedRef.current) {
      if (!projectId || user?.role !== "MP") {
        setLoading(false);
      }
      return;
    }

    hasLoadedRef.current = true;
    fetchTesters();
  }, [projectId]);

  const handleRemoveTester = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this tester?")) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}/testers/${userId}`);
      fetchTesters();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove tester");
    }
  };

  if (!user || user.role !== "MP") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-center">
              Only MP users can manage testers
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/view-bugs?project=${projectId}`)}
            className="text-sm sm:text-base text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Bugs
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Manage Testers
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Testers
          </h3>
          {testers.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-600">
              No testers yet.
            </p>
          ) : (
            <div className="space-y-2">
              {testers.map((tester) => (
                <div
                  key={tester.user_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded gap-3"
                >
                  <span className="text-sm sm:text-base text-gray-900 break-words">
                    {tester.email}
                  </span>
                  <button
                    onClick={() => handleRemoveTester(tester.user_id)}
                    className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 self-start sm:self-auto"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageTesters;
