import React from 'react';
import { useForm } from 'react-hook-form';
import { errorToast, successToast } from '../../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../../config/Api_call';
import { Input } from '../../reusable/Input';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSignedupUser } from '../../../redux_toolkit/signedupUserslice';

const Generate_otp = () => {
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
      const response = await AxiosInstance.post('/auth/generate_otp', data);

      if (response.data.user) {
        dispatch(setSignedupUser(response.data.user));
      }

      successToast('✅ OTP sent to your email!');
      navigate('/verify_otp');
    } catch (error) {
      console.error('OTP Generation Error:', error);
      errorToast('❌ Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-200 to-white p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">🔐 OTP Verification</h2>
        <p className="text-gray-600 mb-6">An OTP will be sent to your registered email.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-green-600 hover:bg-green-700 font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Generate_otp;

