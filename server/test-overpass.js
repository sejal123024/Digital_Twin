const MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];

async function testMirrors() {
  const query = `[out:json][timeout:15];
  (
    node["amenity"~"hospital|police|fire_station"](19.26,72.83,19.31,72.88);
  );
  out body;`;

  for (const mirror of MIRRORS) {
    console.log('Testing mirror:', mirror);
    try {
      const res = await fetch(mirror + '?data=' + encodeURIComponent(query), {
        headers: { 'User-Agent': 'MiraRoadDigitalTwin/1.0' }
      });
      console.log('Status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Success! Found:', data.elements.length, 'facilities');
        console.log('First facility:', data.elements[0]?.tags?.name, data.elements[0]?.tags?.amenity);
        return;
      }
    } catch(e) {
      console.log('Failed:', e.message);
    }
  }
}
testMirrors();
