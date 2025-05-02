import { useState, useEffect } from 'react';
import { testDatabaseConnection } from '../utils/apiUtils';
import './HealthCheck.css';

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const result = await testDatabaseConnection();
        setHealthStatus(result);
        setError(null);
      } catch (err) {
        console.error('Health check failed:', err);
        setError(err.message || 'Failed to check system health');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    testDatabaseConnection()
      .then(result => {
        setHealthStatus(result);
      })
      .catch(err => {
        setError(err.message || 'Failed to check system health');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="health-check-container">
        <div className="health-check-card">
          <h2>Checking System Health...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-check-container">
        <div className="health-check-card error">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={handleRetry} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  const isHealthy = healthStatus?.status === 'ok' &&
                    healthStatus?.database?.status === 'connected';

  return (
    <div className="health-check-container">
      <div className={`health-check-card ${isHealthy ? 'healthy' : 'unhealthy'}`}>
        <h2>System Health Status</h2>

        <div className="status-indicator">
          <span className={`status-dot ${isHealthy ? 'green' : 'red'}`}></span>
          <span className="status-text">
            {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
          </span>
        </div>

        {healthStatus && (
          <div className="health-details">
            <div className="detail-item">
              <strong>API Status:</strong> {healthStatus.status}
            </div>
            <div className="detail-item">
              <strong>Database:</strong> {healthStatus.database?.status || 'Unknown'}
            </div>
            <div className="detail-item">
              <strong>Environment:</strong> {healthStatus.environment}
            </div>
            <div className="detail-item">
              <strong>Last Checked:</strong> {new Date(healthStatus.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        <button onClick={handleRetry} className="retry-button">
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default HealthCheck;
