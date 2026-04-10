import { LogIn, Wrench } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-500 bg-clip-text text-transparent">
              FIXY
            </h1>
          </div>

          <button
            onClick={() => window.location.href = 'http://localhost:3000/login'}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-all duration-200 group"
            aria-label="Login"
          >
            <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}