const Matches = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          <span className="gradient-text">Your Matches</span>
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-primary-200 to-secondary-200 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-1">Match {i}</h3>
              <p className="text-gray-600 text-sm mb-3">Matched 2 days ago</p>
              <button className="btn-primary w-full text-sm py-2">
                Send Message
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-12">
          Connect with the backend to see your real matches
        </p>
      </div>
    </div>
  )
}

export default Matches
