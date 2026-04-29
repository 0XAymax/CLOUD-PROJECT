import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService, type LoginCredentials } from '../services/authService';

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await authService.login(credentials);
      setSuccess(`Bienvenue, ${user.name}!`);
      
      setTimeout(() => {
        login(user);
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    handleLogin,
    isLoading,
    error,
    success,
    clearMessages,
  };
};
