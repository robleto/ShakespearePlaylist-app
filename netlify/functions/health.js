exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Game Awards API is running on Netlify Functions'
    })
  };
};
