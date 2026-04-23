import fetch from "node-fetch";

async function test() {
  const res = await fetch('https://script.google.com/macros/s/AKfycbxs7EcJ2vxsK9mf2PtOWK450tOQXmGuZSAoSr9zLdiGo5dBhJAJ_FHWJZkDCU9mffUE/exec', {
    method: 'POST',
    body: JSON.stringify({action:'login', email:'b@gmail.com', password:'123'}),
    headers: {'Content-Type': 'text/plain;charset=utf-8'}
  });
  console.log(await res.text());
}
test();
