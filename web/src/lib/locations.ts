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
    faqAreas: 'Yes — we also cover Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Alpharetta, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, and Augusta.',
    metaTitle: 'Johns Creek GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Johns Creek, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'augusta-ga-building-permits',
    name: 'Augusta',
    region: 'GA',
    fullName: 'Augusta, GA',
    headline: 'Every Augusta building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Augusta and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Augusta is one of Georgia\'s largest and most active construction markets. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Augusta zip codes. From downtown revitalization to suburban growth — spot deals before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Augusta neighborhoods are seeing new investment before your clients do. Use permit data to prospect smarter and win more listings in Georgia\'s second-largest city.',
      },
    ],
    faqWhere: 'We pull directly from the City of Augusta\'s official public permit records via ArcGIS, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, and Johns Creek.',
    metaTitle: 'Augusta GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Augusta, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'atlanta-ga-building-permits',
    name: 'Atlanta',
    region: 'GA',
    fullName: 'Atlanta, GA',
    headline: 'Atlanta building permits — live tracking updated every Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse tracks City of Atlanta building permits in real time, pulling directly from the city\'s official ArcGIS records. Get notified the moment a new permit is filed in your zip code.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Stay ahead of the competition — get every new residential and commercial permit filed across Atlanta zip codes delivered to your inbox three times a week.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track construction and renovation activity across Atlanta zip codes in real time — from Buckhead to East Atlanta. Spot emerging development trends before the market moves.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know every new build and renovation permit filed in your market the same week it happens. Filter by zip code and permit type to focus on what matters to your clients.',
      },
    ],
    faqWhere: 'Our Atlanta data is sourced from the City of Atlanta\'s official ArcGIS building permit records, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Savannah, Alpharetta, Johns Creek, Augusta, and Sandy Springs.',
    metaTitle: 'Atlanta GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Atlanta, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'sandy-springs-ga-building-permits',
    name: 'Sandy Springs',
    region: 'GA',
    fullName: 'Sandy Springs, GA',
    headline: 'Every Sandy Springs building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Sandy Springs and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Sandy Springs is one of Metro Atlanta\'s most affluent and active markets. Get a digest of every new residential and commercial permit filed in your service area three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Sandy Springs zip codes. From Roswell Road to the Perimeter — spot deals before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Sandy Springs streets are seeing new investment before your clients do. Use permit data to prospect smarter and win more listings in this high-value market.',
      },
    ],
    faqWhere: 'We pull directly from the City of Sandy Springs\'s official public permit records, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, and Augusta.',
    metaTitle: 'Sandy Springs GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Sandy Springs, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'cherokee-county-ga-building-permits',
    name: 'Cherokee County',
    region: 'GA',
    fullName: 'Cherokee County, GA',
    headline: 'Every Cherokee County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Cherokee County, GA and delivers a digest to Pro subscribers three times a week. From Canton to Woodstock — never miss a new build or renovation in your market.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Cherokee County is one of Metro Atlanta\'s fastest-growing markets. Get every new residential and commercial permit — building, electrical, plumbing, mechanical, pools, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Canton, Woodstock, Ball Ground, and Waleska. Spot emerging neighborhoods and development trends before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Cherokee County streets are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of your clients in this high-growth market.',
      },
    ],
    faqWhere: 'Our Cherokee County data is sourced from the Cherokee County Government\'s official public permit records at cherokeega.com, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Effingham County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Cherokee County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Cherokee County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'smyrna-ga-building-permits',
    name: 'Smyrna',
    region: 'GA',
    fullName: 'Smyrna, GA',
    headline: 'Every Smyrna building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Smyrna and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Smyrna is one of Cobb County\'s most active markets, with renovations and new builds happening year-round. Get a digest of every new permit three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Smyrna zip codes. Spot the neighborhoods gaining momentum before they show up in listing prices.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Smyrna streets are seeing new investment before your clients do. Use permit data to prospect smarter and win more listings in this growing Cobb County market.',
      },
    ],
    faqWhere: 'We pull directly from the City of Smyrna\'s official public permit records via the OpenGov permitting portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Smyrna GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Smyrna, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'cartersville-ga-building-permits',
    name: 'Cartersville',
    region: 'GA',
    fullName: 'Cartersville, GA',
    headline: 'Every Cartersville building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Cartersville and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Cartersville and Bartow County are seeing rapid growth driven by industrial and residential development. Get a digest of every new permit three times a week — and beat competitors to the quote.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Cartersville zip codes. Spot emerging neighborhoods and development trends before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Cartersville streets are seeing new investment the week it happens. Use permit data to prospect smarter in this growing North Georgia market.',
      },
    ],
    faqWhere: 'We pull directly from the City of Cartersville\'s official public permit records via the OpenGov permitting portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Cartersville GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Cartersville, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'effingham-county-ga-building-permits',
    name: 'Effingham County',
    region: 'GA',
    fullName: 'Effingham County, GA',
    headline: 'Every Effingham County building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Effingham County and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Effingham County is one of coastal Georgia\'s fastest-growing markets, sitting between Savannah and the coast. Get a digest of every new residential and commercial permit three times a week — and show up to quote before anyone else does.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Effingham County zip codes. This fast-growing county is attracting buyers priced out of Savannah — spot deals early.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Effingham County areas are seeing new development before your clients do. Use permit data to prospect smarter and stay ahead in this high-growth coastal county.',
      },
    ],
    faqWhere: 'We pull directly from Effingham County\'s official public permit records via the OpenGov permitting portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Effingham County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Effingham County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'austell-ga-building-permits',
    name: 'Austell',
    region: 'GA',
    fullName: 'Austell, GA',
    headline: 'Every Austell building permit.\nDelivered before your competition sees it.',
    subheadline:
      'Permit Pulse monitors every building permit filed in Austell and sends Pro subscribers a digest every Monday, Wednesday, and Friday — so contractors, investors, and agents can move first.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Austell and western Cobb County are seeing steady residential and commercial growth. Get a digest of every new permit three times a week — and beat competitors to the quote.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Austell zip codes. An affordable entry point into Cobb County — spot deals before they hit the MLS.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Austell streets are seeing new investment the week it happens. Use permit data to prospect smarter in this active west Cobb market.',
      },
    ],
    faqWhere: 'We pull directly from the City of Austell\'s official public permit records via the OpenGov permitting portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Austell GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Austell, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'gainesville-ga-building-permits',
    name: 'Gainesville',
    region: 'GA',
    fullName: 'Gainesville, GA',
    headline: 'Every Gainesville building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Gainesville, GA and delivers a digest to Pro subscribers three times a week. Never miss a new build or renovation in Hall County\'s largest city.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Gainesville — building, electrical, plumbing, mechanical, signs, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Gainesville neighborhoods. Spot emerging development trends in this growing Northeast Georgia hub before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Gainesville streets are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of your clients in this active market.',
      },
    ],
    faqWhere: 'Our Gainesville data is sourced from the City of Gainesville\'s official public permit records via the Accela Citizen Access portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Oakwood, and Marietta.',
    metaTitle: 'Gainesville GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Gainesville, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'oakwood-ga-building-permits',
    name: 'Oakwood',
    region: 'GA',
    fullName: 'Oakwood, GA',
    headline: 'Every Oakwood building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Oakwood, GA and delivers a digest to Pro subscribers three times a week. Never miss a new build or renovation in this fast-growing Hall County city.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Oakwood — building, electrical, plumbing, mechanical, signs, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Oakwood. Spot emerging development trends in this rapidly expanding community south of Gainesville before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Oakwood streets are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of your clients in this growing market.',
      },
    ],
    faqWhere: 'Our Oakwood data is sourced from the City of Oakwood\'s official public permit records via the Accela Citizen Access portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, and Marietta.',
    metaTitle: 'Oakwood GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Oakwood, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'fayette-county-ga-building-permits',
    name: 'Fayette County',
    region: 'GA',
    fullName: 'Fayette County, GA',
    headline: 'Every Fayette County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Fayette County, GA and delivers a digest to Pro subscribers three times a week. Never miss a new build or renovation in one of metro Atlanta\'s fastest-growing suburban counties.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Fayette County — building, electrical, plumbing, mechanical, signs, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Fayette County. Spot emerging development trends in this growing community south of Atlanta before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Fayette County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of your clients in this active market.',
      },
    ],
    faqWhere: 'Our Fayette County data is sourced from the Fayette County Building Safety Department\'s official public permit records via the SagesGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Henry County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Fayette County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Fayette County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'henry-county-ga-building-permits',
    name: 'Henry County',
    region: 'GA',
    fullName: 'Henry County, GA',
    headline: 'Every Henry County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Henry County, GA and delivers a digest to Pro subscribers three times a week. Never miss a new build or renovation in one of metro Atlanta\'s most active growth counties.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Henry County — building, electrical, plumbing, mechanical, signs, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Henry County. Spot emerging development trends in this rapidly expanding community southeast of Atlanta before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Henry County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of your clients in this high-growth market.',
      },
    ],
    faqWhere: 'Our Henry County data is sourced from the Henry County Building & Plan Review Department\'s official public permit records via the SagesGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'Henry County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Henry County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'marietta-ga-building-permits',
    name: 'Marietta',
    region: 'GA',
    fullName: 'Marietta, GA',
    headline: 'Every Marietta building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Marietta, GA and delivers a digest to Pro subscribers three times a week. Never miss a new build or renovation in Cobb County\'s largest city.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Marietta — building, electrical, plumbing, mechanical, signs, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Marietta neighborhoods. Spot emerging development trends in this active Cobb County hub before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Marietta neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of your clients in this dynamic market.',
      },
    ],
    faqWhere: 'Our Marietta data is sourced from the City of Marietta\'s official public permit records via the SagesGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Glynn County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and LaGrange.',
    metaTitle: 'Marietta GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Marietta, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors.',
  },
  {
    slug: 'coweta-county-ga-building-permits',
    name: 'Coweta County',
    region: 'GA',
    fullName: 'Coweta County, GA',
    headline: 'Every Coweta County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Coweta County, GA and delivers a digest to Pro subscribers three times a week. One of metro Atlanta\'s fastest-growing counties — never miss a new build in the Newnan area.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Coweta County — new construction, renovations, electrical, plumbing, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Coweta County. Spot growth trends in Newnan and surrounding communities as this rapidly expanding metro Atlanta suburb continues to build out.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Coweta County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients in this high-growth market.',
      },
    ],
    faqWhere: 'Our Coweta County data is sourced from the Coweta County official public permit records via the Accela Citizen Access portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Glynn County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, and LaGrange.',
    metaTitle: 'Coweta County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Coweta County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in the Newnan area.',
  },
  {
    slug: 'glynn-county-ga-building-permits',
    name: 'Glynn County',
    region: 'GA',
    fullName: 'Glynn County, GA',
    headline: 'Every Glynn County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Glynn County, GA — including Brunswick, St. Simons Island, Sea Island, and Jekyll Island — and delivers a digest to Pro subscribers three times a week.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit across Glynn County — Brunswick, St. Simons Island, and Jekyll Island — delivered three times a week. Stay ahead in this active coastal Georgia construction market.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Glynn County\'s coastal communities. Spot investment trends on St. Simons Island and Brunswick before they hit the headlines.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Glynn County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve buyers and sellers across this high-demand coastal market.',
      },
    ],
    faqWhere: 'Our Glynn County data is sourced from the Glynn County official public permit records via the OpenGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Cobb County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, and LaGrange.',
    metaTitle: 'Glynn County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Glynn County, GA — Brunswick, St. Simons Island & Jekyll Island — delivered Monday, Wednesday & Friday.',
  },
  {
    slug: 'lagrange-ga-building-permits',
    name: 'LaGrange',
    region: 'GA',
    fullName: 'LaGrange, GA',
    headline: 'Every LaGrange building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in LaGrange, GA and delivers a digest to Pro subscribers three times a week. Troup County\'s largest city and a growing manufacturing hub — stay ahead of every new build.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in LaGrange — building, electrical, plumbing, mechanical, and more — delivered three times a week before your competition in this active West Georgia market.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across LaGrange neighborhoods. Spot growth trends in Troup County\'s county seat as manufacturing and residential development continue to expand.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which LaGrange neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients in this affordable and growing West Georgia community.',
      },
    ],
    faqWhere: 'Our LaGrange data is sourced from the City of LaGrange\'s official public permit records via the SagesGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Glynn County, Gordon County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'LaGrange GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in LaGrange, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Troup County.',
  },
  {
    slug: 'gordon-county-ga-building-permits',
    name: 'Gordon County',
    region: 'GA',
    fullName: 'Gordon County, GA',
    headline: 'Every Gordon County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Gordon County, GA and delivers a digest to Pro subscribers three times a week. Home to Calhoun and a growing Northwest Georgia manufacturing corridor — stay ahead of every new build.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in Gordon County — building, electrical, plumbing, HVAC, and more — delivered three times a week before your competition in this active Calhoun-area market.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Calhoun, Fairmount, Ranger, and unincorporated Gordon County. Spot growth trends along the I-75 corridor between Atlanta and Chattanooga.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Gordon County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients across this affordable, growing Northwest Georgia county.',
      },
    ],
    faqWhere: 'Our Gordon County data is sourced from the county\'s official public permit records via the OpenGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets in total, including Clayton, Barrow, Jackson, Houston, Dawson, Hall, Gwinnett, Forsyth, DeKalb, Cherokee, Coweta and Glynn County, plus Atlanta, Savannah, Roswell, Lawrenceville, Marietta, Sandy Springs, Augusta, Perry, Flowery Branch, Dallas and more.',
    metaTitle: 'Gordon County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Gordon County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in the Calhoun area.',
  },
  {
    slug: 'clayton-county-ga-building-permits',
    name: 'Clayton County',
    region: 'GA',
    fullName: 'Clayton County, GA',
    headline: 'Every Clayton County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Clayton County, GA and delivers a digest to Pro subscribers three times a week. From Jonesboro to Riverdale, Forest Park and Morrow — stay ahead of every new build in this south-metro Atlanta and airport-adjacent market.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Clayton County — building, electrical, mechanical, plumbing, and more — three times a week before your competition in this dense south-metro market.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction, renovations, and logistics/industrial activity across Jonesboro, Riverdale, Forest Park, and Morrow near Hartsfield-Jackson.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Clayton County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients across the county.' },
    ],
    faqWhere: 'Our Clayton County data is sourced from the county\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Barrow, Jackson, Houston, Dawson, Gordon, Gwinnett, DeKalb, Henry, Fayette and Coweta County, plus Atlanta, Roswell, Lawrenceville, Marietta, Sandy Springs, Perry, Dallas and more.',
    metaTitle: 'Clayton County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Clayton County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Jonesboro, Riverdale, Forest Park, and Morrow.',
  },
  {
    slug: 'barrow-county-ga-building-permits',
    name: 'Barrow County',
    region: 'GA',
    fullName: 'Barrow County, GA',
    headline: 'Every Barrow County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Barrow County, GA and delivers a digest to Pro subscribers three times a week. Winder, Auburn, and Statham are among the fastest-growing communities between Atlanta and Athens — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Barrow County — building, electrical, mechanical, and more — three times a week in one of Northeast Georgia\'s fastest-growing counties.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new subdivisions and commercial activity across Winder, Auburn, and Statham as growth spills out the I-85 corridor between Atlanta and Athens.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Barrow County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve buyers and sellers countywide.' },
    ],
    faqWhere: 'Our Barrow County data is sourced from the county\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Clayton, Jackson, Houston, Dawson, Gordon, Gwinnett, Hall, Forsyth and Cherokee County, plus Atlanta, Roswell, Lawrenceville, Flowery Branch, Marietta, Perry, Dallas and more.',
    metaTitle: 'Barrow County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Barrow County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Winder, Auburn, and Statham.',
  },
  {
    slug: 'jackson-county-ga-building-permits',
    name: 'Jackson County',
    region: 'GA',
    fullName: 'Jackson County, GA',
    headline: 'Every Jackson County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Jackson County, GA and delivers a digest to Pro subscribers three times a week. With Jefferson, Braselton, Commerce, and the booming I-85 logistics corridor, Jackson is one of Georgia\'s hottest growth markets — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential, commercial, and industrial permit in Jackson County three times a week — from new subdivisions to massive I-85 logistics and manufacturing projects.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track explosive growth across Jefferson, Braselton, Commerce, and Pendergrass as warehouses, plants, and rooftops reshape the I-85 corridor northeast of Atlanta.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Jackson County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve this fast-moving market.' },
    ],
    faqWhere: 'Our Jackson County data is sourced from the county\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Clayton, Barrow, Houston, Dawson, Gordon, Gwinnett, Hall, Forsyth and Cherokee County, plus Atlanta, Roswell, Lawrenceville, Flowery Branch, Marietta, Perry, Dallas and more.',
    metaTitle: 'Jackson County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Jackson County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Jefferson, Braselton, and Commerce.',
  },
  {
    slug: 'roswell-ga-building-permits',
    name: 'Roswell',
    region: 'GA',
    fullName: 'Roswell, GA',
    headline: 'Every Roswell building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Roswell, GA and delivers a digest to Pro subscribers three times a week. One of metro Atlanta\'s largest and most affluent cities, Roswell sees steady renovation, infill, and commercial activity — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Roswell — renovations, additions, new homes, mechanical, and more — three times a week before your competition in this affluent North Fulton market.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track renovation, teardown/rebuild, and commercial activity across Roswell\'s historic district and established neighborhoods in North Fulton.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Roswell neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve buyers and sellers across the city.' },
    ],
    faqWhere: 'Our Roswell data is sourced from the City of Roswell\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Atlanta, Alpharetta, Johns Creek, Sandy Springs, Marietta and Lawrenceville, plus Gwinnett, Forsyth, Cherokee, Clayton, Barrow and Jackson County and more.',
    metaTitle: 'Roswell GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Roswell, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in North Fulton.',
  },
  {
    slug: 'perry-ga-building-permits',
    name: 'Perry',
    region: 'GA',
    fullName: 'Perry, GA',
    headline: 'Every Perry building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Perry, GA and delivers a digest to Pro subscribers three times a week. Known as the "Crossroads of Georgia" and home to the Georgia National Fairgrounds, Perry anchors steady growth in Houston County — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Perry three times a week — building, electrical, mechanical, plumbing, and signs — before your competition in this Middle Georgia hub.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction and commercial development across Perry and the Houston County growth corridor south of Macon along I-75.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Perry neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients across Middle Georgia.' },
    ],
    faqWhere: 'Our Perry data is sourced from the City of Perry\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Houston County, plus Clayton, Barrow, Jackson, Dawson and Gordon County, and Atlanta, Savannah, Augusta, Roswell, Lawrenceville, Marietta, Dallas and more.',
    metaTitle: 'Perry GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Perry, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Houston County and Middle Georgia.',
  },
  {
    slug: 'lawrenceville-ga-building-permits',
    name: 'Lawrenceville',
    region: 'GA',
    fullName: 'Lawrenceville, GA',
    headline: 'Every Lawrenceville building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Lawrenceville, GA and delivers a digest to Pro subscribers three times a week. As the Gwinnett County seat, Lawrenceville mixes historic-downtown redevelopment with steady residential and commercial activity — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Lawrenceville — building, tenant build-outs, mechanical, and more — three times a week before your competition in the Gwinnett County seat.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track downtown redevelopment, tenant spaces, and residential activity across Lawrenceville at the heart of fast-growing Gwinnett County.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Lawrenceville neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients across Gwinnett.' },
    ],
    faqWhere: 'Our Lawrenceville data is sourced from the City of Lawrenceville\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Gwinnett County, plus Atlanta, Roswell, Alpharetta, Johns Creek, Sandy Springs and Marietta, and Clayton, Barrow, Jackson, Hall and Forsyth County and more.',
    metaTitle: 'Lawrenceville GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Lawrenceville, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Gwinnett County.',
  },
  {
    slug: 'houston-county-ga-building-permits',
    name: 'Houston County',
    region: 'GA',
    fullName: 'Houston County, GA',
    headline: 'Every Houston County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Houston County, GA and delivers a digest to Pro subscribers three times a week. Anchored by Warner Robins, Perry, and Robins Air Force Base, Houston County is Middle Georgia\'s growth engine — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Houston County three times a week — building, electrical, mechanical, and more — before your competition in the Warner Robins area.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction and commercial development across Warner Robins, Centerville, and Kathleen, fueled by Robins AFB and steady Middle Georgia growth.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Houston County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve clients across the county.' },
    ],
    faqWhere: 'Our Houston County data is sourced from the county\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Perry, plus Clayton, Barrow, Jackson, Dawson and Gordon County, and Atlanta, Savannah, Augusta, Roswell, Lawrenceville, Marietta, Dallas and more.',
    metaTitle: 'Houston County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Houston County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Warner Robins and Perry.',
  },
  {
    slug: 'flowery-branch-ga-building-permits',
    name: 'Flowery Branch',
    region: 'GA',
    fullName: 'Flowery Branch, GA',
    headline: 'Every Flowery Branch building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Flowery Branch, GA and delivers a digest to Pro subscribers three times a week. A fast-growing Lake Lanier community in Hall County, Flowery Branch is booming with new homes and commercial development — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Flowery Branch — building, HVAC, electrical, and more — three times a week before your competition in this growing Lake Lanier market.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new subdivisions and commercial activity across Flowery Branch and the South Hall growth corridor near Lake Lanier and I-985.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Flowery Branch neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve buyers and sellers.' },
    ],
    faqWhere: 'Our Flowery Branch data is sourced from the City of Flowery Branch\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Hall County and Gainesville, plus Forsyth, Gwinnett, Cherokee, Barrow and Jackson County, and Atlanta, Roswell, Lawrenceville, Marietta and more.',
    metaTitle: 'Flowery Branch GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Flowery Branch, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in South Hall and the Lake Lanier area.',
  },
  {
    slug: 'dawson-county-ga-building-permits',
    name: 'Dawson County',
    region: 'GA',
    fullName: 'Dawson County, GA',
    headline: 'Every Dawson County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Dawson County, GA and delivers a digest to Pro subscribers three times a week. Home to Dawsonville, the GA 400 corridor, and the North Georgia Premium Outlets, Dawson blends mountain-and-lake living with steady growth — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Dawson County three times a week — building, electrical, mechanical, and more — before your competition along the GA 400 corridor.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction, short-term rentals, and commercial development across Dawsonville and the GA 400 corridor in the North Georgia mountains.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Dawson County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve this growing North Georgia market.' },
    ],
    faqWhere: 'Our Dawson County data is sourced from the county\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Forsyth, Hall, Gwinnett, Cherokee, Barrow, Jackson, Clayton and Gordon County, plus Atlanta, Roswell, Lawrenceville, Flowery Branch, Marietta and more.',
    metaTitle: 'Dawson County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Dawson County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Dawsonville and the GA 400 corridor.',
  },
  {
    slug: 'dallas-ga-building-permits',
    name: 'Dallas',
    region: 'GA',
    fullName: 'Dallas, GA',
    headline: 'Every Dallas building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Dallas, GA and delivers a digest to Pro subscribers three times a week. As the Paulding County seat in one of metro Atlanta\'s fastest-growing exurbs, Dallas is booming with new residential and commercial construction — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Dallas three times a week — building, electrical, mechanical, and more — before your competition in fast-growing Paulding County.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new subdivisions and commercial activity across Dallas and Paulding County, one of the fastest-growing exurbs west of Atlanta.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Dallas neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve buyers and sellers in Paulding County.' },
    ],
    faqWhere: 'Our Dallas data is sourced from the City of Dallas, GA\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Cherokee, Cobb (Marietta/Smyrna), Clayton, Barrow, Jackson and Gordon County, plus Atlanta, Roswell, Lawrenceville, Cartersville, Austell and more.',
    metaTitle: 'Dallas GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Dallas, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Paulding County.',
  },
  {
    slug: 'morgan-county-ga-building-permits',
    name: 'Morgan County',
    region: 'GA',
    fullName: 'Morgan County, GA',
    headline: 'Every Morgan County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Morgan County, GA and delivers a digest to Pro subscribers three times a week. Anchored by historic Madison and the Lake Oconee shoreline, Morgan County blends preservation, lakefront building, and steady growth east of Atlanta — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Morgan County three times a week — building, electrical, mechanical, plumbing, pools, docks, and more — before your competition in the Madison and Lake Oconee market.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction, lakefront dock and seawall work, and commercial activity across Madison, Rutledge, Buckhead, and the Lake Oconee corridor.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Morgan County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve buyers and sellers around Madison and Lake Oconee.' },
    ],
    faqWhere: 'Our Morgan County data is sourced from the county\'s official public permit records via the OpenGov portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Columbus, Bulloch, Clayton, Barrow, Jackson, Houston, Dawson and Gordon County, plus Atlanta, Savannah, Augusta, Roswell, Lawrenceville, Marietta, Perry and more.',
    metaTitle: 'Morgan County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Morgan County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Madison and the Lake Oconee area.',
  },
  {
    slug: 'bulloch-county-ga-building-permits',
    name: 'Bulloch County',
    region: 'GA',
    fullName: 'Bulloch County, GA',
    headline: 'Every Bulloch County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Bulloch County, GA and delivers a digest to Pro subscribers three times a week. Home to Statesboro and Georgia Southern University, Bulloch County is a growing Southeast Georgia hub for housing, retail, and industry — stay ahead of every new build.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Bulloch County three times a week — building, accessory structures, manufactured homes, and more — before your competition in the Statesboro market.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction and student-housing, retail, and industrial activity across Statesboro, Brooklet, and Portal in fast-growing Southeast Georgia.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Bulloch County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve the Statesboro and Georgia Southern market.' },
    ],
    faqWhere: 'Our Bulloch County data is sourced from the county\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Columbus, Morgan, Clayton, Barrow, Jackson, Houston, Dawson and Gordon County, plus Savannah, Effingham, Bryan, Glynn, Atlanta, Roswell, Lawrenceville and more.',
    metaTitle: 'Bulloch County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Bulloch County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Statesboro and Southeast Georgia.',
  },
  {
    slug: 'columbus-ga-building-permits',
    name: 'Columbus',
    region: 'GA',
    fullName: 'Columbus, GA',
    headline: 'Every Columbus building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every permit filed in Columbus, GA and delivers a digest to Pro subscribers three times a week. Georgia\'s second-largest city — anchored by Fort Moore, the Chattahoochee riverfront, and a deep manufacturing base — sees steady residential and commercial building. Stay ahead of every new project across the consolidated Columbus-Muscogee government.',
    personas: [
      { icon: '🔨', title: 'Contractors & Builders', desc: 'Get every new residential and commercial permit in Columbus three times a week — building, electrical, mechanical, plumbing, pools, and more — before your competition in the Columbus-Muscogee market.' },
      { icon: '🏠', title: 'Real Estate Investors', desc: 'Track new construction, renovation, and commercial activity across Columbus, from Midtown and Uptown to the north-side growth corridors along the Chattahoochee.' },
      { icon: '📋', title: 'Agents & Realtors', desc: 'Know which Columbus neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to serve the Fort Moore and West Georgia market.' },
    ],
    faqWhere: 'Our Columbus data is sourced from the Columbus-Muscogee consolidated government\'s official public permit records via the Tyler EnerGov Citizen Self Service portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we track 38 Georgia markets, including Bulloch, Morgan, Clayton, Barrow, Jackson, Houston, Dawson and Gordon County, plus Atlanta, Savannah, Augusta, Roswell, Lawrenceville, Perry and more.',
    metaTitle: 'Columbus GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Columbus, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in the Columbus-Muscogee and Fort Moore area.',
  },
]

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find(l => l.slug === slug)
}
