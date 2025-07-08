import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppIcon, { AppIconProps } from '../icons/AppIcon';

// Use the correct type from AppIconProps
type IconName = AppIconProps['name'];

interface NavItem {
  title: string;
  path: string;
  icon: IconName;
  description?: string;
}

interface NavMenuProps {
  items: NavItem[];
  onNavigation?: (path: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ items = [], onNavigation }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (onNavigation) {
      onNavigation(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="py-1">
      <ul className="list-none">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <li 
              key={index} 
              className="mb-0.8 transition-transform hover:translate-x-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 mr-2">
                    <AppIcon name={item.icon} />
                  </div>
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center">
                  {item.description && (
                    <span className="text-xs text-gray-500 mr-2">{item.description}</span>
                  )}
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      ${isActive ? 'bg-primary-100' : 'bg-transparent'}
                      ${isActive ? 'text-primary-600' : 'text-gray-500'}
                      ${isActive ? 'border-primary-600' : 'border-transparent'}
                      ${isActive ? 'hover:bg-primary-200' : 'hover:bg-primary-50'}
                      ${isActive ? 'hover:border-primary-600' : 'hover:border-transparent'}
                      ${isActive ? 'font-semibold' : 'font-normal'}
                      ${isActive ? 'py-1.2' : 'py-1.2'}
                      ${isActive ? 'px-2' : 'px-2'}
                      ${isActive ? 'rounded-2' : 'rounded-2'}
                      ${isActive ? 'transition-all duration-200' : 'transition-all duration-200'}
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary-600 to-secondary-600 rounded-0 4px 4px 0"></span>
                    )}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      
      {items.length > 0 && (
        <div className="my-1.5 mx-2 border-t border-gray-200"></div>
      )}
    </div>
  );
};

export default NavMenu; 