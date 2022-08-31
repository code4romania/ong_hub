import React, { Fragment } from 'react';
import './Header.css';
import logo from './../../assets/images/logo.svg';
import profileImg from './../../assets/images/profile.svg';
import { useAuthContext } from '../../contexts/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { CogIcon, LogoutIcon } from '@heroicons/react/outline';
import { classNames } from '../../common/helpers/tailwind.helper';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../store/selectors';
import { Auth } from 'aws-amplify';

const Header = () => {
  const { logout, isAuthenticated, isRestricted } = useAuthContext();
  const navigate = useNavigate();
  const { profile } = useUser();

  return (
    <header className="bg-white">
      <nav className=" px-10  py-4" aria-label="Top">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <img src={logo} alt="Code 4 Romania - ONG Hub" className="h-full w-full" />
          </div>
          {!isAuthenticated && !isRestricted && (
            <button
              className="bg-yellow-600 px-6 py-2 shadow rounded-full text-black font-titilliumBold"
              onClick={(e) => Auth.federatedSignIn()}
            >
              INTRA IN CONT
            </button>
          )}
          {isAuthenticated && (
            <div className="flex space-x-4 items-center">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="flex items-center gap-4 hover:bg-green-tab py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    <span className="font-titilliumBold text-gray-900 text-base tracking-wide">
                      {profile?.name || ''}
                    </span>
                    <img className="w-10 h-10" src={profileImg} alt="Profile photo" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right  absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1 divide-y divide-gray-200">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'group flex items-center px-4 py-2 text-sm',
                            )}
                            onClick={() => navigate('/account')}
                          >
                            <CogIcon className="mr-3 h-5 w-5 text-gray-800 " aria-hidden="true" />
                            Contul meu
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'group flex items-center px-4 py-2 text-sm',
                            )}
                            onClick={logout}
                          >
                            <LogoutIcon
                              className="mr-3 h-5 w-5 text-gray-800 "
                              aria-hidden="true"
                            />
                            Log out
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
