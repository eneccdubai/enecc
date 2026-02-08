-- Migration 009: Add test properties in Dubai + update existing property images
-- Run this in Supabase Dashboard → SQL Editor

-- 1. INSERT 3 luxury test properties in Dubai

INSERT INTO properties (
  name, description, location, bedrooms, bathrooms, max_guests,
  price_per_night, images, amenities, available, show_in_landing
) VALUES
(
  'Marina Skyline Penthouse',
  'Stunning penthouse in Dubai Marina with panoramic views of the skyline and sea. Floor-to-ceiling windows, private terrace, and world-class amenities. Walking distance to Marina Walk, JBR Beach, and Dubai Marina Mall.',
  'Dubai Marina, Dubai',
  3, 3, 6,
  450,
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"]'::jsonb,
  '["WiFi", "Pool", "Gym", "Parking", "Sea View", "Balcony", "Air Conditioning", "Smart TV", "Dishwasher", "Washer/Dryer"]'::jsonb,
  true,
  true
),
(
  'Palm Jumeirah Beachfront Villa',
  'Exclusive beachfront villa on Palm Jumeirah with private beach access and infinity pool. Luxuriously furnished with marble floors, designer furniture, and state-of-the-art kitchen. Perfect for families seeking the ultimate Dubai experience.',
  'Palm Jumeirah, Dubai',
  4, 4, 8,
  800,
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200"]'::jsonb,
  '["WiFi", "Private Pool", "Private Beach", "Gym", "Parking", "Sea View", "Garden", "BBQ", "Air Conditioning", "Smart Home", "Chef Kitchen", "Washer/Dryer"]'::jsonb,
  true,
  true
),
(
  'Downtown Burj Khalifa View Apartment',
  'Modern luxury apartment in Downtown Dubai with breathtaking views of Burj Khalifa and Dubai Fountain. Premium finishes throughout, open-plan living, and access to world-class building amenities. Steps away from Dubai Mall and Souk Al Bahar.',
  'Downtown Dubai, Dubai',
  2, 2, 4,
  350,
  '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200"]'::jsonb,
  '["WiFi", "Pool", "Gym", "Parking", "Burj Khalifa View", "Balcony", "Air Conditioning", "Smart TV", "Concierge", "Washer/Dryer"]'::jsonb,
  true,
  true
);

-- 2. UPDATE images of the first existing property (oldest by created_at) to better Unsplash photos
UPDATE properties
SET images = '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200"]'::jsonb
WHERE id = (SELECT id FROM properties ORDER BY created_at ASC LIMIT 1);

-- Verification message
DO $$
DECLARE
  prop_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO prop_count FROM properties WHERE available = true;
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Test properties added successfully!';
  RAISE NOTICE 'Total available properties: %', prop_count;
  RAISE NOTICE '===========================================';
END $$;
