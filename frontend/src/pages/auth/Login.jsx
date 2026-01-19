import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLoginMutation } from '../../api/auth.api';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  });

  const loginMutation = useLoginMutation({
    onSuccess: (data) => {
      // Token storage and navigation are handled in the API layer
      // Update auth state if token is present - backend returns token in data.result.token
      const token = data?.result?.token || data?.token || data?.data?.token || data?.accessToken;
      if (token) {
        login(token);
      }
    },
    onError: (error) => {
      // Error handling is done via mutation state
    },
  });

  const onSubmit = async (formData) => {
    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  const errorMessage = loginMutation.isError ? loginMutation.error?.response?.data?.message || 'Invalid email or password!' : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-[#FF9500] text-center">7E POS</h1>

      <div className="w-full max-w-md p-6 sm:p-8 bg-[#2a2a2a] rounded-3xl shadow-lg text-center">
        <h1 className="text-xl sm:text-2xl mb-4 sm:mb-6 text-[#ffffff]">Login!</h1>
        <p className="text-xs sm:text-sm text-white mb-4 sm:mb-6">Please enter your credentials below to continue</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#FF9500]">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full pl-10 pr-4 py-2 placeholder:text-xs rounded-md bg-[#3a3a3a] text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#FF9500]">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                })}
                className="w-full pl-10 pr-10 py-2 placeholder:text-xs rounded-md bg-[#3a3a3a] text-white focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[#FF9500] hover:text-white">
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {(errorMessage || loginMutation.isError) && <p className="text-red-500 text-sm mb-3">{errorMessage}</p>}

          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center text-xs text-gray-300">
              <input type="checkbox" className="mr-2 w-3 h-3 accent-[#FF9500]" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[#FF9500] text-xs hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loginMutation.isPending}
            className="w-[120px] h-[40px] py-2 rounded-md bg-[#FF9500] hover:bg-[#e68806] text-black text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
