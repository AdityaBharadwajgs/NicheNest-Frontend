import AxiosInstance from '../../../config/Api_call';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { errorToast, successToast } from '../../../plugins/toast';
import { useSelector } from 'react-redux';
import { Input } from '../../reusable/Input';

const Set_password = () => {
  const navigate = useNavigate();
  const { signedupUser } = useSelector((store) => store.signedupUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const res = await AxiosInstance.post(`/auth/create_password/${signedupUser._id}`, data);

      successToast('✅ Password updated successfully!');
      navigate('/login');
    } catch (error) {
      console.error('❌ Password creation failed:', error);
      errorToast('❌ Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-200 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800">🔒 Set Password</h2>
        <p className="text-sm text-center text-gray-600">
          Create a strong password to complete your registration
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="password"
            placeholder="Enter new password"
            className="w-full rounded-lg border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            {...register('password', {
              required: 'Password is required',
              pattern: {
                value: /^[A-Za-z0-9]{8,}$/,
                message: 'Password must be at least 8 characters (letters or numbers)',
              },
            })}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-green-600 hover:bg-green-700 font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Set_password;

