import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { successToast } from '../../plugins/toast'
import { Button } from '../reusable/Button'
const Landing = () => {
    const navigate = useNavigate()
    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-br from-[var(--black)] via-[var(--lightblack)] to-[var(--yellow)] flex items-center justify-center p-4 relative overflow-hidden">

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                    className="bg-[var(--white)]/10 backdrop-blur-xl border border-[var(--white)]/20 p-10 rounded-3xl shadow-2xl text-center max-w-3xl w-full z-10"
                >
                    <motion.h1
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.4, delay: 0.2 }}
                        className="text-4xl md:text-6xl font-extrabold text-[var(--white)] leading-tight mb-6"
                    >
                        Discover <span className="text-[var(--yellow)]">NicheNest</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-[var(--gray)] text-lg md:text-xl mb-10 max-w-2xl mx-auto"
                    >
                        Welcome to NicheNest – Your Home for Handcrafted & Unique Creations.
                        Discover one-of-a-kind handmade products crafted by talented artisans from across the country.
                        Support small businesses, celebrate culture, and shop meaningfully — only on NicheNest.
                    </motion.p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button
                            onClick={() => {navigate('/home'), successToast('Welcome To NicheNest')}}
                            className="bg-[var(--yellow)] hover:bg-yellow-500 text-[var(--black)] font-semibold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300 hover:scale-105 hover:cursor-pointer"
                        >
                            Get Started
                        </button> 
                    
                    </div>
                </motion.div>
            </div>

        </>
    )
}

export default Landing