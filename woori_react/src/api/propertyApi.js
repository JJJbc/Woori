export async function fetchProperties() {
  const res = await fetch('/api/properties');
  const data = await res.json();
 
  return data;
}