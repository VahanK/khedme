'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Button, Input, Textarea, Chip } from '@heroui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function PostProjectPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [deadline, setDeadline] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
        setSkillInput('')
      }
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            client_id: user.id,
            title,
            description,
            budget_min: parseFloat(budgetMin) || null,
            budget_max: parseFloat(budgetMax) || null,
            deadline: deadline || null,
            required_skills: skills,
            status: 'open'
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Update client profile project count
      await supabase.rpc('increment', {
        table_name: 'client_profiles',
        column_name: 'total_projects_posted',
        row_id: user.id
      })

      router.push('/dashboard/client')
    } catch (err: any) {
      setError(err.message || 'Failed to post project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="light"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Post a New Project</h1>
          <p className="text-gray-600 mt-1">Find the perfect freelancer for your project</p>
        </div>

        <Card className="border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
              <p className="text-sm text-gray-600">Provide clear information to attract the right talent</p>
            </div>
          </CardHeader>

          <CardBody className="gap-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <Input
                  placeholder="e.g., Build a responsive e-commerce website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <Textarea
                  placeholder="Describe your project in detail. Include requirements, expectations, and any specific technologies or skills needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minRows={6}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
              </div>

              {/* Budget */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    min="0"
                    step="0.01"
                    size="lg"
                    startContent={<span className="text-gray-500">$</span>}
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    min="0"
                    step="0.01"
                    size="lg"
                    startContent={<span className="text-gray-500">$</span>}
                    classNames={{
                      input: "text-base",
                      inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                    }}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <Input
                  placeholder="Type a skill and press Enter (e.g., React, Node.js, UI/UX)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, index) => (
                      <Chip
                        key={index}
                        onClose={() => removeSkill(skill)}
                        variant="flat"
                        color="success"
                        endContent={
                          <button type="button" onClick={() => removeSkill(skill)}>
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        }
                      >
                        {skill}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="success"
                  isLoading={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? 'Posting...' : 'Post Project'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
