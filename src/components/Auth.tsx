import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Swords } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-2xl border-4 border-slate-700 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-500 p-4 rounded-lg mb-4">
              <Swords className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">BetterMe</h1>
            <p className="text-slate-400 text-center">
              Level up your life through daily habits
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="hero@quest.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Loading...' : isSignUp ? 'Start Your Quest' : 'Continue Quest'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "New hero? Create an account"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block bg-slate-800/50 rounded-lg border-2 border-slate-700 px-6 py-3">
            <p className="text-slate-400 text-sm">
              Transform habits into an epic adventure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
