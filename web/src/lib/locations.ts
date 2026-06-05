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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Cobb County, Glynn County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and LaGrange.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Cobb County, Glynn County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, and LaGrange.',
    metaTitle: 'Coweta County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Coweta County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in the Newnan area.',
  },
  {
    slug: 'cobb-county-ga-building-permits',
    name: 'Cobb County',
    region: 'GA',
    fullName: 'Cobb County, GA',
    headline: 'Every Cobb County building permit — live tracking updated Monday, Wednesday & Friday.',
    subheadline:
      'Permit Pulse monitors every unincorporated Cobb County permit and delivers a digest to Pro subscribers three times a week. One of Georgia\'s largest suburban counties — never miss a new build or renovation.',
    personas: [
      {
        icon: '🔨',
        title: 'Contractors & Builders',
        desc: 'Get every new residential and commercial permit in unincorporated Cobb County — new construction, renovations, electrical, plumbing, and more — delivered three times a week before your competition.',
      },
      {
        icon: '🏠',
        title: 'Real Estate Investors',
        desc: 'Track new construction and renovation activity across Cobb County\'s unincorporated communities. Spot emerging development trends in this densely built, high-value suburban market.',
      },
      {
        icon: '📋',
        title: 'Agents & Realtors',
        desc: 'Know which Cobb County neighborhoods are seeing new investment the week it happens. Filter by zip code and permit type to stay ahead of clients in this dynamic Northwest Atlanta market.',
      },
    ],
    faqWhere: 'Our Cobb County data is sourced from the Cobb County official public permit records via the Accela Citizen Access portal, updated Monday, Wednesday, and Friday.',
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Glynn County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, Marietta, and LaGrange.',
    metaTitle: 'Cobb County GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in Cobb County, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in the Atlanta suburbs.',
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
    faqAreas: 'Yes — we also cover Hall County, Gwinnett County, Forsyth County, DeKalb County, Bryan County, Cherokee County, Effingham County, Fayette County, Henry County, Coweta County, Cobb County, Glynn County, and the cities of Atlanta, Savannah, Alpharetta, Johns Creek, Augusta, Sandy Springs, Smyrna, Cartersville, Austell, Gainesville, Oakwood, and Marietta.',
    metaTitle: 'LaGrange GA Building Permits | Permit Pulse',
    metaDescription:
      'Get a digest of every new building permit filed in LaGrange, GA — delivered Monday, Wednesday & Friday. Built for contractors, investors, and realtors in Troup County.',
  },
]

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find(l => l.slug === slug)
}
