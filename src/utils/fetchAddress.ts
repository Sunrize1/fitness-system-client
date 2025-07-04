export const fetchAddress = async (latitude, longitude) => {
    try {
        const res = await fetch(
            'https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: 'Token 3a8eb01fe2aafe76a2e9a78915573215025b8d07',
                },
                body: JSON.stringify({
                    lat: latitude,
                    lon: longitude,
                    radius_meters: 100,
                }),
            }
        );
        const data = await res.json();
        const fullAddress = data.suggestions?.[0]?.value;
        return fullAddress || null
    } catch {
        return null
    }
}