import { X } from "lucide-react";
import { Button } from "flowbite-react";
import { useState } from "react";
import { reservedStock } from "../../context/ReservedStockContext";

export default function ReservedStock({ onClose, inventory, onSuccess, setToast }) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(""); 

  const handleChangeQuantity = (e) => {
    const value = Number(e.target.value);

    if (value > inventory.quantity) {
      setError(`Cannot exceed available quantity (${inventory.quantity})`);
      setQuantity(inventory.quantity); 
    } else if (value < 1) {
      setError("Quantity must be at least 1");
      setQuantity("");
    } else {
      setError("");
      setQuantity(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quantity || quantity < 1 || quantity > inventory.quantity) {
      setError("Please enter a valid quantity");
      return;
    }

    try {
      await reservedStock({
        inventory_id: inventory.id,
        quantity: Number(quantity),
        notes,
      });

      if (setToast) {
        setToast({
          type: "success",
          message: `${quantity} of ${inventory.name} reserved successfully!`,
        });
      }

      onSuccess?.(); // refresh inventory or reserved stocks list
      onClose();
    } catch (err) {
      if (setToast) {
        setToast({
          type: "error",
          message: err.message || "Reserve Failed",
        });
      } else {
        alert(err.message || "Reserve Failed");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white backdrop-blur-md w-[600px] rounded-lg shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
          <h1 className="text-xl font-bold">Reserve Stock</h1>
          <X
            onClick={onClose}
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500"
          />
        </div>

        <form className="p-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={inventory.quantity}
              value={quantity}
              onChange={handleChangeQuantity}
              required
              className={`w-full p-2.5 border rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-700 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] text-gray-700"
            />
          </div>

          <Button type="submit" className="w-full bg-[#26599F] text-lg">
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}
