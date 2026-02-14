import {
  Waves, Droplets, Flame, TreePine, Sun, Eye, Umbrella,
  UtensilsCrossed, CookingPot, Microwave, Coffee, Heater,
  Wifi, Snowflake, Tv, Monitor, Lock, Shirt, Wind,
  Dumbbell, ArrowUpDown, Car, Shield, ConciergeBell, WashingMachine,
  Bath, PawPrint, Plus
} from 'lucide-react'

const AMENITIES = [
  // Pool & Outdoor
  { key: 'pool', label: { en: 'Pool', es: 'Piscina' }, icon: Waves, category: 'outdoor' },
  { key: 'jacuzzi', label: { en: 'Jacuzzi', es: 'Jacuzzi' }, icon: Droplets, category: 'outdoor' },
  { key: 'bbq', label: { en: 'BBQ', es: 'BBQ' }, icon: Flame, category: 'outdoor' },
  { key: 'garden', label: { en: 'Garden', es: 'Jardín' }, icon: TreePine, category: 'outdoor' },
  { key: 'terrace', label: { en: 'Terrace / Balcony', es: 'Terraza / Balcón' }, icon: Sun, category: 'outdoor' },
  { key: 'sea_view', label: { en: 'Sea View', es: 'Vista al Mar' }, icon: Eye, category: 'outdoor' },
  { key: 'beach_access', label: { en: 'Beach Access', es: 'Acceso a Playa' }, icon: Umbrella, category: 'outdoor' },

  // Kitchen
  { key: 'kitchen', label: { en: 'Full Kitchen', es: 'Cocina Completa' }, icon: UtensilsCrossed, category: 'kitchen' },
  { key: 'dishwasher', label: { en: 'Dishwasher', es: 'Lavavajillas' }, icon: CookingPot, category: 'kitchen' },
  { key: 'microwave', label: { en: 'Microwave', es: 'Microondas' }, icon: Microwave, category: 'kitchen' },
  { key: 'coffee_machine', label: { en: 'Coffee Machine', es: 'Cafetera' }, icon: Coffee, category: 'kitchen' },
  { key: 'oven', label: { en: 'Oven', es: 'Horno' }, icon: Heater, category: 'kitchen' },

  // Comfort & Tech
  { key: 'wifi', label: { en: 'WiFi', es: 'WiFi' }, icon: Wifi, category: 'comfort' },
  { key: 'ac', label: { en: 'Air Conditioning', es: 'Aire Acondicionado' }, icon: Snowflake, category: 'comfort' },
  { key: 'smart_tv', label: { en: 'Smart TV', es: 'Smart TV' }, icon: Tv, category: 'comfort' },
  { key: 'workspace', label: { en: 'Workspace', es: 'Área de Trabajo' }, icon: Monitor, category: 'comfort' },
  { key: 'safe', label: { en: 'Safe', es: 'Caja Fuerte' }, icon: Lock, category: 'comfort' },
  { key: 'iron', label: { en: 'Iron', es: 'Plancha' }, icon: Shirt, category: 'comfort' },
  { key: 'hair_dryer', label: { en: 'Hair Dryer', es: 'Secador de Pelo' }, icon: Wind, category: 'comfort' },

  // Building
  { key: 'gym', label: { en: 'Gym', es: 'Gimnasio' }, icon: Dumbbell, category: 'building' },
  { key: 'elevator', label: { en: 'Elevator', es: 'Ascensor' }, icon: ArrowUpDown, category: 'building' },
  { key: 'parking', label: { en: 'Parking', es: 'Estacionamiento' }, icon: Car, category: 'building' },
  { key: 'security', label: { en: 'Security 24/7', es: 'Seguridad 24/7' }, icon: Shield, category: 'building' },
  { key: 'concierge', label: { en: 'Concierge', es: 'Conserjería' }, icon: ConciergeBell, category: 'building' },
  { key: 'laundry', label: { en: 'Laundry', es: 'Lavandería' }, icon: WashingMachine, category: 'building' },

  // Bedroom & Bath
  { key: 'bathtub', label: { en: 'Bathtub', es: 'Bañera' }, icon: Bath, category: 'bath' },
  { key: 'washer_dryer', label: { en: 'Washer / Dryer', es: 'Lavadora / Secadora' }, icon: WashingMachine, category: 'bath' },

  // Other
  { key: 'pet_friendly', label: { en: 'Pet Friendly', es: 'Pet Friendly' }, icon: PawPrint, category: 'other' },
]

const amenityMap = new Map(AMENITIES.map(a => [a.key, a]))

export function getAmenityConfig(key) {
  return amenityMap.get(key) || null
}

export { AMENITIES, Plus as PlusIcon }
