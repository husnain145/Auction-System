import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const LandingPage = () => {
  useEffect(() => {
    AOS.init({ duration: 2000, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white scroll-smooth font-sans">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/images/fantastic-car.png"
          alt="Fantastic Car"
          className="w-full h-full object-cover absolute top-0 left-0 opacity-60"
        />
        <div className="relative z-10 text-center">
          <h1
            className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg"
            data-aos="fade-up"
          >
            Welcome to the Future of Bidding
          </h1>
          <p
            className="mt-6 text-xl md:text-2xl text-gray-300"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Discover rare Cars, Bikes, Phones & Luxury Homes.
          </p>
        </div>
      </section>

      {/* Product Sections */}
      <Section
        img="/images/super-bike.png"
        title="🏍️ Super Bike"
        description="Bid on limited-edition superbikes with raw power and futuristic design."
        reverse={false}
      />
      <Section
        img="/images/modern-house.png"
        title="🏡 Modern House"
        description="Win dream homes in stunning locations through live auctions."
        reverse={true}
      />
      <Section
        img="/images/smartphone.png"
        title="📱 Smart Phones"
        description="Get the latest smartphones with powerful features and sleek looks."
        reverse={false}
      />
    </div>
  );
};

const Section = ({ img, title, description, reverse }) => {
  return (
    <section
      className={`flex flex-col ${
        reverse ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center justify-center gap-12 px-8 py-24`}
    >
      {/* Image */}
      <div
        className="w-full max-w-lg"
        data-aos={reverse ? 'fade-left' : 'fade-right'}
      >
        <img
          src={img}
          alt={title}
          className="rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Text */}
      <div
        className="max-w-xl text-center md:text-left space-y-4"
        data-aos={reverse ? 'fade-right' : 'fade-left'}
      >
        <h2 className="text-4xl font-bold text-cyan-400">{title}</h2>
        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      </div>
    </section>
  );
};

export default LandingPage;
