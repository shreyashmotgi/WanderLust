 const sampleListings = [
     {
    title: "Tea Estate Bungalow",
    description:
      "A colonial-era bungalow nestled in Munnar's rolling tea plantations. Wake up to misty hills and the smell of fresh tea leaves.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62",
        filename: "seed/munnar-bungalow",
      },
    ],
    price: 3200,
    location: "Munnar, Kerala, India",
    country: "India",
    categories: ["Mountains", "Farms"],
    geometry: { type: "Point", coordinates: [77.0595, 10.0889] },
  },

  {
    title: "Coffee Plantation Retreat",
    description:
      "Stay amid coffee and spice estates in Coorg. Guided plantation walks and river-side breakfasts included.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        filename: "seed/coorg-retreat",
      },
    ],
    price: 2800,
    location: "Coorg, Karnataka, India",
    country: "India",
    categories: ["Farms", "Mountains"],
    geometry: { type: "Point", coordinates: [75.8069, 12.4244] },
  },

  {
    title: "Riverside Yoga Retreat",
    description:
      "A peaceful stay on the banks of the Ganges, close to Rishikesh's ashrams and white-water rafting spots.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35",
        filename: "seed/rishikesh-retreat",
      },
    ],
    price: 1800,
    location: "Rishikesh, Uttarakhand, India",
    country: "India",
    categories: ["Adventure", "Camping"],
    geometry: { type: "Point", coordinates: [78.2676, 30.0869] },
  },

  {
    title: "Lakeside Haveli",
    description:
      "A restored haveli overlooking Lake Pichola, minutes from Udaipur's City Palace. Rooftop dining with sunset views.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1477587458883-47145ed94245",
        filename: "seed/udaipur-haveli",
      },
    ],
    price: 4200,
    location: "Udaipur, Rajasthan, India",
    country: "India",
    categories: ["Iconic cities", "Castles"],
    geometry: { type: "Point", coordinates: [73.6833, 24.5854] },
  },

  {
    title: "Snow Valley Cottage",
    description:
      "A wooden cottage in Manali with views of snow-capped peaks. Close to Solang Valley for adventure sports.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
        filename: "seed/manali-cottage",
      },
    ],
    price: 2600,
    location: "Manali, Himachal Pradesh, India",
    country: "India",
    categories: ["Mountains", "Adventure"],
    geometry: { type: "Point", coordinates: [77.1892, 32.2432] },
  },

  {
    title: "Backwater Houseboat Stay",
    description:
      "Drift through Alleppey's palm-fringed backwaters on a traditional Kerala houseboat, complete with onboard chef.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
        filename: "seed/alleppey-houseboat",
      },
    ],
    price: 5000,
    location: "Alleppey, Kerala, India",
    country: "India",
    categories: ["Trending", "Camping"],
    geometry: { type: "Point", coordinates: [76.3388, 9.4981] },
  },

  {
    title: "Heritage Palace Stay",
    description:
      "A former royal residence turned boutique hotel in the Pink City. Intricate Rajputana architecture throughout.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599661046289-e31897846e41",
        filename: "seed/jaipur-palace",
      },
    ],
    price: 5500,
    location: "Jaipur, Rajasthan, India",
    country: "India",
    categories: ["Castles", "Iconic cities"],
    geometry: { type: "Point", coordinates: [75.7873, 26.9124] },
  },

  {
    title: "French Quarter Villa",
    description:
      "A pastel-colored colonial villa in Pondicherry's French Quarter, walking distance to the promenade and cafes.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
        filename: "seed/pondicherry-villa",
      },
    ],
    price: 3400,
    location: "Pondicherry, India",
    country: "India",
    categories: ["Beaches", "Trending"],
    geometry: { type: "Point", coordinates: [79.8083, 11.9416] },
  },

  {
    title: "Himalayan Homestay",
    description:
      "A family-run homestay in Ladakh with panoramic mountain views, close to Pangong Lake and Leh Palace.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1594736797933-d0f06ba48f70",
        filename: "seed/ladakh-homestay",
      },
    ],
    price: 2200,
    location: "Ladakh, India",
    country: "India",
    categories: ["Mountains", "Camping"],
    geometry: { type: "Point", coordinates: [77.5771, 34.1526] },
  },

  {
    title: "Palm Grove Budget Stay",
    description:
      "A simple, clean beachside guesthouse in South Goa, a short walk from Palolem Beach. Great value for backpackers.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        filename: "seed/goa-budget-stay",
      },
    ],
    price: 1800,
    location: "Goa, India",
    country: "India",
    categories: ["Beaches"],
    geometry: { type: "Point", coordinates: [74.0230, 15.0099] },
  },

  ];

module.exports = { data: sampleListings };