# Tiltfile for PricklyPear development

# Supabase local development
local_resource(
  'Backend(Supabase)',
  serve_cmd='supabase start & supabase functions serve --env-file ./supabase/.env',
  readiness_probe=probe(
    period_secs=5,
    http_get=http_get_action(port=54321, path='/functions/v1/health'),
  ),
  links=[
    link('http://127.0.0.1:54323', 'Supabase Studio'),
    link('http://127.0.0.1:54324', 'Mailpit'),
  ],
  labels=['Backend'],
)

# Frontend development server
local_resource(
  'Frontend (Vercel)',
  serve_cmd='bun run dev',
  readiness_probe=probe(
    period_secs=2,
    http_get=http_get_action(port=3000, path='/health'),
  ),
  links=[
    link('http://localhost:3000', 'App'),
  ],
  labels=['Frontend'],
)

