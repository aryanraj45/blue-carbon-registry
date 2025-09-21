const express = require('express');
const router = express.Router();
const ee = require('@google/earthengine');

router.get('/image', (req, res) => {
    console.log('--- Received request for satellite image ---');
    
    try {
        // Using hardcoded, known-good coordinates for India Gate to isolate the issue.
        const point = ee.Geometry.Point(77.2295, 28.6129); 
        console.log('1. Created GEE Geometry Point.');

        const imageCollection = ee.ImageCollection('COPERNICUS/S2_SR')
            .filterBounds(point)
            .filterDate('2024-01-01', '2025-09-08') // A very wide date range
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30));
        console.log('2. Defined Image Collection with filters.');

        imageCollection.size().evaluate((count, error) => {
            if (error) {
                console.error('ERROR during size evaluation:', error);
                return res.status(500).json({ error: 'Error checking image collection size.' });
            }
            console.log(`3. Found ${count} images in the collection.`);

            if (count === 0) {
                return res.status(404).json({ error: 'No images found for the hardcoded location.' });
            }

            const image = imageCollection.mosaic();
            console.log('4. Created mosaic from the collection.');

            const visParams = { bands: ['B4', 'B3', 'B2'], min: 0, max: 3000, gamma: 1.4 };

            image.getMapId(visParams, (mapId, mapIdError) => {
                console.log('5. Inside getMapId callback.');

                if (mapIdError) {
                    // Log the raw error object from GEE
                    console.error('CRITICAL: getMapId returned an error:', mapIdError);
                    return res.status(500).json({ error: 'getMapId callback returned an error.' });
                }

                if (!mapId || !mapId.tile_fetcher) {
                    console.error('CRITICAL: mapId or tile_fetcher is invalid. Full mapId object:', mapId);
                    return res.status(500).json({ error: 'Received invalid map data from GEE.' });
                }

                console.log('6. Success! MapId received. Sending URL to front-end.');
                res.json({ imageUrl: mapId.tile_fetcher.url_format });
            });
        });

    } catch (error) {
        console.error('FATAL: A synchronous error occurred:', error);
        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

module.exports = router;