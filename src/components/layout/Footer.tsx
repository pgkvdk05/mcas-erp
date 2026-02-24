import React from 'react';
import { FaInstagram, FaFacebookF, FaYoutube, FaLinkedinIn } from 'react-icons/fa';

type Social = {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  hoverClass?: string;
};

const socials: Social[] = [
  { name: 'Instagram', href: 'https://instagram.com/yourprofile', Icon: FaInstagram, hoverClass: 'hover:text-pink-500' },
  { name: 'Facebook', href: 'https://facebook.com/yourprofile', Icon: FaFacebookF, hoverClass: 'hover:text-blue-700' },
  { name: 'YouTube', href: 'https://youtube.com/yourchannel', Icon: FaYoutube, hoverClass: 'hover:text-red-600' },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/yourprofile', Icon: FaLinkedinIn, hoverClass: 'hover:text-blue-600' },
];

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} MCAS. All rights reserved.</p>

          <div className="mt-4 sm:mt-0">
            <div className="flex items-center justify-center space-x-4 sm:space-x-6">
              {socials.map(({ name, href, Icon, hoverClass }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className={`${hoverClass ?? 'hover:text-gray-900'} text-gray-600 transition transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full p-2`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">{name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
