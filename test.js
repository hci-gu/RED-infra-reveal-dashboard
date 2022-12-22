const NodeGeocoder = require('node-geocoder')
const fs = require('fs')
const options = {
  provider: 'openstreetmap',
}

const geocoder = NodeGeocoder(options)
const geoCode = (city) => {
  return geocoder.geocode(city).then((res) => {
    const coordinates = [res[0].longitude, res[0].latitude]
    return coordinates
  })
}

const run = async () => {
  const text = fs.readFileSync('cloudflare.txt', 'utf8')
  const cities = text.split('\n').filter((city) => city)

  let data = []
  for (const city of cities) {
    // Fetch the coordinates for the city
    const coords = await geoCode(city)

    // Add the coordinates to the object
    data.push({
      city,
      coordinates: coords,
      type: 'cloudflare',
    })

    // Write the object to a JSON file
    fs.writeFileSync('coordinates.json', JSON.stringify(data))

    // Print the coordinates for the city
    console.log(`${city}: ${coords[0]}, ${coords[1]}`)
  }
}

run()
