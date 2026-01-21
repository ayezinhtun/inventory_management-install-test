import { Card } from "flowbite-react";
import logo from '../../assets/logo.png';
import { Link } from "react-router-dom";

export function RecentComponent() {
  return (
    <Card className="max-w-sm h-[350px] ">
      <div className="mb-4 flex items-center justify-between">
        <h5 className="text-xl font-bold leading-none text-gray-900">Recent Activity</h5>

        <Link to='/audit' className="text-sm font-medium text-[#26599F] hover:underline">
          View all
        </Link>

      </div>
      <div className="flow-root overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">Neil Sims</p>
                <p className="truncate text-sm text-gray-500">email@windster.com</p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">Add Inventory</div>
            </div>
          </li>
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">Bonnie Green</p>
                <p className="truncate text-sm text-gray-500">email@windster.com</p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">
                Update Inventory
              </div>
            </div>
          </li>
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">

              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">Michael Gough</p>
                <p className="truncate text-sm text-gray-500">email@windster.com</p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">Delete Inventory</div>
            </div>
          </li>

          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">

              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">Michael Gough</p>
                <p className="truncate text-sm text-gray-500">email@windster.com</p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">Delete Inventory</div>
            </div>
          </li>

          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="shrink-0">

              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">Michael Gough</p>
                <p className="truncate text-sm text-gray-500">email@windster.com</p>
              </div>
              <div className="inline-flex items-center text-base font-semibold text-gray-900">Delete Inventory</div>
            </div>
          </li>

        </ul>
      </div>
    </Card>
  );
}
