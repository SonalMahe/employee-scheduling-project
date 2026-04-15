import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, loadSession } from '../../Api/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Skip login if already logged in
  useEffect(() => {
    const session = loadSession();
    if (session?.role === "EMPLOYER") navigate("/employee-list");
    else if (session?.role === "EMPLOYEE") navigate("/availability");
    else if (session) navigate("/");
  }, [navigate]);

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberMe_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe_email', email);
      } else {
        localStorage.removeItem('rememberMe_email');
      }

      setEmail('');
      setPassword('');
      
      navigate(user.role === "EMPLOYER" ? "/employee-list" : "/availability");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header-section">
          <h2 className="header-title">Sundsgården</h2>
          <p className="header-subtitle">Hotell & Konferens</p>
        </div>
        <h1 className="login-title">Employee Scheduling System</h1>
        <p className="login-subtitle">Login into your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Login code</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your login code"
              required
              disabled={loading}
            />
          </div>

          <div className="remember-me-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
