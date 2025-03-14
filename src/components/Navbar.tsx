import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="text-white text-lg font-semibold">
          Home
        </Link>
        <div className="flex space-x-4">
          <Link to="/profile" className="text-gray-300 hover:text-white">
            Profile
          </Link>
          <Link to="/owner" className="text-gray-300 hover:text-white">
            Owner
          </Link>
          <Link to="/admin" className="text-gray-300 hover:text-white">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;