import React from 'react'
import { useForm } from "react-hook-form";
import { errorToast, successToast } from '../../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
const Generate_otp = () => {
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
                url: `${import.meta.env.VITE_BASE_URL}/auth/generate_otp`,
                data: data
            }).then((response) => {
                console.log(response.data);
                successToast('OTP sent to your email');
                navigate('/verify_otp')

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

                <div className="relative w-full max-w-md bg-[rgba(255,255,255,0.15)] backdrop-blur-xl border border-[rgba(212,175,55,0.3)] rounded-3xl shadow-2xl p-8 text-center z-10">
                    <h2 className="text-3xl font-bold text-[var(--lightblack)] mb-4">OTP Generation</h2>
                    <p className="text-[var(--lightblack)]/80 mb-8">
                        An OTP will be sent to your email.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
                        <input
                            type="text"
                            placeholder="Enter Email"
                            className="w-full p-3 rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Invalid Email',
                                },
                            })}
                        />
                        {errors.email && <p className="mt-1 text-red-500">{errors.email.message}</p>}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--black)] to-[var(--yellow)] font-semibold text-[var(--white)] text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
                        >
                            Generate OTP
                        </button>
                    </form>
                </div>
            </div>



        </>
    )
}

export default Generate_otp