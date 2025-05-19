import React from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { errorToast, successToast } from '../../../plugins/toast';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate()
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
                url: `${import.meta.env.VITE_BASE_URL}/auth/login`,
                data: data
            }).then((response) => {
                console.log(response.data);
                successToast('Welcome To Our World');
                navigate('/home')

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
                    <h2 className="text-3xl font-bold text-center text-[var(--lightblack)]">Login</h2>
                    <p className="text-sm text-center text-[var(--lightblack)]/80">Welcome back! Please login to your account</p>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

                        <div className="flex justify-between items-center text-sm text-[var(--lightblack)]/80">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-[var(--yellow)]" />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="text-[var(--yellow)] hover:underline">
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--black)] to-[var(--yellow)] font-semibold text-[var(--white)] text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
                        >
                            Login
                        </button>
                    </form>

                    <p className="text-sm text-center text-[var(--lightblack)]/70">
                        Don’t have an account?{' '}
                        <span className="text-[var(--yellow)] hover:underline cursor-pointer">Sign up</span>
                    </p>
                </div>
            </div>

        </>
    )
}

export default Login