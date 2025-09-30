export default function CategoriesPage() {
  const categories = [
    { name: "Technology", icon: "💻", description: "Tech events and conferences" },
    { name: "Music", icon: "🎵", description: "Concerts and music festivals" },
    { name: "Business", icon: "💼", description: "Business networking events" },
    { name: "Arts", icon: "🎨", description: "Art exhibitions and cultural events" },
    { name: "Sports", icon: "⚽", description: "Sports events and competitions" },
    { name: "Food", icon: "🍽️", description: "Food festivals and culinary events" },
    { name: "Health", icon: "🏥", description: "Health and wellness events" },
    { name: "Community", icon: "👥", description: "Community and social events" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Event Categories
        </h1>
        <p className="text-xl text-gray-600">
          Explore different types of events in Iraq and Kurdistan
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-4 text-center">{category.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              {category.name}
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}