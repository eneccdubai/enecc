-- Add property_id to reviews so each review is linked to a specific property
ALTER TABLE reviews ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

CREATE INDEX idx_reviews_property_id ON reviews(property_id);

-- Remove existing test reviews that have no property link
DELETE FROM reviews;
