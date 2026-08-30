"use client";
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapComponentProps {
    districtsData: any[];
    selectedDistrictId: string | null;
    hoveredDistrictId: string | null;
    onDistrictClick: (districtName: string) => void;
    onDistrictHover: (districtName: string | null) => void;
}

const geojsonNameToApiName: Record<string, string> = {
    'Ahmadnagar': 'Ahmednagar',
    'Bid': 'Beed',
    'Buldana': 'Buldhana',
    'Garhchiroli': 'Gadchiroli',
    'Gondiya': 'Gondia',
    'Mumbai': 'Mumbai City',
    'Raigarh': 'Raigad'
};

function normalizeDistrictName(rawName: string | undefined): string {
    if (!rawName) return '';
    return geojsonNameToApiName[rawName] || rawName;
}

// Inner component to handle flyTo sync
function MapController({ selectedDistrictId, districtsData }: { selectedDistrictId: string | null, districtsData: any[] }) {
    const map = useMap();
    useEffect(() => {
        if (selectedDistrictId) {
            const district = districtsData.find(d => d.district_name === selectedDistrictId);
            if (district && district.lat && district.lng) {
                map.flyTo([district.lat, district.lng], 8, { duration: 1.5 });
            }
        }
    }, [selectedDistrictId, districtsData, map]);
    return null;
}

export default function MapComponent({ 
    districtsData, 
    selectedDistrictId, 
    hoveredDistrictId, 
    onDistrictClick, 
    onDistrictHover 
}: MapComponentProps) {
    const [geoData, setGeoData] = useState<any>(null);
    const geoJsonRef = useRef<any>(null);

    useEffect(() => {
        fetch('/maharashtra.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Error loading geojson", err));
    }, []);

    useEffect(() => {
        if (geoJsonRef.current) {
            geoJsonRef.current.eachLayer((layer: any) => {
                const rawName = layer.feature.properties.dtname || layer.feature.properties.NAME_2 || layer.feature.properties.name || layer.feature.properties.district;
                const districtName = normalizeDistrictName(rawName);
                
                let isSelected = selectedDistrictId === districtName;
                let isHovered = hoveredDistrictId === districtName;
                
                if (isSelected || isHovered) {
                    layer.setStyle({
                        weight: isSelected ? 3 : 2,
                        color: isSelected ? '#111827' : '#4b5563',
                        fillOpacity: 0.9,
                        dashArray: ''
                    });
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }
                } else {
                    geoJsonRef.current.resetStyle(layer);
                }
            });
        }
    }, [selectedDistrictId, hoveredDistrictId, districtsData]);

    if (!geoData) {
        return <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-50 animate-pulse rounded-xl">Loading map geometry...</div>;
    }

    const getColor = (severity: string) => {
        if (severity === 'BALANCED') return '#22c55e'; // Green
        if (severity === 'HIGH') return '#ef4444'; // Red
        if (severity === 'MODERATE') return '#eab308'; // Yellow
        return '#cbd5e1'; // Gray
    };

    const getDistrictStyle = (feature: any) => {
        const rawName = feature.properties.dtname || feature.properties.NAME_2 || feature.properties.name || feature.properties.district;
        const districtName = normalizeDistrictName(rawName);
        const match = districtsData.find(d => 
            d.district_name.toLowerCase() === districtName.toLowerCase()
        );

        if (match) {
            return {
                fillColor: getColor(match.severity_level),
                weight: 1,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        return {
            fillColor: '#cbd5e1',
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.4
        };
    };

    const onEachFeature = (feature: any, layer: any) => {
        const rawName = feature.properties.dtname || feature.properties.NAME_2 || feature.properties.name || feature.properties.district;
        const districtName = normalizeDistrictName(rawName);
        
        layer.on({
            mouseover: () => onDistrictHover(districtName),
            mouseout: () => onDistrictHover(null),
            click: () => onDistrictClick(districtName)
        });
        
        // Add tooltip
        const match = districtsData.find(d => d.district_name.toLowerCase() === districtName.toLowerCase());
        if (match) {
            layer.bindTooltip(`<b>${match.district_name}</b><br>Gap Score: ${match.gap_score}<br>Severity: ${match.severity_level}`, { sticky: true });
        } else {
            layer.bindTooltip(`<b>${districtName}</b>`, { sticky: true });
        }
    };

    return (
        <MapContainer center={[19.7515, 75.7139]} zoom={6} className="w-full h-full z-0" style={{ background: 'transparent' }}>
            <MapController selectedDistrictId={selectedDistrictId} districtsData={districtsData} />
            <GeoJSON 
                key={districtsData.length} // Force re-render on data change to update popups/styles
                data={geoData} 
                style={getDistrictStyle} 
                onEachFeature={onEachFeature} 
                ref={geoJsonRef}
            />
        </MapContainer>
    );
}
