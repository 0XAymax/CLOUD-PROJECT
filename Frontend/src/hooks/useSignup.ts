import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type SignupData } from '../services/authService';

export const useSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (data: SignupData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.signup(data);
      setSuccess('Inscription réussie ! Redirection vers la connexion...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
    handleSignup,
    isLoading,
    error,
    success,
    clearMessages,
  };
};
