import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { errorToast, successToast } from '../../../plugins/toast';
import { useSelector } from 'react-redux';

const Set_password = () => {
    const navigate = useNavigate();
    const { signedupUser } = useSelector(store => store.signedupUser);
    console.log(signedupUser.id);

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
                url: `${import.meta.env.VITE_BASE_URL}/auth/create_password/${signedupUser._id}`,
                data: data,
                params: { id: signedupUser._id }
            }).then((response) => {
                console.log(response.data);
                successToast('Your account is created successfully');
                navigate('/login')

            })
        } catch (error) {
            console.log(error);
            errorToast('something went wrong')

        }
    }
    return (
        <>
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--yellow)] to-[var(--white)] p-4 relative overflow-hidden">
  {/* subtle radial dot background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none animate-pulse"></div>

  <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.15)] backdrop-blur-xl border border-[rgba(212,175,55,0.3)] rounded-3xl shadow-2xl p-8 space-y-6 text-[var(--black)]">
    <h2 className="text-3xl font-bold text-center text-[var(--lightblack)]">Set Password</h2>
    <p className="text-sm text-center text-[var(--lightblack)]/80">
      Create a secure password to complete your registration
    </p>

    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <input
        type="password"
        placeholder="New Password"
        className="w-full p-3 rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
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
        className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--black)] to-[var(--yellow)] font-semibold text-[var(--white)] text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
      >
        Set Password
      </button>
    </form>
  </div>
</div>


        </>
    )
}

export default Set_password