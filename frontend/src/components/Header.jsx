import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutHandler = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-white font-semibold' : 'text-blue-100 hover:text-white';
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-lg font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M5.5 4a2.5 2.5 0 014.607-1.346.75.75 0 001.264-.057 4 4 0 117.129 3.571.75.75 0 00-.5 1.057 3.5 3.5 0 01-6.6 3.115.75.75 0 00-1.4.05A2.5 2.5 0 015.5 9.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75 1 1 0 011-1 .75.75 0 00.75-.75V4zm3 10a2.5 2.5 0 104.607 1.346.75.75 0 011.264.057 4 4 0 11-7.129-3.571.75.75 0 00.5-1.057 3.5 3.5 0 016.6-3.115.75.75 0 001.4-.05A2.5 2.5 0 0114.5 4.5a.75.75 0 00.75.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75 1 1 0 01-1 1 .75.75 0 00-.75.75V14z" clipRule="evenodd" />
            </svg>
            UroHealth Central
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {userInfo ? (
                <>
                  <li>
                    <Link to="/dashboard" className={`transition duration-200 ${isActive('/dashboard')}`}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/patients" className={`transition duration-200 ${isActive('/patients')}`}>
                      Patients
                    </Link>
                  </li>
                  <li>
                    <Link to="/appointments" className={`transition duration-200 ${isActive('/appointments')}`}>
                      Appointments
                    </Link>
                  </li>
                  {userInfo.role === 'admin' && (
                    <li>
                      <Link to="/users" className={`transition duration-200 ${isActive('/users')}`}>
                        Users
                      </Link>
                    </li>
                  )}
                  <li>
                    <div className="relative group">
                      <button className="flex items-center text-blue-100 hover:text-white transition duration-200">
                        <span className="mr-1">{userInfo.email.split('@')[0]}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          Signed in as <span className="font-medium">{userInfo.role}</span>
                        </div>
                        <button
                          onClick={logoutHandler}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition duration-200">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <ul className="flex flex-col space-y-3">
              {userInfo ? (
                <>
                  <li>
                    <Link
                      to="/dashboard"
                      className={`block py-1 ${isActive('/dashboard')}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/patients"
                      className={`block py-1 ${isActive('/patients')}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Patients
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/appointments"
                      className={`block py-1 ${isActive('/appointments')}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Appointments
                    </Link>
                  </li>
                  {userInfo.role === 'admin' && (
                    <li>
                      <Link
                        to="/users"
                        className={`block py-1 ${isActive('/users')}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Users
                      </Link>
                    </li>
                  )}
                  <li className="border-t border-blue-500 pt-2 mt-2">
                    <div className="text-sm text-blue-200 mb-1">Signed in as {userInfo.email}</div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logoutHandler();
                      }}
                      className="text-white bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded text-sm"
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="block bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition duration-200 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
