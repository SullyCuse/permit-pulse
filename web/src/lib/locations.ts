export type Location = {
  slug: string
  name: string
  region: string
  fullName: string
  headline: string
  subheadline: string
  personas: { icon: string; title: string; desc: string }[]
  faqWhere: string
  faqAreas: string
  metaTitle: string
  metaDescription: string
}

export const LOCATIONS: Location[] = [
  {
    slug: 'hall-county-ga-building-permits',
    name: 'Hall County',
    region: 'GA',
    fullName: 'Hall County, GA',
    headline: 'Every Hall County building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Hall County and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Hall County is growing fast. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Hall County zip codes. Spot the neighborhoods heating up before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Hall County streets are seeing new construction before your clients do. Use permit data to prospect smarter and have real answers about neighborhood growth.',
      },
    ],
    faqWhere: 'We pull directly from Hall County\'s official public permit records, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Gwinnett County, Forsyth County, DeKalb County, Bryan County, Johns Creek, the city of Savannah, and Alpharetta.',
    metaTitle: 'Hall County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Hall County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'gwinnett-county-ga-building-permits',
    name: 'Gwinnett County',
    region: 'GA',
    fullName: 'Gwinnett County, GA',
    headline: 'Every Gwinnett County building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Gwinnett County and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Gwinnett is one of the fastest-growing counties in Georgia. Get a digest of every new residential and commercial permit filed in your zip codes three times a week — and beat competitors to the quote.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track development activity across Gwinnett County zip codes. Spot new construction and renovation trends before they show up in listing prices.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Gwinnett neighborhoods are growing before your clients ask. Use permit data to prospect smarter and win more listings.',
      },
    ],
    faqWhere: 'We pull directly from Gwinnett County\'s official public permit records, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Forsyth County, DeKalb County, Bryan County, Johns Creek, the city of Savannah, and Alpharetta.',
    metaTitle: 'Gwinnett County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Gwinnett County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'forsyth-county-ga-building-permits',
    name: 'Forsyth County',
    region: 'GA',
    fullName: 'Forsyth County, GA',
    headline: 'Every Forsyth County building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Forsyth County and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Forsyth County\'s growth is relentless. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction, additions, and remodels across Forsyth County by zip code. Find your next deal while others are still guessing.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Forsyth County streets are booming before your clients do. Use permit data to win more listings and prospect where growth is actually happening.',
      },
    ],
    faqWhere: 'We pull directly from Forsyth County\'s official public permit records via ArcGIS, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, DeKalb County, Bryan County, Johns Creek, the city of Savannah, and Alpharetta.',
    metaTitle: 'Forsyth County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Forsyth County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'savannah-ga-building-permits',
    name: 'Savannah',
    region: 'GA',
    fullName: 'Savannah, GA',
    headline: 'Every Savannah building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Savannah and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Savannah\'s historic districts and new development are both active. Get a digest of every new permit filed in your service area three times a week — and beat competitors to the quote.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track renovation and new construction activity across Savannah zip codes. Spot which neighborhoods are heating up before they hit the market.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Savannah streets are seeing new investment before your clients do. Use permit data to prospect smarter and have real answers about neighborhood development.',
      },
    ],
    faqWhere: 'We pull directly from the City of Savannah\'s official public permit records, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Johns Creek, and Alpharetta.',
    metaTitle: 'Savannah GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Savannah, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'alpharetta-ga-building-permits',
    name: 'Alpharetta',
    region: 'GA',
    fullName: 'Alpharetta, GA',
    headline: 'Every Alpharetta building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Alpharetta and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Alpharetta is one of Metro Atlanta\'s most active markets. Get a digest of every new residential and commercial permit three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Alpharetta zip codes. Find your next deal in one of Georgia\'s fastest-appreciating markets.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Alpharetta streets are growing before your clients do. Use permit data to win more listings and prospect where the real growth is happening.',
      },
    ],
    faqWhere: 'We pull directly from the City of Alpharetta\'s official public permit records, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Johns Creek, and the city of Savannah.',
    metaTitle: 'Alpharetta GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Alpharetta, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'bryan-county-ga-building-permits',
    name: 'Bryan County',
    region: 'GA',
    fullName: 'Bryan County, GA',
    headline: 'Every Bryan County building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Bryan County and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Bryan County is one of Georgia\'s fastest-growing coastal counties. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Bryan County zip codes. Spot the neighborhoods heating up before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Bryan County areas are seeing new development before your clients do. Use permit data to prospect smarter and have real answers about neighborhood growth.',
      },
    ],
    faqWhere: 'We pull directly from Bryan County\'s official public permit records via ArcGIS, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Johns Creek, and the cities of Savannah and Alpharetta.',
    metaTitle: 'Bryan County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Bryan County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'dekalb-county-ga-building-permits',
    name: 'DeKalb County',
    region: 'GA',
    fullName: 'DeKalb County, GA',
    headline: 'Every DeKalb County building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in DeKalb County and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'DeKalb County spans everything from Decatur to Stone Mountain. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across DeKalb County zip codes. Spot the neighborhoods gaining momentum before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which DeKalb County streets are seeing new investment before your clients do. Use permit data to prospect smarter and have real answers about neighborhood development.',
      },
    ],
    faqWhere: 'We pull directly from DeKalb County\'s official public permit records via ArcGIS, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, Bryan County, Johns Creek, and the cities of Savannah and Alpharetta.',
    metaTitle: 'DeKalb County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in DeKalb County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'johns-creek-ga-building-permits',
    name: 'Johns Creek',
    region: 'GA',
    fullName: 'Johns Creek, GA',
    headline: 'Every Johns Creek building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Johns Creek and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Johns Creek is one of Metro Atlanta\'s most affluent and active markets. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Johns Creek zip codes. One of Georgia\'s top-income cities — spot deals before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Johns Creek streets are seeing new investment before your clients do. Use permit data to prospect smarter and win more listings in this high-value market.',
      },
    ],
    faqWhere: 'We pull directly from the City of Johns Creek\'s official public permit records via ArcGIS, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Savannah and Alpharetta.',
    metaTitle: 'Johns Creek GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Johns Creek, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
]

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find(l => l.slug === slug)
}
