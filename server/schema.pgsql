DROP TABLE IF EXISTS point CASCADE;
DROP TABLE IF EXISTS recording CASCADE;
DROP FUNCTION start_recording;
DROP PROCEDURE insert_point;


CREATE TABLE recording (
    recording_id SERIAL PRIMARY KEY,
    line VARCHAR NOT NULL
);

CREATE TABLE point (
    point_id SERIAL PRIMARY KEY,
    recording_id INT NOT NULL,
    lat NUMERIC,
    lon NUMERIC,
    heading NUMERIC,
    insert_time TIMESTAMP,
    FOREIGN KEY(recording_id) REFERENCES recording(recording_id)
);


CREATE OR REPLACE FUNCTION start_recording (line VARCHAR) RETURNS INT AS $$
    INSERT INTO recording (line) VALUES (line) RETURNING recording_id
$$ LANGUAGE SQL;



CREATE OR REPLACE PROCEDURE insert_point(recording_id INT, lat NUMERIC, lon NUMERIC, heading NUMERIC)
LANGUAGE SQL
AS $$
  INSERT INTO point (recording_id, lat, lon, heading, insert_time) VALUES (recording_id, lat, lon, heading, CURRENT_TIMESTAMP);
$$;

CREATE OR REPLACE VIEW recording_list AS
SELECT
    recording.recording_id,
    recording.line,
    MIN(point.insert_time) as start_time
FROM recording
LEFT JOIN point on recording.recording_id = point.recording_id
GROUP BY recording.recording_id
ORDER BY start_time DESC;


