export async function fetchOffersFromAPI() {
  try {
    const res = await fetch("https://your-api.com/offers"); // placeholder
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    throw err; // allow UI to detect API failure
  }
}
