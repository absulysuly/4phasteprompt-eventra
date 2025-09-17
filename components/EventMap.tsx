import React, { useEffect, useRef } from 'react';
import type { Language } from '../types';

declare const L: any; // Assuming Leaflet is loaded via a script tag in index.html

interface EventMapProps {
    coordinates: { lat: number; lon: number };
    venueName: string;
    lang: Language;
}

export const EventMap: React.FC<EventMapProps> = ({ coordinates, venueName, lang }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    const t = {
        navigate: { en: 'Navigate', ar: 'اذهب', ku: 'بڕۆ' }
    };

    useEffect(() => {
        if (typeof L === 'undefined' || !mapContainerRef.current) {
            console.error("Leaflet is not loaded or map container is not available.");
            return;
        }

        // Initialize map only once
        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current).setView([coordinates.lat, coordinates.lon], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapRef.current);
        } else {
            // If map exists, just update its view
            mapRef.current.setView([coordinates.lat, coordinates.lon], 15);
        }

        // Clear previous markers
        mapRef.current.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
                mapRef.current.removeLayer(layer);
            }
        });

        const navigateUrl = `https://www.openstreetmap.org/directions?to=${coordinates.lat},${coordinates.lon}`;
        const popupContent = `
            <div class="text-center font-sans">
                <p class="font-bold">${venueName}</p>
                <a href="${navigateUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${t.navigate[lang]}</a>
            </div>
        `;

        L.marker([coordinates.lat, coordinates.lon]).addTo(mapRef.current)
            .bindPopup(popupContent)
            .openPopup();

    }, [coordinates, venueName, lang]);

    return <div ref={mapContainerRef} className="h-64 w-full rounded-lg z-0" />;
};
