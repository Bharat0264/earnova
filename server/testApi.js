import fetch from 'node-fetch'

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/products?limit=5')
    const data = await res.json()
    console.log('API Response:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Error:', err.message)
  }
}

test()
