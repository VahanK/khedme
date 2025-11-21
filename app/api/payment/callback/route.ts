import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('session_id')
  const status = searchParams.get('status') // 'success' or 'failed'
  const projectId = searchParams.get('project_id')

  if (!sessionId || !projectId) {
    return NextResponse.redirect(new URL('/dashboard/client?error=invalid_payment', request.url))
  }

  const supabase = await createClient()

  if (status === 'success') {
    try {
      // Update project status to 'in_progress' and escrow status to 'funded'
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          status: 'in_progress',
          escrow_status: 'funded',
          payment_received_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (projectError) {
        console.error('Error updating project:', projectError)
        return NextResponse.redirect(new URL('/dashboard/client?error=payment_update_failed', request.url))
      }

      // Update escrow transaction to completed
      const { error: transactionError } = await supabase
        .from('escrow_transactions')
        .update({
          status: 'completed',
          description: 'Payment completed successfully',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', sessionId)
        .eq('project_id', projectId)

      if (transactionError) {
        console.error('Error updating transaction:', transactionError)
      }

      // Get project details for notification
      const { data: project } = await supabase
        .from('projects')
        .select('*, client:profiles!client_id(full_name, email)')
        .eq('id', projectId)
        .single()

      if (project && project.freelancer_id) {
        // Create notification for freelancer
        await supabase
          .from('notifications')
          .insert({
            user_id: project.freelancer_id,
            type: 'project_started',
            title: 'Payment Received - Project Started!',
            message: `Payment has been received for "${project.title}". You can now start working on the project.`,
            link: `/dashboard/freelancer/projects/${projectId}`,
            created_at: new Date().toISOString()
          })
      }

      // Redirect to success page
      return NextResponse.redirect(new URL(`/dashboard/client/projects/${projectId}?payment=success`, request.url))
    } catch (error) {
      console.error('Payment callback error:', error)
      return NextResponse.redirect(new URL('/dashboard/client?error=payment_processing_failed', request.url))
    }
  } else {
    // Payment failed
    const { error } = await supabase
      .from('projects')
      .update({
        escrow_status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (error) {
      console.error('Error updating project status for failed payment:', error)
    }

    // Update transaction status
    await supabase
      .from('escrow_transactions')
      .update({
        status: 'failed',
        description: 'Payment failed or cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', sessionId)
      .eq('project_id', projectId)

    return NextResponse.redirect(new URL(`/dashboard/client/projects/${projectId}/payment?error=payment_failed`, request.url))
  }
}

export async function POST(request: NextRequest) {
  // Handle webhook from payment gateway
  const supabase = await createClient()

  try {
    const body = await request.json()

    // TODO: Verify webhook signature from payment gateway
    // For example with Stripe:
    // const signature = request.headers.get('stripe-signature')
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const { session_id, status, project_id, transaction_id, amount } = body

    if (!session_id || !project_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (status === 'succeeded' || status === 'completed') {
      // Update project status
      await supabase
        .from('projects')
        .update({
          status: 'in_progress',
          escrow_status: 'funded',
          payment_received_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', project_id)

      // Update transaction
      await supabase
        .from('escrow_transactions')
        .update({
          status: 'completed',
          transaction_id: transaction_id,
          description: `Payment completed. Amount: $${amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', session_id)
        .eq('project_id', project_id)

      // Get project and send notification
      const { data: project } = await supabase
        .from('projects')
        .select('*, client:profiles!client_id(full_name)')
        .eq('id', project_id)
        .single()

      if (project && project.freelancer_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: project.freelancer_id,
            type: 'project_started',
            title: 'Payment Received - Project Started!',
            message: `Payment has been received for "${project.title}". You can now start working on the project.`,
            link: `/dashboard/freelancer/projects/${project_id}`,
            created_at: new Date().toISOString()
          })
      }

      return NextResponse.json({ success: true })
    } else {
      // Handle failed payment
      await supabase
        .from('projects')
        .update({
          escrow_status: 'payment_failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', project_id)

      await supabase
        .from('escrow_transactions')
        .update({
          status: 'failed',
          description: 'Payment failed',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', session_id)
        .eq('project_id', project_id)

      return NextResponse.json({ success: false, error: 'Payment failed' })
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
