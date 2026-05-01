import React, { useRef, useState } from 'react';
import { errorToast, successToast } from '../../../plugins/toast';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../../config/Api_call';
import { useSelector } from 'react-redux';

const Otp_verification = () => {
  const navigate = useNavigate();
  const { signedupUser } = useSelector(store => store.signedupUser);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Handle single digit input — auto-advance to next box
  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ''); // digits only
    if (!val) return;
    const digit = val.slice(-1); // take last character in case of double input
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Move to next input
    if (index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace — clear current box and move back
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        // Clear current box first
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move back and clear previous
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle paste — fill all boxes at once
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus last filled box
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex].focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const joinedOTP = otp.join('');
    if (joinedOTP.length < 6) {
      errorToast('Please enter all 6 digits');
      return;
    }
    try {
      setIsLoading(true);
      await AxiosInstance.post(`/auth/verify_otp/${signedupUser._id}`, { otp: joinedOTP });
      successToast('OTP Verification successful');
      navigate('/set_password');
    } catch (error) {
      console.error(error);
      errorToast('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-green-200 to-white p-4">
        <div className="relative w-full max-w-md border border-[rgba(212,175,55,0.3)] rounded-3xl shadow-2xl p-10 text-center z-10 space-y-6">
          <h2 className="text-3xl font-bold text-[var(--lightblack)]">Verify OTP</h2>
          <p className="text-[var(--lightblack)]/80 text-sm">
            Enter the 6-digit code sent to your email
          </p>

          <form className="space-y-8" onSubmit={onSubmit}>
            <div className="flex justify-center gap-4" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-[var(--lightblack)] bg-[var(--white)] text-[var(--black)] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                />
              ))}
            </div>

            <div className="text-sm text-[var(--lightblack)]/70">
              Didn't receive the code?{' '}
              <button
                type="button"
                className="text-green-600 hover:underline"
                onClick={() => { }}
              >
                Resend
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 6}
              className="w-full py-3 rounded-full bg-green-600 hover:bg-green-700 font-semibold text-white text-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Otp_verification;
