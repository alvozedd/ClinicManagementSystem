import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { FaHome, FaSignOutAlt, FaUser, FaCalendarAlt, FaUsers, FaCog, FaFileAlt, FaClipboardList } from 'react-icons/fa';
import './DashboardStyles.css';
import DarkModeToggle from './DarkModeToggle';

const DashboardLayout = ({ children, activeTab, setActiveTab, role }) => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { id: 'patients', label: 'Patients', icon: <FaUsers className="text-blue-500" /> },
      { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt className="text-green-500" /> },
    ];

    if (role === 'admin') {
      return [
        { id: 'users', label: 'Users', icon: <FaUser className="text-purple-500" /> },
        { id: 'content', label: 'Content', icon: <FaFileAlt className="text-yellow-500" /> }
      ];
    } else if (role === 'doctor') {
      return [
        ...commonItems,
        { id: 'notes', label: 'Notes', icon: <FaClipboardList className="text-red-500" /> },
      ];
    } else {
      // Secretary
      return commonItems;
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="dashboard-container min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      {isMobile && (
        <header className="mobile-header bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              className="mr-4 text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">UroHealth</div>
          </div>
          <div className="flex items-center">
            <DarkModeToggle />
            <div className="text-sm mx-2 text-gray-600 dark:text-gray-300">{userInfo?.name}</div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              {userInfo?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
      )}

      <div className="dashboard-layout flex">
        {/* Sidebar - hidden on mobile unless menu is open */}
        <aside className={`dashboard-sidebar ${isMobile ? (menuOpen ? 'block fixed inset-0 z-50 pt-16' : 'hidden') : 'block'} bg-white dark:bg-gray-800 shadow-md w-64 min-h-screen`}>
          {isMobile && menuOpen && (
            <div className="absolute inset-0 bg-black opacity-50 z-40" onClick={toggleMenu}></div>
          )}

          <div className={`sidebar-content ${isMobile ? 'z-50 relative bg-white dark:bg-gray-800 h-full w-64' : ''} p-4 flex flex-col h-full`}>
            {!isMobile && (
              <div className="sidebar-header mb-8 flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold mr-3">
                  {userInfo?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{userInfo?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userInfo?.role}</div>
                </div>
              </div>
            )}

            <nav className="flex-1">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        // Update URL with tab parameter
                        const currentPath = location.pathname;
                        navigate(`${currentPath}?tab=${item.id}`);
                        if (isMobile) setMenuOpen(false);
                      }}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="sidebar-footer mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3 px-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                <DarkModeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`dashboard-main flex-1 p-4 ${isMobile ? 'pt-20' : ''}`}>
          <div className="content-container bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-h-[calc(100vh-2rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
