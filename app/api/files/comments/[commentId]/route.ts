import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateFileComment, deleteFileComment } from '@/utils/database/files'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existingComment, error: commentError } = await supabase
      .from('file_comments')
      .select('user_id')
      .eq('id', params.commentId)
      .single()

    if (commentError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { comment } = body

    if (!comment || comment.trim() === '') {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    const updatedComment = await updateFileComment(params.commentId, comment.trim())

    return NextResponse.json({ comment: updatedComment })
  } catch (error: any) {
    console.error('Error updating file comment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existingComment, error: commentError } = await supabase
      .from('file_comments')
      .select('user_id')
      .eq('id', params.commentId)
      .single()

    if (commentError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    await deleteFileComment(params.commentId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting file comment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
