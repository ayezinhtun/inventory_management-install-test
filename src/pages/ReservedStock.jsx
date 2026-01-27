import { useEffect, useState } from "react";
import CardComponent from "../components/card/crad";
import { Download, Search, UsersRound } from "lucide-react";
import Pagination from "../components/pagination/pagination";
import {
  Checkbox,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { activatedReservedStock, fetchReservedStocks } from "../context/ReservedStockContext";
import AppToast from "../components/toast/Toast";

export default function ReservedStock() {
  const [reservedStocks, setReservedStocks] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search and filter
  const [searchItem, setSearchItem] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchReservedStocks();
      setReservedStocks(data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load reserved stocks" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivate = async (reserved) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to activate ${reserved.quantity} of ${reserved.inventory.name}?`
    );
    if (!isConfirmed) return;

    try {
      setLoading(true);
      await activatedReservedStock(reserved);
      setToast({ type: "success", message: "Stock Activated" });
      await loadData();
    } catch (err) {
      setToast({ type: "error", message: "Activation Failed" });
    } finally {
      setLoading(false);
    }
  };

  // Filtered and searched data
  const filteredStocks = reservedStocks.filter((r) =>
    r.inventory.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);

  return (
    <div>
      <h1 className="font-bold mb-5 text-[24px]">Reserved Stocks</h1>

      <div className="grid grid-cols-3 gap-10 mb-5">
        <CardComponent
          title="Total Reserved Stock"
          count={reservedStocks.length}
          icon={UsersRound}
          color="bg-teal-100"
          iconColor="text-teal-600"
        />
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-auto">
        <div className="flex items-center justify-between py-3 border-b border-[#EAECF0] px-5 space-x-4">
          <div className="flex space-x-3">
            <div className="flex items-center border border-gray-300 rounded-lg p-2 px-4 w-[300px] focus-within:ring-4 focus-within:ring-primary-300">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search by inventory name"
                value={searchItem}
                onChange={(e) => { setSearchItem(e.target.value); setCurrentPage(1); }}
                className="flex-1 outline-none border-none focus:border-none focus:ring-0"
              />
            </div>
          </div>

          {/* <div className="flex space-x-5">
            <button className="flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 transition">
              <Download className="w-5 h-5 mr-2" />
              <span>Export</span>
            </button>
          </div> */}
        </div>

        <div className="overflow-x-auto rounded-lg">
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell className="p-4"><Checkbox /></TableHeadCell>
                <TableHeadCell>Inventory Name</TableHeadCell>
                <TableHeadCell>Quantity</TableHeadCell>
                <TableHeadCell>Notes</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="divide-y divide-gray-200">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-5">
                    <Spinner size="xl" color="info" aria-label="Loading..." />
                  </TableCell>
                </TableRow>
              ) : currentStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No reserved stocks found
                  </TableCell>
                </TableRow>
              ) : (
                currentStocks.map((r) => (
                  <TableRow key={r.id} className="bg-white">
                    <TableCell className="p-4"><Checkbox /></TableCell>
                    <TableCell>{r.inventory.name}</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                    <TableCell>{r.notes}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleActivate(r)}
                        disabled={loading}
                        className="flex items-center border rounded-lg p-2 px-4 cursor-pointer text-white bg-[#26599F] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition"
                      >
                        Activate
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <AppToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
