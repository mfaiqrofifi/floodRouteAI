CREATE TABLE IF NOT EXISTS flood_reports (
  id UUID PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  area TEXT NOT NULL,
  sub_area TEXT,
  water_depth_cm INTEGER NOT NULL CHECK (water_depth_cm >= 0),
  road_passable BOOLEAN NOT NULL,
  description TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  status_label TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS flood_reports_reported_at_idx
  ON flood_reports (reported_at DESC);

CREATE INDEX IF NOT EXISTS flood_reports_area_idx
  ON flood_reports (area);
