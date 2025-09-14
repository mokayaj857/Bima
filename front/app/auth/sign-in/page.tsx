"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import GoogleSignInButton from "@/components/GoogleSignInButton"

type AuthStep = "welcome" | "verify-email" | "verify-phone"
type AuthMethod = "phone" | "email"

export default function Component() {
  const [step, setStep] = useState<AuthStep>("welcome")
  const [method, setMethod] = useState<AuthMethod>("email")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(0)

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone number validation function (basic validation for international format)
  const isValidPhoneNumber = (phone: string) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }

  // Check if continue button should be enabled
  const isContinueEnabled = () => {
    if (method === "email") {
      return email.trim() !== "" && isValidEmail(email)
    } else {
      return phoneNumber.trim() !== "" && isValidPhoneNumber(phoneNumber)
    }
  }

  // Timer effect for resend functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [resendTimer])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleContinue = () => {
    if (!isContinueEnabled()) return

    if (method === "phone") {
      setStep("verify-phone")
    } else {
      setStep("verify-email")
    }

    // Start the resend timer when moving to verification step
    setResendTimer(60) // 60 seconds timer
  }

  const handleBack = () => {
    setStep("welcome")
    setResendTimer(0) // Reset timer when going back
  }

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const digits = text.replace(/\D/g, "").slice(0, 6).split("")
      const newCode = [...Array(6)].map((_, i) => digits[i] || "")
      setCode(newCode)
    } catch (err) {
      console.error("Failed to paste:", err)
    }
  }

  const handleResendCode = () => {
    // Reset the timer to 60 seconds
    setResendTimer(60)
    // Here you would typically make an API call to resend the code
    console.log("Resending code...")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
    {/*  <div
        className="absolute inset-0"
        style={{
          background: `
      radial-gradient(ellipse 800px 600px at 50% 50%, #61b693 0%, transparent 70%),
      radial-gradient(ellipse 700px 500px at 15% 85%, #2c304c 0%, #2c304c 30%, transparent 60%),
      radial-gradient(ellipse 600px 500px at 85% 15%, #1f2020 0%, #1f2020 40%, transparent 70%),
      radial-gradient(ellipse 600px 500px at 85% 85%, #1e1e1e 0%, #1e1e1e 40%, transparent 70%),
      radial-gradient(ellipse 500px 400px at 10% 10%, #1e1e1e 0%, transparent 60%),
      linear-gradient(135deg, #1e1e1e 0%, #2c304c 25%, #3c6351 50%, #61b693 75%, #1f2020 100%)
    `,
        }}
      />*/}

      {/* Subtle Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 1px,
        rgba(255, 255, 255, 0.015) 1px,
        rgba(255, 255, 255, 0.015) 2px
      )
    `,
          filter: "blur(0.5px)",
          mixBlendMode: "overlay",
        }}
      />

      <header className="flex justify-between items-center px-6 py-4 relative z-10 flex-shrink-0">
        <Link href="/">
          <span className="font-bold text-2xl">Rhoda</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {step === "welcome" && (
          <div className="w-full max-w-md">
            <div
              className="backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl"
              style={{
                backgroundColor: "hsl(0 0% 100% / 0.15)",
                border: "1px solid hsl(0 0% 100% / 0.2)",
                boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
              }}
            >
              <div className="space-y-6">
                <div className="text-left space-y-2">
                  <h2 className="text-white text-2xl font-bold">Welcome to Rhoda</h2>
                  <p className="text-white/80 text-sm">Please sign in or sign up below.</p>
                </div>

                {/* Tab Switcher with Dynamic Ordering and Text */}
                <div className="flex">
                  {method === "email" ? (
                    <>
                      <button
                        onClick={() => setMethod("email")}
                        className="flex-1 text-sm font-medium pb-2 text-white border-b-2 border-white text-left"
                      >
                        E-Mail
                      </button>
                      <button
                        onClick={() => setMethod("phone")}
                        className="flex-1 text-sm font-medium pb-2 text-white/60 text-right"
                      >
                        Use Phone Number
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setMethod("phone")}
                        className="flex-1 text-sm font-medium pb-2 text-white border-b-2 border-white text-left"
                      >
                        Phone
                      </button>
                      <button
                        onClick={() => setMethod("email")}
                        className="flex-1 text-sm font-medium pb-2 text-white/60 text-right"
                      >
                        Use E-Mail
                      </button>
                    </>
                  )}
                </div>

                {/* Input Field */}
                <div className="space-y-4">
                  <Input
                    type={method === "email" ? "email" : "tel"}
                    value={method === "email" ? email : phoneNumber}
                    onChange={(e) => (method === "email" ? setEmail(e.target.value) : setPhoneNumber(e.target.value))}
                    className="h-12 rounded-2xl border-0 text-gray-700 placeholder:text-gray-500 font-medium"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }}
                    placeholder={method === "email" ? "you@email.com" : "+254 7XX XXX XXX"}
                  />

                  <button
                    onClick={handleContinue}
                    disabled={!isContinueEnabled()}
                    className="w-full h-12 rounded-2xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#7C3AED",
                      boxShadow: "0 4px 14px 0 rgba(124, 58, 237, 0.4)",
                    }}
                  >
                    Continue with {method === "email" ? "E-Mail" : "Phone Number"}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center space-x-4 py-2">
                  <div className="flex-1 h-px bg-white/30"></div>
                  <span className="text-white/80 text-sm font-medium">Or</span>
                  <div className="flex-1 h-px bg-white/30"></div>
                </div>

                {/* Google Sign In */}
                <GoogleSignInButton />
              </div>
            </div>
          </div>
        )}

        {(step === "verify-email" || step === "verify-phone") && (
          <div className="w-full max-w-md">
            <div
              className="backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl"
              style={{
                backgroundColor: "hsl(0 0% 100% / 0.15)",
                border: "1px solid hsl(0 0% 100% / 0.2)",
                boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
              }}
            >
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                  <h2 className="text-white text-2xl font-bold">Enter Code</h2>
                  <p className="text-white/80 text-sm">
                    {step === "verify-email"
                      ? `Please enter the 6 digit code we sent to ${email}.`
                      : `We sent a code to ${phoneNumber} via WhatsApp. Please enter it below.`}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-white text-sm">Enter the Code Here</Label>

                  {/* Code Input Boxes */}
                  <div className="flex space-x-3">
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        className="w-12 h-12 text-center bg-transparent border-2 border-white/40 text-white text-lg font-medium rounded-xl focus:border-white"
                        style={{
                          backgroundColor: "transparent", // Changed to transparent
                          border: "2px solid rgba(255, 255, 255, 0.8)", // Adjusted border for better visibility
                        }}
                      />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={handlePasteCode}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      Paste Code
                    </Button>
                    <Button
                      onClick={handleResendCode}
                      disabled={resendTimer > 0}
                      variant="ghost"
                      className="flex-1 h-12 rounded-xl text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend (${formatTime(resendTimer)})` : "Resend Code"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
