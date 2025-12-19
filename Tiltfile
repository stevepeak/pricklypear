# Tiltfile for PricklyPear development

# Supabase local development
local_resource(
  'Supabase',
  serve_cmd='supabase start && tail -f /dev/null',
  readiness_probe=probe(
    period_secs=5,
    http_get=http_get_action(port=54323, path='/'),
  ),
  links=[
    link('http://127.0.0.1:54323', 'Supabase Studio'),
    link('http://127.0.0.1:54324', 'Mailpit'),
  ],
  labels=['Supabase'],
)

local_resource(
  'Functions',
  serve_cmd='supabase functions serve --env-file ./supabase/.env',
  readiness_probe=probe(
    period_secs=5,
    http_get=http_get_action(port=54321, path='/functions/v1/health'),
  ),
  labels=['Supabase'],
)

# Frontend development server
local_resource(
  'Web',
  serve_cmd='bun run dev',
  links=[ link('http://localhost:3000', 'App') ],
  labels=['Frontend'],
)

