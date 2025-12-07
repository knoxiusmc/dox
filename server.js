import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
// Render sets the PORT environment variable. Fucking use it.
const PORT = process.env.PORT || 3000;

// ES module bullshit to get __dirname working
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve all the static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Our glorious API endpoint
app.get('/api/getInfo', async (req, res) => {
    // Render, like Vercel, uses this header for the real IP.
    // 'x-forwarded-for' is the standard for proxies.
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim();

    if (!ip || ip === '::1') {
        return res.status(400).json({ error: "Could not determine a valid public IP address." });
    }

    try {
        // Call the third-party API with the IP we grabbed
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!geoResponse.ok) {
            throw new Error(`External API shat the bed with status: ${geoResponse.status}`);
        }
        const geoData = await geoResponse.json();

        // Send the complete data back to the frontend
        res.status(200).json({
            ip: geoData.ip,
            country: geoData.country_name,
            country_iso: geoData.country_code,
            state: geoData.region,
            city: geoData.city,
            postal: geoData.postal,
            lat: geoData.latitude,
            lon: geoData.longitude,
            org: geoData.org,
            isp: geoData.org,
        });
    } catch (error) {
        console.error("API endpoint failed:", error.message);
        res.status(500).json({ error: "Failed to fetch geolocation data." });
    }
});

// A catch-all to serve the index.html for any other route (good for SPAs, but works here too)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running like a goddamn champ on port ${PORT}`);
});