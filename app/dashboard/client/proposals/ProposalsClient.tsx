'use client'

import { useState } from 'react'
import ProposalCard from '@/components/dashboard/ProposalCard'
import CounterOfferModal from '@/components/modals/CounterOfferModal'

interface ProposalsClientProps {
  proposals: any[]
  userRole: 'client'
  onAccept: (id: string) => Promise<void>
  onDecline: (id: string) => Promise<void>
}

export default function ProposalsClient({
  proposals,
  userRole,
  onAccept,
  onDecline
}: ProposalsClientProps) {
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)

  const handleCounterOffer = (proposal: any) => {
    setSelectedProposal(proposal)
    setShowCounterOfferModal(true)
  }

  return (
    <>
      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <ProposalCard
            key={proposal.id}
            id={proposal.id}
            // @ts-ignore
            projectTitle={proposal.projects?.title || 'Unknown Project'}
            // @ts-ignore
            projectId={proposal.projects?.id}
            // @ts-ignore
            projectDescription={proposal.projects?.description}
            // @ts-ignore
            freelancerName={proposal.profiles?.full_name || 'Unknown Freelancer'}
            freelancerId={proposal.freelancer_id}
            // @ts-ignore
            freelancerSkills={proposal.profiles?.freelancer_profiles?.skills}
            // @ts-ignore
            freelancerRating={proposal.profiles?.freelancer_profiles?.rating}
            // @ts-ignore
            avatarUrl={proposal.profiles?.freelancer_profiles?.avatar_url}
            proposedBudget={proposal.proposed_budget}
            estimatedDuration={proposal.estimated_duration}
            coverLetter={proposal.cover_letter}
            status={proposal.status}
            createdAt={proposal.created_at}
            userRole={userRole}
            delay={index * 0.05}
            negotiationCount={proposal.negotiation_count || 0}
            originalBudget={proposal.original_budget}
            negotiationHistory={proposal.negotiation_history}
            onAccept={async () => await onAccept(proposal.id)}
            onDecline={async () => await onDecline(proposal.id)}
            onCounterOffer={() => handleCounterOffer(proposal)}
          />
        ))}
      </div>

      {/* Counter Offer Modal */}
      {showCounterOfferModal && selectedProposal && (
        <CounterOfferModal
          proposal={{
            id: selectedProposal.id,
            budget: selectedProposal.proposed_budget,
            duration: selectedProposal.estimated_duration,
            cover_letter: selectedProposal.cover_letter,
            negotiation_count: selectedProposal.negotiation_count || 0,
            original_budget: selectedProposal.original_budget,
            negotiation_history: selectedProposal.negotiation_history || []
          }}
          // @ts-ignore
          projectTitle={selectedProposal.projects?.title || 'Unknown Project'}
          currentUserRole="client"
          onClose={() => {
            setShowCounterOfferModal(false)
            setSelectedProposal(null)
          }}
        />
      )}
    </>
  )
}
