import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900">
              Bug Bounty
            </Link>
          </div>
          <div className="hidden md:flex gap-2 lg:gap-3 items-center">
            {user ? (
              <>
                <span className="text-sm lg:text-base text-gray-700 truncate max-w-[120px] lg:max-w-none">{user.email}</span>
                {user.role === 'MP' && (
                  <>
                    <Link
                      to="/register-project"
                      className="px-3 lg:px-4 py-2 text-xs lg:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Register Project
                    </Link>
                    <Link
                      to="/view-bugs"
                      className="px-3 lg:px-4 py-2 text-xs lg:text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      View Bugs
                    </Link>
                  </>
                )}
                {user.role === 'TST' && (
                  <>
                    <Link
                      to="/register-tester"
                      className="px-3 lg:px-4 py-2 text-xs lg:text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Register as Tester
                    </Link>
                    <Link
                      to="/register-bug"
                      className="px-3 lg:px-4 py-2 text-xs lg:text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Register Bug
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-3 lg:px-4 py-2 text-xs lg:text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-3 lg:px-4 py-2 text-xs lg:text-sm text-blue-600 hover:text-blue-800"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-3 lg:px-4 py-2 text-xs lg:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login
                </Link>
              </>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {user ? (
              <>
                <div className="px-2 py-2 text-sm text-gray-700 border-b">{user.email}</div>
                {user.role === 'MP' && (
                  <>
                    <Link
                      to="/register-project"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Register Project
                    </Link>
                    <Link
                      to="/view-bugs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      View Bugs
                    </Link>
                  </>
                )}
                {user.role === 'TST' && (
                  <>
                    <Link
                      to="/register-tester"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Register as Tester
                    </Link>
                    <Link
                      to="/register-bug"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Register Bug
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 rounded-md"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
