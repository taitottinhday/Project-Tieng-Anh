
const http = require('http');
const querystring = require('querystring');

let sessionCookie = '';

function makeRequest(options, body = null) {
  return new Promise((resolve) => {
    if (sessionCookie && options.headers) {
      options.headers.Cookie = sessionCookie;
    }

    const req = http.request(options, (res) => {
      // Capture session cookie
      if (res.headers['set-cookie']) {
        const cookies = Array.isArray(res.headers['set-cookie']) 
          ? res.headers['set-cookie'] 
          : [res.headers['set-cookie']];
        const sessionMatch = cookies.find(c => c.includes('connect.sid'));
        if (sessionMatch) {
          sessionCookie = sessionMatch.split(';')[0];
        }
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 0, error: e.message, data: '' });
    });

    if (body) req.write(body);
    req.end();
  });
}

async function test() {
  console.log('=== TEST: Login then access Dashboard and CRUD ===\n');

  // Step 1: Get login page
  console.log('1. Getting login page...');
  let res = await makeRequest({
    hostname: 'localhost',
    port: 4207,
    path: '/login',
    method: 'GET',
    headers: {}
  });
  console.log('   Status:', res.status);

  // Step 2: Login
  console.log('\n2. Logging in with ayman/password...');
  const loginData = querystring.stringify({
    username: 'ayman',
    password: 'password'
  });

  res = await makeRequest({
    hostname: 'localhost',
    port: 4207,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': loginData.length
    }
  }, loginData);
  console.log('   Status:', res.status);
  console.log('   Session:', sessionCookie ? 'SET' : 'NOT SET');

  // Step 3: Access Dashboard
  console.log('\n3. Accessing /dashboard...');
  res = await makeRequest({
    hostname: 'localhost',
    port: 4207,
    path: '/dashboard',
    method: 'GET',
    headers: {}
  });
  console.log('   Status:', res.status);
  
  if (res.status === 200) {
    if (res.data.includes('Error:')) {
      console.log('   ERROR FOUND in page!');
      const errorMatch = res.data.match(/Error:[^<]*/);
      console.log('   ', errorMatch ? errorMatch[0] : 'Unknown error');
    } else if (res.data.includes('Subjects') || res.data.includes('Students')) {
      console.log('   SUCCESS - Page has content');
    } else {
      console.log('   WARNING - No data found');
      console.log('   Data length:', res.data.length);
    }
  }

  // Step 4: Access CRUD
  console.log('\n4. Accessing /crud...');
  res = await makeRequest({
    hostname: 'localhost',
    port: 4207,
    path: '/crud',
    method: 'GET',
    headers: {}
  });
  console.log('   Status:', res.status);
  
  if (res.status === 200) {
    if (res.data.includes('Error:')) {
      console.log('   ERROR FOUND in page!');
      const errorMatch = res.data.match(/Error:[^<]*/);
      console.log('   ', errorMatch ? errorMatch[0] : 'Unknown error');
    } else if (res.data.includes('Add New Mark') || res.data.includes('Select')) {
      console.log('   SUCCESS - Page has content');
    } else {
      console.log('   WARNING - No form found');
      console.log('   Data length:', res.data.length);
    }
  }

  console.log('\n=== TEST COMPLETE ===');
  process.exit(0);
}

setTimeout(() => test(), 500);
