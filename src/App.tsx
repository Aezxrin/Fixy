import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Services from './components/Services';
import UserTypes from './components/UserTypes';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <Services />
      <UserTypes />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
