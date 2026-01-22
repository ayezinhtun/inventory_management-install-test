import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import { useRelocation } from "../../../context/RelocationContext";
import { useUserProfiles } from "../../../context/UserProfileContext";

const ComponentRelocationRequest = () => {
  const {
    installComponents,
    loading,
    fetchInstalledComponents,
    createRelocation,
  } = useRelocation();

  const { profile } = useUserProfiles();

  const [type, setType] = useState("ram");
  const [selectedInstall, setSelectedInstall] = useState(null);

  const [form, setForm] = useState({
    to_server_id: "",
    to_warehouse_id: "",
  });

  // fetch installed components (RAM / CPU / Storage)
  useEffect(() => {
    fetchInstalledComponents(type);
  }, [type]);

  const handleSelectInstallation = (installationId) => {
    const found = installComponents.find(i => i.id === installationId);
    setSelectedInstall(found || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile?.id) {
      alert("User profile not loaded");
      return;
    }

    if (!selectedInstall) {
      alert("Please select installed component");
      return;
    }

    if (!form.to_server_id && !form.to_warehouse_id) {
      alert("Please select destination server or warehouse");
      return;
    }

    try {
      await createRelocation({
        installation_id: selectedInstall.id,
        inventory_id: selectedInstall.inventory_id,

        from_server_id: selectedInstall.server_id,
        to_server_id: form.to_server_id || null,
        to_warehouse_id: form.to_warehouse_id || null,

        quantity: selectedInstall.quantity,
        request_type: type,

        status: "pm_approve_pending", // ✅ FIRST STATUS
        requested_by: profile.id,     // ✅ FROM PROFILE
      });

      alert("Relocation request submitted and waiting for PM approval");

      // reset
      setSelectedInstall(null);
      setForm({
        to_server_id: "",
        to_warehouse_id: "",
      });

    } catch (err) {
      console.error(err);
      alert("Failed to submit relocation request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        Create Relocation Request
      </h2>

      {/* Component Type */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Component Type</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="ram">RAM</option>
          <option value="cpu">CPU</option>
          <option value="storage">Storage</option>
        </select>
      </div>

      {/* Installed Components */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          Installed {type.toUpperCase()}
        </label>

        {loading ? (
          <Spinner />
        ) : (
          <select
            className="w-full border rounded px-3 py-2"
            defaultValue=""
            onChange={(e) => handleSelectInstallation(e.target.value)}
          >
            <option value="" disabled>
              Select installed component
            </option>

            {installComponents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.inventorys?.name} | Server {item.server_id} | Qty {item.quantity}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Current Info */}
      {selectedInstall && (
        <div className="mb-4 bg-gray-50 p-3 rounded text-sm">
          <p><b>Current Server:</b> {selectedInstall.server_id}</p>
          <p><b>Quantity:</b> {selectedInstall.quantity}</p>
          <p><b>Attributes:</b> {JSON.stringify(selectedInstall.attributes)}</p>
        </div>
      )}

      {/* Destination */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Destination Server ID</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.to_server_id}
          onChange={(e) =>
            setForm({ ...form, to_server_id: e.target.value })
          }
          placeholder="Optional"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Destination Warehouse ID</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.to_warehouse_id}
          onChange={(e) =>
            setForm({ ...form, to_warehouse_id: e.target.value })
          }
          placeholder="Optional"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="bg-[#26599F] text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Relocation Request
      </button>
    </div>
  );
};

export default ComponentRelocationRequest;
