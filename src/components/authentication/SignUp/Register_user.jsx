import React from 'react'
import { useForm } from "react-hook-form";
import AxiosInstance from '../../../config/Api_call';
import axios from 'axios'
import { errorToast, successToast } from '../../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { setSignedupUser } from '../../../redux_toolkit/signedupUserslice';

const Register_user = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { signedupUser } = useSelector(store => store.signedupUser)
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const onSubmit = (data) => {
        console.log(data);
        try {
            axios({
                method: 'POST',
                url: `${import.meta.env.VITE_BASE_URL}/auth/register_user`,
                data: data
            }).then((response) => {
                console.log(response.data);
                successToast('User Registration Successfull');

                navigate('/generate_otp');
                localStorage.setItem('signedupUser', JSON.stringify(response.data.registered_user));
                dispatch(setSignedupUser(response.data.registered_user));
            })
        } catch (error) {
            console.log(error.data);
            errorToast('something went wrong')

        }
    }
    return (
        <>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--yellow)] to-[var(--white)] p-4 relative overflow-hidden">
  {/* subtle radial dot background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none animate-pulse"></div>

  <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.15)] backdrop-blur-xl border border-[rgba(212,175,55,0.3)] rounded-3xl shadow-2xl p-8 space-y-6 text-[var(--black)]">
    <h2 className="text-3xl font-bold text-center text-[var(--lightblack)]">Create Account</h2>
    <p className="text-sm text-center text-[var(--lightblack)]/80">Join us! Please fill in your details</p>

    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="Full Name"
        className="w-full p-3 rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
        {...register('fullName', { required: 'Full Name is required' })}
      />
      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid Email',
          },
        })}
      />
      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
        {...register('password', {
          required: 'Password is required',
          pattern: {
            value: /^[A-Za-z0-9]{8,}$/,
            message: 'Password must be at least 8 characters (letters or numbers)',
          },
        })}
      />
      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

      <input
        type="text"
        placeholder="Mobile Number"
        className="w-full p-3 rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
        {...register('mobileNumber', {
          required: 'Mobile Number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Mobile Number must be exactly 10 digits',
          },
        })}
      />
      {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber.message}</p>}

      <button
        type="submit"
        className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--black)] to-[var(--yellow)] font-semibold text-[var(--white)] text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
      >
        Register
      </button>
    </form>

    <p className="text-sm text-center text-[var(--lightblack)]/70">
      Already have an account?{' '}
      <span className="text-[var(--yellow)] hover:underline cursor-pointer">Login</span>
    </p>
  </div>
</div>




        </>
    )
}

export default Register_user