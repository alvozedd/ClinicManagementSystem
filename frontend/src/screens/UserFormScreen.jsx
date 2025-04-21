import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const UserFormScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(Boolean(id));
  const [error, setError] = useState('');
  
  const isEditMode = Boolean(id);
  
  // Mock data for demonstration
  useEffect(() => {
    if (isEditMode) {
      // Mock user data for editing
      const mockUser = {
        _id: id,
        email: 'secretary@urohealth.com',
        role: 'secretary',
      };
      
      setEmail(mockUser.email);
      setRole(mockUser.role);
      setLoadingUser(false);
    }
  }, [id, isEditMode]);

  const submitHandler = (e) => {
    e.preventDefault();
    
    if (!isEditMode && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // In a real implementation, this would send the data to the backend
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setLoading(false);
      navigate('/users');
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit User' : 'Create User'}
        </h1>
        <Link 
          to="/users" 
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Users
        </Link>
      </div>
      
      {loadingUser ? (
        <p>Loading user details...</p>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                className="w-full px-3 py-2 border rounded"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="secretary">Secretary</option>
              </select>
            </div>
            
            {!isEditMode && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-3 py-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEditMode}
                    minLength="6"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border rounded"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isEditMode}
                    minLength="6"
                  />
                </div>
              </>
            )}
            
            {isEditMode && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="6"
                />
              </div>
            )}
            
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserFormScreen;
