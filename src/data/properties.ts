export type Property = {
  id: string
  price: number
  title: string
  acres: number
  mls: string
  address: string
  city: string
  county: string
  type: string
  features: string[]
  description: string
  images: string[]
  lat: number
  lng: number
}

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`
const photos = {
  desert: image('photo-1509316785289-025f5b846b35'),
  hills: image('photo-1464822759023-fed622ff2c3b'),
  mountains: image('photo-1519681393784-d120267933ba'),
  ranch: image('photo-1500382017468-9049fed747ef'),
  road: image('photo-1510798831971-661eb04b3739'),
  sunset: image('photo-1470770841072-f978cf4d019e'),
}
export const properties: Property[] = [
  {
    id: 'dragoon-36', price: 147000, title: '36+ Acres on Dragoon Mountain Ranch', acres: 36.82,
    mls: '02034-521731', address: '5782 E De Vaca Circle, Saint David, AZ 85630', city: 'Saint David', county: 'Cochise', type: 'Land',
    features: ['Private well', 'Gated community', 'Horses allowed', 'Near Coronado National Forest', 'Holding tank'],
    description: 'Find room to breathe on this beautiful acreage in the scenic Dragoon Mountain Ranch community. Enjoy wide-open skies, mountain views, and easy access to the Coronado National Forest.',
    images: [photos.desert, photos.hills, photos.mountains], lat: 31.909, lng: -110.111,
  },
  {
    id: 'benson-19', price: 120000, title: '19.93 Acres of Vacant Land in Benson', acres: 19.93,
    mls: '02034-532393', address: 'N Wildcat Pl, Benson, AZ 85602', city: 'Benson', county: 'Cochise', type: 'Land',
    features: ['Two 10± acre parcels', 'Near I-10 & Hwy 90', 'Commercial potential', 'Room for horses'],
    description: 'A versatile pair of parcels with a convenient location near Benson, Interstate 10, and State Highway 90. A great opportunity to create your own Arizona homestead or explore commercial possibilities.',
    images: [photos.ranch, photos.desert, photos.road], lat: 31.967, lng: -110.296,
  },
  {
    id: 'willcox-29', price: 99500, title: '29+ Acres of Willcox Open Range', acres: 29.6,
    mls: '02034-602134', address: 'E Perilla Rd, Willcox, AZ 85643', city: 'Willcox', county: 'Cochise', type: 'Desert',
    features: ['10-acre lot available', 'Raw land', 'Livestock allowed', 'Single-family zoning'],
    description: 'A generous stretch of open range in the Willcox area. Build at your own pace, bring your animals, and enjoy the quiet of the high desert.',
    images: [photos.desert, photos.sunset, photos.hills], lat: 32.252, lng: -109.832,
  },
  {
    id: 'pearce-homestead', price: 95000, title: 'Desert Homestead with Mountain Views', acres: 20.1,
    mls: '02034-611204', address: 'S Desert Rd, Pearce, AZ 85625', city: 'Pearce', county: 'Cochise', type: 'Desert',
    features: ['Mountain views', 'Power nearby', 'County maintained road', 'No HOA'],
    description: 'A peaceful high-desert setting with plenty of space for your home, workshop, and garden. The Chiricahua Mountains create a spectacular backdrop.',
    images: [photos.hills, photos.desert, photos.sunset], lat: 31.867, lng: -109.825,
  },
  {
    id: 'elfrida-68', price: 68000, title: 'Quiet 10 Acres Near Elfrida', acres: 10.02,
    mls: '02034-603221', address: 'N Davis Rd, Elfrida, AZ 85610', city: 'Elfrida', county: 'Cochise', type: 'Land',
    features: ['Wide-open views', 'Dirt road access', 'Low property taxes', 'Room for a garden'],
    description: 'Make your country living plans a reality with this affordable parcel near Elfrida. Big skies, quiet evenings, and space to make it your own.',
    images: [photos.ranch, photos.desert, photos.mountains], lat: 31.702, lng: -109.694,
  },
  {
    id: 'benson-67', price: 67000, title: 'Buildable Benson Acreage', acres: 10.0,
    mls: '02034-528114', address: 'E Ocotillo Rd, Benson, AZ 85602', city: 'Benson', county: 'Cochise', type: 'Land',
    features: ['Buildable parcel', 'Mountain views', 'Easy town access', 'Electric nearby'],
    description: 'Enjoy the best of country living with services and shopping a short drive away. A blank canvas for a custom home or weekend escape.',
    images: [photos.mountains, photos.ranch, photos.desert], lat: 31.996, lng: -110.242,
  },
  {
    id: 'dragoon-38', price: 53500, title: '38 Acres in Gated Dragoon Mountain Ranch', acres: 38,
    mls: '02034-514113', address: 'Dragoon Mountain Ranch, Saint David, AZ', city: 'Saint David', county: 'Cochise', type: 'Mountain',
    features: ['Gated community', 'Horse-friendly', 'Mountain views', 'Near National Forest'],
    description: 'A full 38 acres in the sought-after Dragoon Mountain Ranch community. Explore the nearby trails and enjoy the privacy and wide-open landscape.',
    images: [photos.mountains, photos.hills, photos.sunset], lat: 31.879, lng: -110.154,
  },
  {
    id: 'benson-9', price: 50000, title: '9.93 Acres of Vacant Land in Benson', acres: 9.93,
    mls: '02034-532394', address: 'N Wildcat Pl, Benson, AZ 85602', city: 'Benson', county: 'Cochise', type: 'Land',
    features: ['Near I-10 & Hwy 90', 'Open country views', 'Investment opportunity', 'Quiet location'],
    description: 'An inviting parcel in a convenient Benson location. Take in the mountain views and imagine the possibilities for your future property.',
    images: [photos.desert, photos.ranch, photos.road], lat: 31.948, lng: -110.31,
  },
  {
    id: 'panorama-36', price: 49900, title: 'Spectacular Arizona Property with Panoramic Mountain View', acres: 36.18,
    mls: '02034-15449', address: 'N Cochise Stronghold Rd, Pearce, AZ 85625', city: 'Pearce', county: 'Cochise', type: 'Mountain',
    features: ['Panoramic mountain views', '36.18 acres', 'Quiet rural setting', 'Dark night skies'],
    description: 'A spectacular vantage point over the Arizona landscape. Take in sweeping views of the mountains and open desert from your own private acreage.',
    images: [photos.hills, photos.mountains, photos.sunset], lat: 31.887, lng: -109.965,
  },
  {
    id: 'buildable-36', price: 89000, title: 'Spectacular Buildable Arizona Property', acres: 36.26,
    mls: '02034-16785', address: 'E Dragoon Rd, Saint David, AZ 85630', city: 'Saint David', county: 'Cochise', type: 'Land',
    features: ['36.26 acres', 'Buildable homesite', 'Scenic desert landscape', 'Room to roam'],
    description: 'Create a home base in the heart of southern Arizona. This scenic parcel offers the space and privacy to bring your vision to life.',
    images: [photos.ranch, photos.hills, photos.desert], lat: 31.918, lng: -110.075,
  },
  {
    id: 'forest-edge', price: 79000, title: '36+ Acres Adjoining National Forest', acres: 36.37,
    mls: '02034-304095', address: 'Dragoon Mountain Ranch, Saint David, AZ', city: 'Saint David', county: 'Cochise', type: 'Recreational',
    features: ['Adjoins National Forest', 'Gated community', 'Mountain views', 'Great for recreation'],
    description: 'Step right into the outdoors from this remarkable acreage adjoining National Forest land. A wonderful retreat for nature lovers and outdoor explorers.',
    images: [photos.mountains, photos.hills, photos.ranch], lat: 31.856, lng: -110.138,
  },
  {
    id: 'hwy80-commercial', price: 325000, title: 'Commercial Property on Hwy 80', acres: 1.02,
    mls: '02034-527745', address: 'Hwy 80, Benson, AZ 85602', city: 'Benson', county: 'Cochise', type: 'Commercial',
    features: ['12,000 traffic count', 'Highway frontage', 'Near I-10', 'Commercial potential'],
    description: 'A high-visibility commercial opportunity with direct Highway 80 frontage and convenient access to Interstate 10.',
    images: [photos.road, photos.ranch, photos.desert], lat: 31.986, lng: -110.327,
  },
]

export const categories = ['Desert', 'Land', 'Mountain', 'Retirement & Active Adult', 'Country Homes', 'Investment & Income', 'Recreational', 'Equine', 'Coastal', 'Commercial', 'Owner Financing']
export const cities = ['Willcox', 'Pearce', 'Elfrida', 'Benson', 'Saint David']
