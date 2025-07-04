import React, { useEffect, useRef } from 'react';

type Map2GISProps = {
    latitude: number;
    longitude: number;
    zoom?: number;
    width?: string | number;
    height?: string | number;
};

export const Map2GIS: React.FC<Map2GISProps> = ({
                                                    latitude,
                                                    longitude,
                                                    zoom = 15,
                                                    width = '100%',
                                                    height = 300,
                                                }) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);

    useEffect(() => {
        if (window.DG && mapRef.current && !mapInstance.current) {
            mapInstance.current = window.DG.map(mapRef.current, {
                center: [latitude, longitude],
                zoom,
            });

            markerInstance.current = window.DG.marker([latitude, longitude]).addTo(mapInstance.current);
        }
    }, []);

    useEffect(() => {
        if (mapInstance.current) {
            mapInstance.current.setView([latitude, longitude], zoom);
            if (markerInstance.current) {
                markerInstance.current.setLatLng([latitude, longitude]);
            }
        }
    }, [latitude, longitude, zoom]);

    return (
        <div
            ref={mapRef}
            style={{ width, height }}
        />
    );
};
