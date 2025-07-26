import React from 'react'
import { useForm } from 'react-hook-form';
import { errorToast, successToast } from '../../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Otp_verification = () => {
  const navigate = useNavigate();
  const { signedupUser } = useSelector(store => store.signedupUser);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    console.log(data);
    console.log(signedupUser)
    const otp = data.otp;
    const joinedOTP = otp.join('');
    console.log(joinedOTP);
    console.log(signedupUser._id)
    
    try {
      axios({
        method: 'POST',
        url: `${import.meta.env.VITE_BASE_URL}/auth/verify_otp/${signedupUser._id}`,
        data: { otp: joinedOTP }
      }).then((response) => {
        console.log(response.data);
        successToast('OTP Verification successfull');
        navigate('/set_password')

      })
    } catch (error) {
      console.log(error);
      errorToast('something went wrong')

    }
  }
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-200 to-white p-4">

        <div className="relative w-full max-w-md border border-[rgba(212,175,55,0.3)] rounded-3xl shadow-2xl p-10 text-center z-10 space-y-6">
          <h2 className="text-3xl font-bold text-[var(--lightblack)]">Verify OTP</h2>
          <p className="text-[var(--lightblack)]/80 text-sm">
            Enter the 6-digit code sent to your email
          </p>

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-center gap-4">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="number"
                  maxLength="1"
                  {...register(`otp[${index}]`, {
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{1}$/,
                      message: 'Each OTP digit must be a number',
                    },
                  })}
                  className="w-12 h-14 text-center rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] placeholder-[var(--gray)] focus:outline-none focus:ring-2 focus:ring-[var(--yellow)]"
                />
              ))}
            </div>
            {errors.otp && <p className="text-red-500">{errors.otp.message}</p>}

            <div className="text-sm text-[var(--lightblack)]/70">
              Didn’t receive the code?{' '}
              <button
                type="button"
                className="text-[var(--yellow)] hover:underline"
                onClick={() => { }}
              >
                Resend
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[oklch(62.7%_0.194_149.214)] hover:bg-[oklch(52.7%_0.194_149.214)] font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>


    </>
  )
}

export default Otp_verification