import { useEffect, useState } from "react";
import { Checkbox, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { ClipboardList, Clock, Download, ListFilter, Search } from "lucide-react";
import CardComponent from "../../../components/card/crad";
import AppToast from "../../../components/toast/Toast";
import { getRelocationRequests } from "../../../context/RelocationContext";
import { useUserProfiles } from "../../../context/UserProfileContext";

export default function EngineerRelocationRequests() {
  const { profile } = useUserProfiles();
  const [toast, setToast] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getRelocationRequests(null, profile.id);
      setRequests(data || []);
    } catch (e) {
      setToast({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [profile]);

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === "pm_approve_pending").length;

  return (
    <div>
      <h1 className="font-bold mb-5 text-[24px]">My Relocation Requests</h1>

      <div className="grid grid-cols-3 gap-y-5 gap-10 mb-5">
        <CardComponent title="Total Requests" count={totalCount} icon={ClipboardList} color="bg-blue-100" iconColor="text-blue-600" />
        <CardComponent title="Pending Requests" count={pendingCount} icon={Clock} color="bg-yellow-100" iconColor="text-yellow-600" />
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
        <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
          <div className="flex space-x-3">
            <div className="flex items-center border border-gray-300 rounded-lg p-2 px-4 w-[300px] focus-within:ring-4 focus-within:ring-primary-300">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              <input type="text" placeholder="Search by name" className="flex-1 outline-none border-none focus:border-none focus:ring-0" />
            </div>

            <div className="flex items-center border rounded-lg p-2 px-4 cursor-pointer">
              <ListFilter className="w-5 h-5 mr-2" />
              <span>Filter</span>
            </div>
          </div>

          <div className="flex space-x-5">
            <button className="flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition" onClick={fetchRequests}>
              <Download className="w-5 h-5 mr-2" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell className="p-4"><Checkbox /></TableHeadCell>
                <TableHeadCell>Item</TableHeadCell>
                <TableHeadCell>Qty</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Requester</TableHeadCell>
                <TableHeadCell>From</TableHeadCell>
                <TableHeadCell>To</TableHeadCell>
                <TableHeadCell>Note</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-200">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-5">
                    <div>
                      <Spinner size="xl" color="info" aria-label="Loading..." />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center"
                    >
                      No Request found
                    </TableCell>
                  </TableRow>
                ) : (

                  requests.map((r) => (
                    <TableRow key={r.id} className="bg-white">
                      <TableCell className="p-4"><Checkbox /></TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-gray-900">{r.component?.name}</TableCell>
                      <TableCell>{r.quantity}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.requester?.name || ""}</TableCell>
                      <TableCell>{r.source?.name || ""}</TableCell>
                      <TableCell>{r.destination_move_type === 'server' ? (r.dest_server?.name || '') : 'Warehouse'}</TableCell>
                      <TableCell>{r.notes || ""}</TableCell>
                    </TableRow>
                  ))

                )
              )}


            </TableBody>
          </Table>
        </div>
      </div>

      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <AppToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}