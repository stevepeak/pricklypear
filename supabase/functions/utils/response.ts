import { getErrorMessage, handleError } from './handle-error.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function createResponse(args: {
  data: Record<string, unknown>;
  status?: number;
}): Response {
  const { data, status = 200 } = args;
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export const res = {
  ok: (data: Record<string, unknown>) => createResponse({ data }),
  badRequest: (message: string) =>
    createResponse({
      data: { error: message },
      status: 400,
    }),
  unauthorized: (message: string = 'Unauthorized') =>
    createResponse({
      data: { error: message },
      status: 401,
    }),
  forbidden: (message: string = 'Forbidden') =>
    createResponse({
      data: { error: message },
      status: 403,
    }),
  notFound: (message: string = 'Not found') =>
    createResponse({
      data: { error: message },
      status: 404,
    }),
  serverError: (err: unknown) => {
    handleError(err);
    return createResponse({
      data: { error: getErrorMessage(err) },
      status: 500,
    });
  },
  custom: (data: Record<string, unknown>, status: number) =>
    createResponse({ data, status }),
  cors: () => new Response(null, { headers: corsHeaders }),
};

export { corsHeaders };
