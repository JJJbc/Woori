export async function fetchProperties() {
  const res = await fetch('/api/properties');
  const data = await res.json();
  // 필요시 데이터 가공
  return data;
}