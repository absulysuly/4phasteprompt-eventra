export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Eventra
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover events in Iraq and Kurdistan
        </p>
        <div className="flex gap-4 justify-center">
          <a 
            href="/events" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Events
          </a>
          <a 
            href="/register" 
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Register
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold mb-2">Events</h3>
          <p className="text-gray-600">Discover amazing local events</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold mb-2">Local Focus</h3>
          <p className="text-gray-600">Iraq and Kurdistan region</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600">Simple event registration</p>
        </div>
      </div>
    </div>
  );
}