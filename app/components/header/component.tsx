import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full">
      <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-black navbar-expand-lg">
        <div className="container flex flex-wrap items-center justify-between px-4 mx-auto">
          <div className="relative flex justify-between w-full lg:w-auto lg:static lg:block lg:justify-start">
            <a
              className="inline-block py-2 mr-4 text-sm font-bold leading-relaxed text-white uppercase whitespace-no-wrap"
              href="#pablo"
            >
              MARXAN
            </a>

            <button
              className="block px-3 py-1 text-xl leading-none bg-transparent border border-transparent border-solid rounded outline-none cursor-pointer lg:hidden focus:outline-none"
              type="button"
            >
              <span className="relative block w-6 h-px bg-white rounded-sm"></span>
              <span className="relative block w-6 h-px mt-1 bg-white rounded-sm"></span>
              <span className="relative block w-6 h-px mt-1 bg-white rounded-sm"></span>
            </button>
          </div>
          <div className="flex items-center lg:flex-grow" id="example-navbar-info">
            <ul className="flex flex-col ml-auto list-none lg:flex-row">
              <li className="nav-item">
                <a
                  className="flex items-center py-2 text-xs font-bold leading-snug text-white uppercase lg:px-3 hover:opacity-75"
                  href="#pablo"
                >
                  Discover
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="flex items-center py-2 text-xs font-bold leading-snug text-white uppercase lg:px-3 hover:opacity-75"
                  href="#pablo"
                >
                  Profile
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="flex items-center py-2 text-xs font-bold leading-snug text-white uppercase lg:px-3 hover:opacity-75"
                  href="#pablo"
                >
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
