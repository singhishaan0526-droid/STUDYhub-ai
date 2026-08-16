import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const { login }               = useContext(AuthContext);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-900 p-8 shadow-2xl border border-gray-800">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
            <LogIn className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">Sign in to StudyHub AI</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <input type="email" placeholder="Email address" aria-label="Email address"
              autoComplete="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-gray-800 px-3 py-2.5 text-white ring-1 ring-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="password" placeholder="Password" aria-label="Password"
              autoComplete="current-password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-gray-800 px-3 py-2.5 text-white ring-1 ring-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition">
            {loading ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Signing in...</>
            ) : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}