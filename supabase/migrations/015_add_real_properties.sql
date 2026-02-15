-- Migration 015: Add 5 real properties with Supabase Storage images
-- Property details (description, price, amenities) are placeholders — admin will update via dashboard

DO $$
DECLARE
  base_url TEXT := 'https://grmsqbcyzgonwvbmoeex.supabase.co/storage/v1/object/public/property-images';
BEGIN

-- 1. 413 Myrtle
INSERT INTO properties (
  name, description, location, bedrooms, bathrooms, max_guests,
  price_per_night, images, amenities, available, show_in_landing
) VALUES (
  '413 Myrtle',
  'Modern apartment with stylish interiors, fully equipped kitchen, and city views from a private balcony.',
  'Dubai',
  1, 1, 2,
  200,
  jsonb_build_array(
    base_url || '/413-myrtle/413-myrtle-01.webp',
    base_url || '/413-myrtle/413-myrtle-02.webp',
    base_url || '/413-myrtle/413-myrtle-03.webp',
    base_url || '/413-myrtle/413-myrtle-04.webp',
    base_url || '/413-myrtle/413-myrtle-05.webp',
    base_url || '/413-myrtle/413-myrtle-06.webp',
    base_url || '/413-myrtle/413-myrtle-07.webp',
    base_url || '/413-myrtle/413-myrtle-08.webp',
    base_url || '/413-myrtle/413-myrtle-09.webp',
    base_url || '/413-myrtle/413-myrtle-10.webp'
  ),
  '["WiFi", "Air Conditioning", "Smart TV", "Kitchen", "Balcony"]'::jsonb,
  true,
  true
);

-- 2. 1303
INSERT INTO properties (
  name, description, location, bedrooms, bathrooms, max_guests,
  price_per_night, images, amenities, available, show_in_landing
) VALUES (
  '1303',
  'Elegant high-rise apartment with panoramic sunset views and premium finishes throughout.',
  'Dubai',
  1, 1, 2,
  200,
  jsonb_build_array(
    base_url || '/1303/1303-01.webp',
    base_url || '/1303/1303-02.webp',
    base_url || '/1303/1303-03.webp',
    base_url || '/1303/1303-04.webp',
    base_url || '/1303/1303-05.webp',
    base_url || '/1303/1303-06.webp',
    base_url || '/1303/1303-07.webp',
    base_url || '/1303/1303-08.webp',
    base_url || '/1303/1303-09.webp',
    base_url || '/1303/1303-10.webp'
  ),
  '["WiFi", "Air Conditioning", "Smart TV", "Kitchen", "Balcony"]'::jsonb,
  true,
  true
);

-- 3. 2205
INSERT INTO properties (
  name, description, location, bedrooms, bathrooms, max_guests,
  price_per_night, images, amenities, available, show_in_landing
) VALUES (
  '2205',
  'Luxury apartment with stunning Burj Khalifa views, open-plan living, and designer interiors.',
  'Dubai',
  1, 1, 2,
  200,
  jsonb_build_array(
    base_url || '/2205/2205-01.webp',
    base_url || '/2205/2205-02.webp',
    base_url || '/2205/2205-03.webp',
    base_url || '/2205/2205-04.webp',
    base_url || '/2205/2205-05.webp',
    base_url || '/2205/2205-06.webp',
    base_url || '/2205/2205-07.webp',
    base_url || '/2205/2205-08.webp',
    base_url || '/2205/2205-09.webp',
    base_url || '/2205/2205-10.webp'
  ),
  '["WiFi", "Air Conditioning", "Smart TV", "Kitchen", "Balcony"]'::jsonb,
  true,
  true
);

-- 4. Act Two
INSERT INTO properties (
  name, description, location, bedrooms, bathrooms, max_guests,
  price_per_night, images, amenities, available, show_in_landing
) VALUES (
  'Act Two',
  'Sophisticated apartment with contemporary design, herringbone floors, and elegant dining area.',
  'Dubai',
  1, 1, 2,
  200,
  jsonb_build_array(
    base_url || '/act-two/act-two-01.webp',
    base_url || '/act-two/act-two-02.webp',
    base_url || '/act-two/act-two-03.webp',
    base_url || '/act-two/act-two-04.webp',
    base_url || '/act-two/act-two-05.webp',
    base_url || '/act-two/act-two-06.webp',
    base_url || '/act-two/act-two-07.webp',
    base_url || '/act-two/act-two-08.webp',
    base_url || '/act-two/act-two-09.webp',
    base_url || '/act-two/act-two-10.webp'
  ),
  '["WiFi", "Air Conditioning", "Smart TV", "Kitchen", "Balcony"]'::jsonb,
  true,
  true
);

-- 5. The Residence 5
INSERT INTO properties (
  name, description, location, bedrooms, bathrooms, max_guests,
  price_per_night, images, amenities, available, show_in_landing
) VALUES (
  'The Residence 5',
  'Bright and airy residence with natural light, modern furnishings, and a welcoming atmosphere.',
  'Dubai',
  1, 1, 2,
  200,
  jsonb_build_array(
    base_url || '/the-residence-5/the-residence-5-01.webp',
    base_url || '/the-residence-5/the-residence-5-02.webp',
    base_url || '/the-residence-5/the-residence-5-03.webp',
    base_url || '/the-residence-5/the-residence-5-04.webp',
    base_url || '/the-residence-5/the-residence-5-05.webp',
    base_url || '/the-residence-5/the-residence-5-06.webp',
    base_url || '/the-residence-5/the-residence-5-07.webp',
    base_url || '/the-residence-5/the-residence-5-08.webp',
    base_url || '/the-residence-5/the-residence-5-09.webp',
    base_url || '/the-residence-5/the-residence-5-10.webp'
  ),
  '["WiFi", "Air Conditioning", "Smart TV", "Kitchen", "Balcony"]'::jsonb,
  true,
  true
);

END $$;

-- Verification
DO $$
DECLARE
  prop_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO prop_count FROM properties WHERE available = true;
  RAISE NOTICE '✅ 5 real properties added. Total available: %', prop_count;
END $$;
