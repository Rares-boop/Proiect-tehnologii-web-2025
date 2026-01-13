import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";

function ManageTeam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchMembers = async () => {
    if (!projectId) return;
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      setMembers(response.data || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You can only view members of your own projects");
      } else {
        setError(err.response?.data?.message || "Failed to load members");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMembers = async () => {
    try {
      const response = await api.get("/projects/users/mp");
      setAvailableMembers(response.data || []);
    } catch (err) {
      console.error("Failed to load available members:", err);
      setAvailableMembers([]);
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
    fetchMembers();
    fetchAvailableMembers();
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedMember) {
      setError("Please select a member to add");
      return;
    }

    try {
      await api.post(`/projects/${projectId}/members`, {
        user_id: selectedMember,
      });
      setSelectedMember("");
      fetchMembers();
      fetchAvailableMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      fetchMembers();
      fetchAvailableMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (!user || user.role !== "MP") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-center">
              Only MP users can manage teams
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

  const membersToAdd = availableMembers.filter(
    (member) => !members.some((m) => m.user_id === member.id)
  );

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
            Manage Team
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Add Team Member
          </h3>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {membersToAdd.length === 0 && !error && (
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              No available members to add.
            </p>
          )}
          {membersToAdd.length > 0 && (
            <form
              onSubmit={handleAddMember}
              className="flex flex-col sm:flex-row gap-4"
            >
              <select
                value={selectedMember}
                onChange={(e) => {
                  setSelectedMember(e.target.value);
                  setError("");
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="">Select a member...</option>
                {membersToAdd.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.email}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedMember}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Member
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Team Members
          </h3>
          {members.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-600">
              No team members yet.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded gap-3"
                >
                  <span className="text-sm sm:text-base text-gray-900 break-words">
                    {member.email}
                  </span>
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
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

export default ManageTeam;
