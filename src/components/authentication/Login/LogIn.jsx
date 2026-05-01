import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { errorToast, successToast } from '../../../plugins/toast';
import AxiosInstance from '../../../config/Api_call';
import { Input } from '../../reusable/Input';
import { useDispatch, useSelector } from 'react-redux';
import { setSignedupUser } from '../../../redux_toolkit/signedupUserslice';
import { setloggedinUser } from '../../../redux_toolkit/loggedinUserslice';



const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance.post('/auth/login', data);

      const { token, user } = response.data;

      if (user.role !== selectedRole) {
        errorToast(`You are not authorized as ${selectedRole}`);
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('user', JSON.stringify(user));

      successToast('Welcome to Our World');

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        dispatch(setloggedinUser(response.data.user));
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      errorToast(error.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-200 to-white p-4">
      <div className="w-full max-w-md bg-white/80 border border-[#1f2937] rounded-2xl shadow-lg p-8 space-y-6 text-[#111827] backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center">Login</h2>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-[#1f2937] bg-white text-[#111827] placeholder:text-[#4b5563] focus:outline-none focus:ring-2 focus:ring-green-500"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid Email',
              },
            })}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          <Input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-[#1f2937] bg-white text-[#111827] placeholder:text-[#4b5563] focus:outline-none focus:ring-2 focus:ring-green-500"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Minimum 8 characters required',
              },
            })}
          />
          {selectedRole === 'user' && (
            <div className="flex justify-end mt-[-15px]">
              <span
                className="text-sm text-green-600 cursor-pointer hover:underline font-medium"
                onClick={() => navigate('/generate_otp')}
              >
                Forgot password?
              </span>
            </div>
          )}

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[#1f2937] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-green-600 hover:bg-green-700 font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-lg text-center">
          Don't have an account?{' '}
          <span className="text-green-600 cursor-pointer hover:underline" onClick={() => navigate('/register_user')}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
