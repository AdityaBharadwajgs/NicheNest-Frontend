import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import AxiosInstance from '../../../config/Api_call';
import { errorToast, successToast } from '../../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSignedupUser } from '../../../redux_toolkit/signedupUserslice';
import { Input } from '../../reusable/Input';

const Register_user = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance.post('/auth/register_user', data);

      successToast('User Registration Successful');
      localStorage.setItem('signedupUser', JSON.stringify(response.data.registered_user));
      dispatch(setSignedupUser(response.data.registered_user));
      navigate('/generate_otp');
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'Something went wrong';
      errorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-200 to-white p-4">
      <div className="w-full max-w-md bg-white/80 border border-[#1f2937] rounded-2xl shadow-lg p-8 space-y-6 text-[#111827] backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center">Create Account</h2>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="Full Name"
            className="w-full rounded-xl border border-[#1f2937] bg-white text-[#111827] placeholder:text-[#4b5563] focus:outline-none focus:ring-2 focus:ring-green-500"
            {...register('fullName', { required: 'Full Name is required' })}
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}

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
            type="text"
            placeholder="Mobile Number"
            className="w-full rounded-xl border border-[#1f2937] bg-white text-[#111827] placeholder:text-[#4b5563] focus:outline-none focus:ring-2 focus:ring-green-500"
            {...register('mobileNumber', {
              required: 'Mobile Number is required',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'Mobile Number must be exactly 10 digits',
              },
            })}
          />
          {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-green-600 hover:bg-green-700 font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <p className="text-lg text-center">
          Already have an account?{' '}
          <span
            className="text-green-600 cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register_user;

