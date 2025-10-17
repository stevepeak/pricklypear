-- Create storage buckets for documents and threads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('threads', 'threads', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

