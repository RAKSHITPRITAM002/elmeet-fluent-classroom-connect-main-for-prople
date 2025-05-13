// Assuming this is a typical React form component
import React, { useState } from 'react';

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific field errors if backend provides them
        if (data.field) {
          setFieldErrors(prev => ({ ...prev, [data.field]: data.message }));
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
        throw new Error(data.message || `HTTP error ${response.status}`);
      }

      setSuccessMessage(data.message || 'Registration successful! You can now log in.');
      // Optionally redirect to login page or dashboard
      // router.push('/login');

    } catch (err: any) {
      console.error('Registration submission error:', err.message);
      if (!error && !Object.keys(fieldErrors).length) { // if no specific error was set from response
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center">Create Account</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
      {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded text-sm">{successMessage}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
          required
        />
        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required minLength={6}
        />
         {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};