'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Image,
  Spinner,
  Chip,
} from '@heroui/react'
import { DollarSign, Shield, Clock, CheckCircle, Eye, AlertCircle } from 'lucide-react'
import EscrowStatusBadge from '../escrow/EscrowStatusBadge'

interface Project {
  id: string
  title: string
  escrow_amount: number
  freelancer_payout_amount: number
  platform_fee_amount: number
  payment_proof_url?: string
  payment_submitted_at?: string
  escrow_release_requested_at?: string
  client: { full_name: string; email: string }
  freelancer?: { full_name: string; email: string }
}

export default function AdminEscrowDashboard() {
  const [loading, setLoading] = useState(true)
  const [pendingVerifications, setPendingVerifications] = useState<Project[]>([])
  const [pendingReleases, setPendingReleases] = useState<Project[]>([])
  const [activeEscrows, setActiveEscrows] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [modalType, setModalType] = useState<'verify' | 'release' | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [verificationsRes, releasesRes, activeRes] = await Promise.all([
        fetch('/api/admin/escrow/pending-verifications'),
        fetch('/api/admin/escrow/pending-releases'),
        fetch('/api/admin/escrow/active'),
      ])

      const [verificationsData, releasesData, activeData] = await Promise.all([
        verificationsRes.json(),
        releasesRes.json(),
        activeRes.json(),
      ])

      setPendingVerifications(verificationsData.projects || [])
      setPendingReleases(releasesData.projects || [])
      setActiveEscrows(activeData.projects || [])
    } catch (error) {
      console.error('Error fetching escrow data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openVerifyModal = (project: Project) => {
    setSelectedProject(project)
    setModalType('verify')
    setNotes('')
  }

  const openReleaseModal = (project: Project) => {
    setSelectedProject(project)
    setModalType('release')
    setTransactionId('')
    setPaymentMethod('')
    setNotes('')
  }

  const handleVerifyEscrow = async () => {
    if (!selectedProject) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/escrow/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to verify escrow')
      }

      alert('Escrow verified successfully!')
      closeModal()
      fetchData()
    } catch (error: any) {
      console.error('Error verifying escrow:', error)
      alert(error.message || 'Failed to verify escrow')
    } finally {
      setProcessing(false)
    }
  }

  const handleReleaseEscrow = async () => {
    if (!selectedProject) return

    setProcessing(true)
    try {
      const response = await fetch('/api/admin/escrow/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          transactionId,
          paymentMethod,
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to release escrow')
      }

      alert('Payment released successfully!')
      closeModal()
      fetchData()
    } catch (error: any) {
      console.error('Error releasing escrow:', error)
      alert(error.message || 'Failed to release payment')
    } finally {
      setProcessing(false)
    }
  }

  const closeModal = () => {
    setSelectedProject(null)
    setModalType(null)
    setTransactionId('')
    setPaymentMethod('')
    setNotes('')
  }

  // Calculate stats
  const totalHeld = activeEscrows.reduce((sum, p) => sum + (p.escrow_amount || 0), 0)
  const totalFees = [... pendingReleases, ...activeEscrows].reduce(
    (sum, p) => sum + (p.platform_fee_amount || 0),
    0
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-default-500">Pending Verifications</p>
              <p className="text-2xl font-bold">{pendingVerifications.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Pending Releases</p>
              <p className="text-2xl font-bold">{pendingReleases.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Held</p>
              <p className="text-2xl font-bold">${totalHeld.toFixed(2)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-default-500">Platform Fees</p>
              <p className="text-2xl font-bold">${totalFees.toFixed(2)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs aria-label="Escrow management tabs" size="lg" fullWidth>
        <Tab
          key="verifications"
          title={
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Verifications
              {pendingVerifications.length > 0 && (
                <Chip size="sm" color="warning">
                  {pendingVerifications.length}
                </Chip>
              )}
            </div>
          }
        >
          <Card>
            <CardBody>
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending verifications</p>
                </div>
              ) : (
                <Table aria-label="Pending verifications table">
                  <TableHeader>
                    <TableColumn>PROJECT</TableColumn>
                    <TableColumn>CLIENT</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>SUBMITTED</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pendingVerifications.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-xs text-default-500">ID: {project.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{project.client.full_name}</p>
                            <p className="text-xs text-default-500">{project.client.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">${project.escrow_amount?.toFixed(2)}</p>
                            <p className="text-xs text-default-500">
                              Fee: ${project.platform_fee_amount?.toFixed(2)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {project.payment_submitted_at
                              ? new Date(project.payment_submitted_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="primary"
                            startContent={<Eye className="w-4 h-4" />}
                            onClick={() => openVerifyModal(project)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="releases"
          title={
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pending Releases
              {pendingReleases.length > 0 && (
                <Chip size="sm" color="primary">
                  {pendingReleases.length}
                </Chip>
              )}
            </div>
          }
        >
          <Card>
            <CardBody>
              {pendingReleases.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending releases</p>
                </div>
              ) : (
                <Table aria-label="Pending releases table">
                  <TableHeader>
                    <TableColumn>PROJECT</TableColumn>
                    <TableColumn>FREELANCER</TableColumn>
                    <TableColumn>PAYOUT</TableColumn>
                    <TableColumn>REQUESTED</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pendingReleases.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-xs text-default-500">ID: {project.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{project.freelancer?.full_name || 'N/A'}</p>
                            <p className="text-xs text-default-500">{project.freelancer?.email || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-success">
                              ${project.freelancer_payout_amount?.toFixed(2)}
                            </p>
                            <p className="text-xs text-default-500">
                              Your fee: ${project.platform_fee_amount?.toFixed(2)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {project.escrow_release_requested_at
                              ? new Date(project.escrow_release_requested_at).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            color="success"
                            startContent={<CheckCircle className="w-4 h-4" />}
                            onClick={() => openReleaseModal(project)}
                          >
                            Release
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="active"
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Active Escrows
            </div>
          }
        >
          <Card>
            <CardBody>
              {activeEscrows.length === 0 ? (
                <div className="text-center py-8 text-default-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active escrows</p>
                </div>
              ) : (
                <Table aria-label="Active escrows table">
                  <TableHeader>
                    <TableColumn>PROJECT</TableColumn>
                    <TableColumn>CLIENT</TableColumn>
                    <TableColumn>FREELANCER</TableColumn>
                    <TableColumn>AMOUNT HELD</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {activeEscrows.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-xs text-default-500">ID: {project.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{project.client.full_name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{project.freelancer?.full_name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">${project.escrow_amount?.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <Chip color="success" size="sm" variant="flat">
                            Active
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Verify Modal */}
      <Modal isOpen={modalType === 'verify'} onClose={closeModal} size="2xl">
        <ModalContent>
          <ModalHeader>Verify Payment Proof</ModalHeader>
          <ModalBody>
            {selectedProject && (
              <div className="space-y-4">
                <div className="bg-default-100 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Project Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-default-500">Title:</span> {selectedProject.title}
                    </p>
                    <p>
                      <span className="text-default-500">Client:</span> {selectedProject.client.full_name} (
                      {selectedProject.client.email})
                    </p>
                    <p>
                      <span className="text-default-500">Escrow Amount:</span> $
                      {selectedProject.escrow_amount?.toFixed(2)}
                    </p>
                    <p>
                      <span className="text-default-500">Platform Fee:</span> $
                      {selectedProject.platform_fee_amount?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {selectedProject.payment_proof_url && (
                  <div>
                    <h4 className="font-medium mb-2">Payment Proof</h4>
                    <Image
                      src={selectedProject.payment_proof_url}
                      alt="Payment proof"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}

                <Textarea
                  label="Notes (optional)"
                  placeholder="Add any notes about this verification..."
                  value={notes}
                  onValueChange={setNotes}
                />

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-sm">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning mb-1">Verification Checklist:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-default-600">
                        <li>Payment amount matches ${selectedProject.escrow_amount?.toFixed(2)}</li>
                        <li>Payment is made to the official Khedme account</li>
                        <li>Receipt/proof is clear and legitimate</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeModal} disabled={processing}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleVerifyEscrow} isLoading={processing}>
              Verify & Activate Escrow
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Release Modal */}
      <Modal isOpen={modalType === 'release'} onClose={closeModal} size="2xl">
        <ModalContent>
          <ModalHeader>Release Payment</ModalHeader>
          <ModalBody>
            {selectedProject && (
              <div className="space-y-4">
                <div className="bg-default-100 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Payment Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-default-500">Project:</span> {selectedProject.title}
                    </p>
                    <p>
                      <span className="text-default-500">Freelancer:</span>{' '}
                      {selectedProject.freelancer?.full_name || 'N/A'} ({selectedProject.freelancer?.email || 'N/A'})
                    </p>
                    <p>
                      <span className="text-default-500">Payout Amount:</span> $
                      {selectedProject.freelancer_payout_amount?.toFixed(2)}
                    </p>
                    <p className="text-success font-medium">
                      <span className="text-default-500 font-normal">Your Fee:</span> $
                      {selectedProject.platform_fee_amount?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Input
                  label="Transaction ID"
                  placeholder="Enter bank transfer ID or reference"
                  value={transactionId}
                  onValueChange={setTransactionId}
                />

                <Input
                  label="Payment Method"
                  placeholder="e.g., Bank Transfer, OMT, Whish"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                />

                <Textarea
                  label="Notes (optional)"
                  placeholder="Add any notes about this payment release..."
                  value={notes}
                  onValueChange={setNotes}
                />

                <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-success mb-1">After releasing payment:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-default-600">
                        <li>Manually transfer ${selectedProject.freelancer_payout_amount?.toFixed(2)} to freelancer</li>
                        <li>Enter the transaction details above for tracking</li>
                        <li>Project will be marked as completed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeModal} disabled={processing}>
              Cancel
            </Button>
            <Button color="success" onPress={handleReleaseEscrow} isLoading={processing}>
              Confirm Release
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
