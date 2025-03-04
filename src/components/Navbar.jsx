import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Wrench } from "lucide-react";

export default function Navbar({ navigation }) {
  const location = useLocation();

  return (
    <nav className="fixed w-full bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Wrench className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                RepairMS
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      location.pathname === item.href
                        ? "border-b-2 border-indigo-500 text-gray-900"
                        : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
