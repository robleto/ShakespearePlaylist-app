export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ShakesFind</h3>
            <p className="text-gray-600 mb-4">
              Discover upcoming Shakespeare productions from theaters across the United States.
            </p>
            <p className="text-sm text-gray-500">
              Built with ❤️ for theater lovers everywhere.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/api" className="text-gray-600 hover:text-gray-900">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ShakesFind. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
