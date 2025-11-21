import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircleIcon,
  StarIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'

export default async function PublicFreelancerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch freelancer profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'freelancer')
    .single()

  if (!profile) {
    notFound()
  }

  const { data: freelancerProfile } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('id', id)
    .single()

  // Fetch completed projects
  const { data: completedProjects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      status,
      budget_max,
      created_at,
      completed_at,
      profiles!projects_client_id_fkey (
        full_name
      )
    `)
    .eq('freelancer_id', id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            Khedme
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-12 border border-purple-200 shadow-xl mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.full_name?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
                <p className="text-2xl text-purple-600 font-semibold mb-4">{freelancerProfile?.title || 'Freelancer'}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">{freelancerProfile?.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-600">({freelancerProfile?.total_reviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">{freelancerProfile?.completed_projects || 0}</span>
                    <span className="text-gray-600">projects completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">{freelancerProfile?.years_of_experience || 0}</span>
                    <span className="text-gray-600">years experience</span>
                  </div>
                </div>
                {freelancerProfile?.availability && (
                  <div className="mt-4">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      freelancerProfile.availability === 'available' ? 'bg-green-100 text-green-700' :
                      freelancerProfile.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {freelancerProfile.availability === 'available' ? '✓ Available for work' :
                       freelancerProfile.availability === 'busy' ? 'Busy' : 'Unavailable'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold text-base shadow-lg"
            >
              Contact Freelancer
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            {freelancerProfile?.bio && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{freelancerProfile.bio}</p>
              </div>
            )}

            {/* Service Packages */}
            {freelancerProfile?.service_packages && freelancerProfile.service_packages.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Service Packages</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freelancerProfile.service_packages.map((pkg: any, index: number) => (
                    <div key={index} className="p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-purple-600">
                          ${pkg.price_min} - ${pkg.price_max}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Projects */}
            {completedProjects && completedProjects.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Past Projects</h2>
                  <span className="ml-auto text-base font-semibold text-gray-600 bg-green-50 px-4 py-2 rounded-full">
                    {completedProjects.length} completed
                  </span>
                </div>
                <div className="space-y-4">
                  {completedProjects.map((project: any) => (
                    <div key={project.id} className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                        </div>
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-600">
                          Client: <span className="font-medium text-gray-900">{project.profiles?.full_name || 'Anonymous'}</span>
                        </span>
                        {project.budget_max && (
                          <span className="text-gray-600">
                            Budget: <span className="font-medium text-gray-900">${project.budget_max}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {freelancerProfile?.languages && freelancerProfile.languages.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">Languages</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {freelancerProfile.languages.map((language: string) => (
                    <span key={language} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Link */}
            {freelancerProfile?.portfolio_url && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Portfolio</h3>
                <a
                  href={freelancerProfile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-lg hover:shadow-md transition-all duration-200 font-semibold text-center"
                >
                  View Portfolio →
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2025 Khedme. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
