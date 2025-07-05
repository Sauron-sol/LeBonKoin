import { NextRequest, NextResponse } from 'next/server'

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // En-têtes CORS et ngrok
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning',
      'Content-Type': 'application/json',
    }

    const body = await request.json()
    console.log('Données reçues Self:', body)

    // Format de réponse exact attendu par Self SDK
    const response = {
      status: 'success',
      result: true,
      credentialSubject: {
        nationality: 'FR',
        name: ['Jean', 'Dupont'],
        olderThan: '18',
        ofac: true
      },
      userData: {
        userIdentifier: body.userContextData || 'default-user',
        userDefinedData: 'lebonkoin-user'
      }
    }

    console.log('Réponse Self envoyée:', response)

    return NextResponse.json(response, { status: 200, headers })

  } catch (error) {
    console.error('Erreur API Self:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        result: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      }
    )
  }
}

export async function GET(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  return NextResponse.json(
    {
      status: 'API Self opérationnelle',
      endpoint: '/api/verify-self',
      methods: ['POST'],
      scope: 'lebonkoin-marketplace'
    },
    { status: 200, headers }
  )
} 