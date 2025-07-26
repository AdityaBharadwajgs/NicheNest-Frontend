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
  const dispatch = useDispatch()
  const { signedupUser } = useSelector(store => store.signedupUser);
  const { loggedinUser } = useSelector(store => store.loggedinUser);

  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await AxiosInstance.post('/auth/login', data);

      const { token, user } = response.data;

      if (user.role !== selectedRole) {
        errorToast(`You are not authorized as ${selectedRole}`);
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
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      errorToast(error.response?.data?.message || 'Login failed. Try again.');
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
              pattern: {
                value: /^[A-Za-z0-9]{8,}$/,
                message: 'Minimum 8 characters required',
              },
            })}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

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
            className="w-full py-3 rounded-full bg-[oklch(62.7%_0.194_149.214)] hover:bg-[oklch(52.7%_0.194_149.214)] font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform"
          >
            Login
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
