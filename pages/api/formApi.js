import cities from "../../assets/cites.json";

export default function handler(req, res) {
  if (req.method !== "POST") {
    const filteredCities = cities.filter((city) => city.population > 50000);
    const sortedCities = filteredCities
      .sort((a, b) => b.population - a.population)
      .sort((a, b) => (a.city > b.city ? 1 : -1));
    res.status(200).json(sortedCities);
  }
  if (req.method === "POST") {
    res.status(200).send({ message: "success" });
    return;
  }
}
