-- Index to efficiently support county+type filtering and distinct-type lookups
CREATE INDEX IF NOT EXISTS idx_permits_county_type
  ON permits (county, permit_type);

-- RPC: return distinct permit_type values, optionally scoped to a county
CREATE OR REPLACE FUNCTION get_permit_types(p_county text DEFAULT NULL)
RETURNS TABLE (permit_type text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT p.permit_type
  FROM permits p
  WHERE
    p.permit_type IS NOT NULL
    AND (p_county IS NULL OR p.county = p_county)
  ORDER BY p.permit_type;
$$;
