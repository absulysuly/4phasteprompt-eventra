import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 w-full p-4 text-center text-gray-400 text-sm">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Iraq Discovery Project. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;