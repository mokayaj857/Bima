"use client"

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useRouter } from 'next/navigation'

interface ProfileSetupProps {
  onComplete?: () => void
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [profileType, setProfileType] = useState<'learner' | 'educator'>('learner')
  const [formData, setFormData] = useState({
    name: user?.username || '',
    bio: '',
    interests: '',
    experience: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Profile creation logic removed - just complete the setup
      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to create profile:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
          <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started with Bima
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">I am a...</Label>
              <RadioGroup
                value={profileType}
                onValueChange={(value) => setProfileType(value as 'learner' | 'educator')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="learner" id="learner" />
                  <Label htmlFor="learner" className="cursor-pointer">
                    Learner - I want to take courses and learn new skills
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="educator" id="educator" />
                  <Label htmlFor="educator" className="cursor-pointer">
                    Educator - I want to create and share courses
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
              />
            </div>

            {/* Interests Field */}
            <div className="space-y-2">
              <Label htmlFor="interests">
                {profileType === 'learner' ? 'Learning Interests' : 'Teaching Areas'}
              </Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => handleInputChange('interests', e.target.value)}
                placeholder="e.g., Programming, Design, Marketing (separate with commas)"
              />
            </div>

            {/* Experience Field for Educators */}
            {profileType === 'educator' && (
              <div className="space-y-2">
                <Label htmlFor="experience">Teaching Experience</Label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Describe your teaching or professional experience..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
