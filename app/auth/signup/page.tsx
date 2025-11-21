'use client'

import { AnimatePresence, motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const BASE_TRANSITION = { ease: "anticipate", duration: 0.75 }

export default function SignUpPage() {
  const [selected, setSelected] = useState<'freelancer' | 'client'>('freelancer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign up with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: selected,
          },
        },
      })

      if (signUpError) throw signUpError

      if (signUpData.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: signUpData.user.id,
              email: signUpData.user.email,
              full_name: fullName,
              role: selected,
            },
          ])

        if (profileError) throw profileError

        // Redirect to dashboard
        router.push(`/dashboard/${selected}`)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google sign up')
      setLoading(false)
    }
  }

  return (
    <section className={`min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-[750ms] ${
      selected === "client"
        ? "bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800"
        : "bg-gradient-to-br from-rose-600 via-red-700 to-pink-800"
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl ${
            selected === "client" ? "bg-emerald-400/30" : "bg-rose-400/30"
          }`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className={`absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl ${
            selected === "client" ? "bg-teal-400/30" : "bg-pink-400/30"
          }`}
        />
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <form
            onSubmit={handleEmailSignUp}
            className="p-8 lg:p-12 w-full text-white"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="text-3xl font-bold text-white hover:text-white/90 transition-colors">
                  Khedme
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-sm text-white/90 hover:text-white font-medium underline underline-offset-4"
                >
                  Sign in instead
                </Link>
              </div>
              <h3 className="text-4xl font-bold mb-2">Create your account</h3>
              <p className="text-white/90">Join thousands of professionals in the Middle East</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-white/20 border border-white/40 rounded-lg text-white text-sm">
                {error}
              </div>
            )}

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full mb-6 bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/80">Or continue with email</span>
              </div>
            </div>

            {/* Name input */}
            <div className="mb-6">
              <p className="text-xl mb-2 font-medium">Hi 👋! My name is...</p>
              <input
                type="text"
                placeholder="Your name..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/95 transition-colors duration-[750ms] placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-white shadow-lg font-medium"
              />
            </div>

            {/* Role toggle */}
            <div className="mb-6">
              <p className="text-xl mb-2 font-medium">and I want to...</p>
              <div className="border-2 rounded-2xl border-white/40 overflow-hidden font-medium w-fit backdrop-blur-sm bg-white/10">
                <button
                  type="button"
                  className={`${
                    selected === "freelancer" ? "text-rose-700" : "text-white"
                  } text-sm px-6 py-2.5 transition-colors duration-[750ms] relative font-semibold`}
                  onClick={() => setSelected("freelancer")}
                >
                  <span className="relative z-10">Find work</span>
                  {selected === "freelancer" && (
                    <motion.div
                      transition={BASE_TRANSITION}
                      layoutId="form-tab"
                      className="absolute inset-0 bg-white z-0 rounded-l-xl"
                    />
                  )}
                </button>
                <button
                  type="button"
                  className={`${
                    selected === "client" ? "text-emerald-700" : "text-white"
                  } text-sm px-6 py-2.5 transition-colors duration-[750ms] relative font-semibold`}
                  onClick={() => setSelected("client")}
                >
                  <span className="relative z-10">Hire talent</span>
                  {selected === "client" && (
                    <motion.div
                      transition={BASE_TRANSITION}
                      layoutId="form-tab"
                      className="absolute inset-0 bg-white z-0 rounded-r-xl"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <p className="text-xl mb-2 font-medium">My email is...</p>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/95 transition-colors duration-[750ms] placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-white shadow-lg font-medium"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <p className="text-xl mb-2 font-medium">and my password will be...</p>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/95 transition-colors duration-[750ms] placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-white shadow-lg font-medium"
              />
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.99,
              }}
              type="submit"
              disabled={loading}
              className={`${
                selected === "client"
                  ? "bg-white text-emerald-700"
                  : "bg-white text-rose-700"
              } transition-colors duration-[750ms] text-lg text-center rounded-xl w-full py-3 font-semibold shadow-lg disabled:opacity-50 hover:shadow-xl`}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>
        </div>
      </div>
    </section>
  )
}
