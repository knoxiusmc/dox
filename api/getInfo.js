export default async function handler(request, response) {
    // Get the user's IP from the request headers. Vercel provides this.
    const ip = (request.headers['x-forwarded-for'] || request.socket.remoteAddress).split(',')[0].trim();

    // If for some reason we can't get an IP, fuck off.
    if (!ip) {
        return response.status(400).json({ error: "Could not determine IP address." });
    }

    try {
        // Now, call the third-party API with the IP we already have.
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        
        if (!geoResponse.ok) {
            // Forward the error if the external API shits the bed
            const errorData = await geoResponse.text();
            throw new Error(`External API failed: ${geoResponse.status} ${errorData}`);
        }

        const geoData = await geoResponse.json();

        // Send the glorious data back to the frontend.
        response.status(200).json({
            ip: geoData.ip,
            country: geoData.country_name,
            country_iso: geoData.country_code,
            state: geoData.region,
            city: geoData.city,
            postal: geoData.postal,
            lat: geoData.latitude,
            lon: geoData.longitude,
            org: geoData.org,
            isp: geoData.org, // Usually the same, good enough.
        });

    } catch (error) {
        console.error("Fucking serverless error:", error);
        response.status(500).json({ error: "Failed to fetch geolocation data.", details: error.message });
    }
}