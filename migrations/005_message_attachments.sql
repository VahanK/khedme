-- Migration: Message Attachments
-- Links messages to project files for file sharing in chat

-- Create message_attachments junction table
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, file_id)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_file_id ON message_attachments(file_id);

-- Row Level Security
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments if they can see the message
CREATE POLICY "Users can view message attachments"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN conversations ON conversations.id = messages.conversation_id
      WHERE messages.id = message_attachments.message_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- Users can attach files to their own messages
CREATE POLICY "Users can create message attachments"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
    )
  );

-- Users can delete attachments from their own messages
CREATE POLICY "Users can delete their message attachments"
  ON message_attachments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
    )
  );

COMMENT ON TABLE message_attachments IS 'Links messages to project files - files shared in chat appear in project workspace';
COMMENT ON COLUMN message_attachments.message_id IS 'Reference to the message containing the file';
COMMENT ON COLUMN message_attachments.file_id IS 'Reference to the file in project_files table';
