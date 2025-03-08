import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      if (isSignUp) {
        // Create the account using the AuthContext signUp function which now returns a user
        const user = await signUp(email, password);
        // Once the account is created, insert a new profile record in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, name: email.split('@')[0], avatar: '' }]);
        if (profileError) {
          throw new Error('Failed to create user profile.');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('weak_password')) {
          setError('Password is too weak. It must be at least 6 characters long.');
        } else if (err.message.includes('Database error')) {
          setError('An error occurred while creating your account. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="bg-darker p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6">
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-dark border-gray-700 text-white px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md bg-dark border-gray-700 text-white px-3 py-2"
              required
              minLength={6}
            />
            {isSignUp && (
              <p className="mt-1 text-sm text-gray-400">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-cardinal hover:bg-cardinal/50 text-white rounded-md transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}