import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to CivicEye</h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            AI-powered platform to report and track local civic issues.
            Help make your community better, one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="w-full sm:w-auto bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-lg">
                Get Started — Register
              </button>
            </Link>
            <Link to="/login">
              <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white hover:text-blue-700 transition-colors text-lg">
                Login
              </button>
            </Link>
          </div>
          <p className="mt-6 text-blue-200 text-sm">Already have an account? Click Login above.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload</h3>
              <p className="text-gray-600">Take a photo and describe the issue in your community</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Detection</h3>
              <p className="text-gray-600">Our AI analyzes and categorizes the issue automatically</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Routing</h3>
              <p className="text-gray-600">Issue is routed to the appropriate department</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Tracking</h3>
              <p className="text-gray-600">Track the status until the issue is resolved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CivicEye?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Fast & Easy</h3>
              <p className="text-gray-600">Report issues in seconds with our simple interface</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-gray-600">Smart categorization and routing using AI technology</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">Stay updated on the progress of your reports</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
