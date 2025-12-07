document.addEventListener('DOMContentLoaded', () => {
    const setText = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text || 'N/A';
        }
    };

    // Fetch IP and Geolocation info from OUR OWN backend endpoint
    const getIpInfo = async () => {
        try {
            const response = await fetch('/api/getInfo'); // This calls our serverless function
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            
            setText('ip', data.ip);
            setText('country', data.country);
            setText('country_iso', data.country_iso);
            setText('state', data.state);
            setText('city', data.city);
            setText('postal', data.postal);
            setText('lat', data.lat);
            setText('lon', data.lon);
            setText('org', data.org);
            setText('isp', data.isp);
        } catch (error) {
            console.error("Fucked up fetching IP info from our API:", error);
            const ipCard = document.getElementById('ip-info');
            ipCard.innerHTML = "<h2><span class='icon'>🌐</span> Network Information</h2><p>Could not fetch network details. The backend might be having a moment.</p>";
        }
    };

    // --- All the client-side device info functions remain the same ---

    // Get OS from User Agent
    const getOS = () => {
        const userAgent = window.navigator.userAgent;
        let os = "Unknown";
        if (userAgent.indexOf("Windows NT 10.0") !== -1) os = "Windows 10/11";
        else if (userAgent.indexOf("Mac") !== -1) os = "macOS/iOS";
        else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
        setText('os', os);
    };

    // Get Device Hardware Info
    const getHardwareInfo = () => {
        setText('cpu', navigator.hardwareConcurrency || 'N/A');
        setText('ram', navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A');
    };

    // Get Battery Info
    const getBatteryInfo = async () => {
        if (!('getBattery' in navigator)) {
            return setText('battery', 'API not supported');
        }
        try {
            const battery = await navigator.getBattery();
            const update = () => setText('battery', `${Math.floor(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'})`);
            update();
            battery.addEventListener('levelchange', update);
            battery.addEventListener('chargingchange', update);
        } catch {
            setText('battery', 'Could not access');
        }
    };

    // Run all the functions
    getIpInfo();
    getOS();
    getHardwareInfo();
    getBatteryInfo();
});