export async function GET() {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return new Response(JSON.stringify({
      message: 'Received your data',
      receivedData: body
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      message: 'Error processing request',
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
