/**
 * Simple newsletter endpoint.
 * In a real app, connect this to your email provider (Klaviyo, Mailchimp, etc.).
 */
export async function action({request}) {
  const formData = await request.formData();
  const email = formData.get('email');

  if (typeof email !== 'string' || !email.trim()) {
    return new Response(
      JSON.stringify({ok: false, error: 'Email is required'}),
      {
        status: 400,
        headers: {'Content-Type': 'application/json'},
      },
    );
  }

  // TODO: send `email` to your real newsletter/email service here.
  console.log('Newsletter signup:', email);

  return new Response(JSON.stringify({ok: true}), {
    status: 200,
    headers: {'Content-Type': 'application/json'},
  });
}

export function loader() {
  return new Response(
    JSON.stringify({ok: false, error: 'Method not allowed'}),
    {
      status: 405,
      headers: {'Content-Type': 'application/json'},
    },
  );
}
