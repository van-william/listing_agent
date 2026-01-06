Chicago Neighborhoods vs Community Areas

Chicago has 77 official Community Areas (static, numbered zones) and about 200+ Neighborhoods (informal, commonly-used names like Wicker Park or Lincoln Park). Community areas are official planning units, but most residents and realtors refer to neighborhoods. The City of Chicago publishes both boundary datasets. The “Boundaries – Neighborhoods” dataset (created by the Office of Tourism) provides approximate polygon shapes for named neighborhoods
catalog.data.gov
. The “Boundaries – Community Areas” dataset provides the official 77 zones (e.g. “Lincoln Park” is Community Area 22; “Wicker Park” lies within West Town CA 24)
catalog.data.gov
. In practice, since you want granular names (Wicker Park, etc.), use the Neighborhoods boundaries. (Neighborhood names are not official, but the dataset is public and widely used
catalog.data.gov
.)

Importing Boundaries into Supabase/PostGIS

Enable the PostGIS extension in your Supabase database (e.g. via the Dashboard or CREATE EXTENSION postgis;). Then create a table for the neighborhood polygons, for example:

-- Enable PostGIS (if not already)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create a table for Chicago neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  geom       GEOMETRY(MultiPolygon, 4326) NOT NULL
);

-- Optional: index on the geometry for faster spatial queries
CREATE INDEX neighborhoods_geom_gist ON neighborhoods USING GIST (geom);


To populate this table, download the City’s Neighborhoods shapefile from the Chicago Data Portal. The official zip can be found at the City’s portal (via Catalog/data.gov), or by Socrata API (dataset ID bbvz-uum9). Unzip and convert it to WGS84 (EPSG:4326) if needed. For example, using GDAL’s ogr2ogr and shp2pgsql (as shown in Chicago GIS blogs
kevfoo.com
):

# Suppose we have Neighborhoods.shp in NAD83 StatePlane (EPSG:102671).
# Reproject to WGS84:
ogr2ogr -f "ESRI Shapefile" -s_srs "EPSG:102671" -t_srs "EPSG:4326" neighborhoods4326.shp Neighborhoods.shp

# Convert shapefile to SQL
shp2pgsql -s 4326 -I -W UTF-8 neighborhoods4326.shp public.neighborhoods > neighborhoods.sql

# Then run this SQL in psql or Supabase SQL editor:
psql -d your_db_name -f neighborhoods.sql


This will insert each polygon into the neighborhoods table with a geom column in SRID 4326
kevfoo.com
. (Alternatively, you can use ST_GeomFromGeoJSON in an INSERT if working from GeoJSON.) You may also create a view that returns GeoJSON for use in API:

CREATE VIEW neighborhood_geojson AS
SELECT id, name, ST_AsGeoJSON(geom)::json AS geometry
FROM neighborhoods;


A periodic sync can be scripted (e.g. nightly) by re-downloading the source shapefile/KMZ and re-running an UPSERT or replacement of the table.

Matching Listings to Neighborhoods

When a listing comes in, if its neighborhood is missing or untrusted, you can derive it by location. If the MLS data provides latitude/longitude (or you geocode the address), use a spatial query. For example, assuming your listings table has latitude and longitude columns:

-- Example: update a listing’s neighborhood by spatial containment
UPDATE listings
SET neighborhood = n.name
FROM neighborhoods AS n
WHERE ST_Contains(n.geom,
      ST_SetSRID(ST_Point(listings.longitude, listings.latitude), 4326)
);


This uses PostGIS’s ST_Contains to find which polygon contains the point
kevfoo.com
. (Reverse the order if using geography or different SRID.) You could wrap this in a trigger or a function on insert/update of listings. For instance, in SQL:

CREATE OR REPLACE FUNCTION assign_neighborhood() RETURNS trigger AS $$
BEGIN
  UPDATE listings
  SET neighborhood = n.name
  FROM neighborhoods AS n
  WHERE ST_Contains(n.geom,
        ST_SetSRID(ST_Point(NEW.longitude, NEW.latitude), 4326)
      )
    AND listings.id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_set_neighborhood
AFTER INSERT OR UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION assign_neighborhood();


This ensures new or updated listings get a neighborhood name if within one of our polygons. (If a listing’s coords fall outside all polygons, the field remains null.)

Next.js Frontend: Displaying Neighborhoods with Mapbox

On the client, use Mapbox GL JS (or a React wrapper) to draw neighborhood boundaries. A common pattern is: fetch the GeoJSON from your backend (either a Supabase Edge Function or a REST API) and addSource/addLayer to the map. For example:

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Make sure to set your Mapbox token in env: NEXT_PUBLIC_MAPBOX_TOKEN
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function NeighborhoodMap() {
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-87.65, 41.87], // Chicago center
      zoom: 10
    });

    map.on('load', async () => {
      // Fetch GeoJSON (from Supabase or an API route)
      const res = await fetch('/api/neighborhoods'); // see below for API example
      const data = await res.json();
      // Add as a source
      map.addSource('neighborhoods', {
        type: 'geojson',
        data: data
      });
      // Fill layer
      map.addLayer({
        id: 'neighborhood-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.1
        }
      });
      // Outline layer
      map.addLayer({
        id: 'neighborhood-outline',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': '#0044aa',
          'line-width': 2
        }
      });
    });
  }, []);

  return <div id="map-container" style={{ width: '100%', height: '500px' }} />;
}


In this example, we fetch all neighborhoods as GeoJSON and add a filled polygon and outline layer. This follows the Mapbox pattern of using addSource and addLayer with a GeoJSON source
docs.mapbox.com
. Adjust colors and opacity as needed. In production, you might fetch only visible features (using bounding-box queries) for performance, but for a city-wide layer this is usually fine.

Exposing Neighborhood Data to the Frontend

You have two main options:

Direct Supabase Query (Client-side): Use @supabase/supabase-js in a React component to fetch from the neighborhoods table or view. For example:

const { data, error } = await supabase
  .from('neighborhood_geojson')
  .select('id, name, geometry');


Here geometry contains GeoJSON text. (Supabase returns the view rows as JSON, so ensure RLS allows anon access or create a service-role Edge function to proxy it.)

Supabase Edge Function / Next.js API Route: Write a serverless function that uses the service role key to query the DB and return GeoJSON. For instance, an API route /api/neighborhoods in Next.js:

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('neighborhood_geojson')
    .select('id, name, geometry');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  // The view returns rows like {id, name, geometry: {...} }
  // We can combine into one FeatureCollection if desired:
  const features = (data || []).map((row: any) => ({
    type: 'Feature',
    properties: { id: row.id, name: row.name },
    geometry: row.geometry
  }));
  res.status(200).json({ type: 'FeatureCollection', features });
}


This edge/API route returns a GeoJSON FeatureCollection of all neighborhoods, which the frontend map code can fetch and add to the map. Using an Edge function (Supabase or Next.js) ensures you can use the service role key (bypass RLS) and format geometry via ST_AsGeoJSON.

Both approaches work; the Edge-function/API approach gives you more control (e.g. filtering by bounding box or on-demand loading). If exposing raw tables, remember to configure Row-Level Security or policies so that client queries only get the intended columns.

Example SQL Scripts for Supabase

For completeness, here’s a minimal script you could run in the Supabase SQL editor or psql to set up neighborhoods:

-- Enable PostGIS (if not done already)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create table
DROP TABLE IF EXISTS public.neighborhoods;
CREATE TABLE public.neighborhoods (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  the_geom   GEOMETRY(MULTIPOLYGON, 4326) NOT NULL
);

-- (Optionally, add additional columns like a slug, community area ID, etc.)
ALTER TABLE public.neighborhoods ADD COLUMN slug TEXT;
CREATE INDEX ON public.neighborhoods USING GIST(the_geom);

-- Example insert (if loading manually)
INSERT INTO public.neighborhoods (name, slug, the_geom)
VALUES 
  ('Lincoln Park', 'lincoln-park',
   ST_GeomFromText(
     'MULTIPOLYGON(((-87.65 41.93, -87.64 41.93, -87.64 41.91, -87.65 41.91, -87.65 41.93)))',
     4326));
-- (Repeat for each polygon, or use shp2pgsql output instead)


You would normally import all polygons via the shapefile approach above rather than manual INSERTs. After loading, you can verify with a query such as:

-- Example query: which neighborhood contains Millennium Park?
SELECT name 
FROM neighborhoods
WHERE ST_Contains(the_geom, ST_SetSRID(ST_Point(-87.6226, 41.8827), 4326));
-- (This should return something like 'Loop' if Loop is in dataset)

References

Official Chicago datasets: “Boundaries – Neighborhoods” (Office of Tourism, approximate boundaries; names not official)
catalog.data.gov
 and “Boundaries – Community Areas” (official 77 areas)
catalog.data.gov
.

Example of loading a Chicago shapefile into PostGIS with ogr2ogr/shp2pgsql
kevfoo.com
.

Example of spatially querying with PostGIS ST_Contains (point-in-polygon)
kevfoo.com
.

Mapbox GL JS example: adding a GeoJSON polygon source and fill layer
docs.mapbox.com
 (our code follows the same pattern).

Sources