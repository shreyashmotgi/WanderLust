const sampleListings = [
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
        filename: "seed/beachfront-cottage",
      },
    ],
    price: 1500,
    location: "Malibu",
    country: "United States",
    categories: ["Beaches", "Trending"],
    geometry: {
      type: "Point",
      coordinates: [-118.7798, 34.0259],
    },
  },

  {
    title: "Modern Loft in Downtown",
    description:
      "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    images: [
      {
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        filename: "seed/modern-loft",
      },
    ],
    price: 1200,
    location: "New York City",
    country: "United States",
    categories: ["Iconic cities"],

    geometry: {
      type: "Point",
      coordinates: [-74.006, 40.7128],
    },
  },

  {
    title: "Mountain Retreat",
    description:
      "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
        filename: "seed/mountain-retreat",
      },
    ],
    price: 1000,
    location: "Aspen",
    country: "United States",
    categories: ["Mountains", "Adventure"],

    geometry: {
      type: "Point",
      coordinates: [-106.8175, 39.1911],
    },
  },

  {
    title: "Historic Villa in Tuscany",
    description:
      "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        filename: "seed/tuscany-villa",
      },
    ],
    price: 2500,
    location: "Florence",
    country: "Italy",
    categories: ["Iconic cities", "Trending"],

    geometry: {
      type: "Point",
      coordinates: [11.2558, 43.7696],
    },
  },

  {
    title: "Secluded Treehouse Getaway",
    description:
      "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        filename: "seed/treehouse",
      },
    ],
    price: 800,
    location: "Portland",
    country: "United States",
    categories: ["Camping", "Adventure"],

    geometry: {
      type: "Point",
      coordinates: [-122.6765, 45.5231],
    },
  },

  {
    title: "Beachfront Paradise",
    description:
      "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
        filename: "seed/beachfront-paradise",
      },
    ],
    price: 2000,
    location: "Cancun",
    country: "Mexico",
    categories: ["Beaches"],

    geometry: {
      type: "Point",
      coordinates: [-86.8515, 21.1619],
    },
  },

  {
    title: "Rustic Cabin by the Lake",
    description:
      "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        filename: "seed/lake-cabin",
      },
    ],
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
    categories: ["Camping", "Adventure"],

    geometry: {
      type: "Point",
      coordinates: [-120.0324, 39.0968],
    },
  },

  {
    title: "Luxury Penthouse with City Views",
    description:
      "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd",
        filename: "seed/penthouse",
      },
    ],
    price: 3500,
    location: "Los Angeles",
    country: "United States",
    categories: ["Iconic cities", "Trending"],

    geometry: {
      type: "Point",
      coordinates: [-118.2437, 34.0522],
    },
  },

  {
    title: "Ski-In/Ski-Out Chalet",
    description:
      "Hit the slopes right from your doorstep in this ski-in/ski-out chalet in the Swiss Alps.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb",
        filename: "seed/ski-chalet",
      },
    ],
    price: 3000,
    location: "Verbier",
    country: "Switzerland",
    categories: ["Mountains", "Adventure"],

    geometry: {
      type: "Point",
      coordinates: [7.2278, 46.0965],
    },
  },

  {
    title: "Safari Lodge in the Serengeti",
    description:
      "Experience the thrill of the wild in a comfortable safari lodge.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
        filename: "seed/safari-lodge",
      },
    ],
    price: 4000,
    location: "Serengeti National Park",
    country: "Tanzania",
    categories: ["Adventure", "Trending"],

    geometry: {
      type: "Point",
      coordinates: [34.8233, -2.3333],
    },
  },

  {
    title: "Private Island Retreat",
    description:
      "Have an entire island to yourself for a truly exclusive vacation.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972",
        filename: "seed/private-island",
      },
    ],
    price: 10000,
    location: "Fiji",
    country: "Fiji",
    categories: ["Beaches", "Trending"],

    geometry: {
      type: "Point",
      coordinates: [178.065, -17.7134],
    },
  },

  {
    title: "Luxury Villa in the Maldives",
    description: "Indulge in luxury in this overwater villa with ocean views.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
        filename: "seed/maldives-villa",
      },
    ],
    price: 6000,
    location: "Maldives",
    country: "Maldives",
    categories: ["Beaches", "Trending"],

    geometry: {
      type: "Point",
      coordinates: [73.2207, 4.1755],
    },
  },
];

module.exports = { data: sampleListings };
