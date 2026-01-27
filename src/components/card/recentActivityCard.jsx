import { Card, Spinner } from "flowbite-react";
import logo from '../../assets/logo.png';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuditRowsForUI } from "../../context/AuditContext";
import { useUserProfiles } from "../../context/UserProfileContext";

export function RecentComponent({ limit = 5 }) {
  const { profile } = useUserProfiles();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAuditRowsForUI({ limit });

        if (profile?.role === "engineer") {
          // Only show logs for this engineer
          data = data.filter(log => log.user_id === profile.id);
        }
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err)
      }
      setLoading(false);
    };

    fetchLogs();
  }, [limit]);

  return (
    <Card className="max-full h-[350px] ">
      <div className="mb-2 flex items-center justify-between sticky top-0 bg-white z-10 p-2">
        <h5 className="text-xl font-bold leading-none text-gray-900">Recent Activity</h5>
        <Link to='/audit' className="text-sm font-medium text-[#26599F] hover:underline">
          View all
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10">
            <Spinner size="xl" color="info" />
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {logs.length === 0 && (
              <li className="py-3 text-center text-gray-500">No recent activity</li>
            )}

            {logs.map((log, index) => (
              <li key={index} className="py-3 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-900">{log.user}</p>
                    <p className="truncate text-sm text-gray-500">{log.email}</p>
                  </div>
                  <div className="inline-flex items-center text-base text-gray-900">
                    {log.action}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
        }

      </div>
    </Card>
  );
}
