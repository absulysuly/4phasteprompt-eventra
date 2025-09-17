import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral p-8">
      <h1 className="text-4xl font-bold text-center mb-8 holographic">
        🚀 Eventra Test App
      </h1>
      <div className="max-w-4xl mx-auto">
        <div className="card-3d p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Neural Network Theme Active</h2>
          <p className="text-lg">If you can see this, React is working properly!</p>
          <button className="magnetic-btn bg-primary text-white px-6 py-3 rounded-lg mt-4 hover:bg-blue-600">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestApp;