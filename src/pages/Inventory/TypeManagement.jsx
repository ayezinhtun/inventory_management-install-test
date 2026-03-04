import { Link } from "react-router-dom";
import { MoveLeft, Plus, Search, ListFilter, Download, Edit2, Trash2, X } from "lucide-react";
import { Button, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Checkbox } from "flowbite-react";
import { getInventoryTypes, deleteInventoryType, createInventoryType, updateInventoryType } from "../../context/TypeContext";
import { exportToCSV } from "../../utils/exportUtils";
import AppToast from "../../components/toast/Toast";
import { useState, useEffect } from "react";

export default function TypeManagementPage() {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchItem, setSearchItem] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [specFields, setSpecFields] = useState([]);

    const [form, setForm] = useState({
        name: '',
        description: '',
        specifications: []
    });

    useEffect(() => {
        const loadTypes = async () => {
            try {
                setLoading(true);
                const data = await getInventoryTypes();
                setTypes(data || []);
            } catch (error) {
                setToast({
                    type: 'error',
                    message: 'Failed to load inventory types'
                });
            } finally {
                setLoading(false);
            }
        };
        loadTypes();
    }, []);

    const filteredTypes = types.filter(type =>
        type.name.toLowerCase().includes(searchItem.toLowerCase())
    );

    const handleExport = () => {
        const csvData = types.map(type => ({
            Name: type.name,
            Description: type.description || '',
            Specifications: Array.isArray(type.specifications) ? type.specifications.join(', ') : 'No specifications'
        }));
        exportToCSV(csvData, 'inventory_types');
        setToast({
            type: 'success',
            message: 'Types exported successfully!'
        });
    };

    const handleDelete = async (type) => {
        if (!confirm(`Are you sure you want to delete "${type.name}"?`)) {
            return;
        }

        try {
            await deleteInventoryType(type.id);
            setToast({
                type: 'success',
                message: 'Type deleted successfully!'
            });
            // Reload types
            const data = await getInventoryTypes();
            setTypes(data || []);
        } catch (error) {
            setToast({
                type: 'error',
                message: 'Failed to delete type'
            });
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            specifications: []
        });
        setSpecFields([]);
        setEditingType(null);
    };

    const openModal = (type = null) => {
        if (type) {
            setForm({
                name: type.name,
                description: type.description || '',
                specifications: Array.isArray(type.specifications) ? type.specifications : []
            });
            setSpecFields(Array.isArray(type.specifications) ? type.specifications : []);
            setEditingType(type);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addSpecField = () => {
        const fieldName = prompt("Enter specification field name:");
        if (!fieldName) return;
        
        const upperFieldName = fieldName.toUpperCase();
        if (specFields.includes(upperFieldName)) {
            setToast({
                type: 'error',
                message: 'Field name already exists'
            });
            return;
        }

        setSpecFields(prev => [...prev, upperFieldName]);
        setForm(prev => ({
            ...prev,
            specifications: [...(prev.specifications || []), upperFieldName]
        }));
    };

    const removeSpecField = (fieldName) => {
        const upperFieldName = fieldName.toUpperCase();
        setSpecFields(prev => prev.filter(field => field !== upperFieldName));
        setForm(prev => ({
            ...prev,
            specifications: (prev.specifications || []).filter(spec => spec !== upperFieldName)
        }));
    };

    const handleSpecChange = (index, value) => {
        const newSpecs = [...(form.specifications || [])];
        const upperValue = value.toUpperCase();
        
        // Check if the new value already exists (excluding current index)
        if (newSpecs.includes(upperValue) && newSpecs.indexOf(upperValue) !== index) {
            setToast({
                type: 'error',
                message: 'Field name already exists'
            });
            return;
        }
        
        newSpecs[index] = upperValue;
        setSpecFields(newSpecs);
        setForm(prev => ({
            ...prev,
            specifications: newSpecs
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingType) {
                await updateInventoryType(editingType.id, form);
                setToast({
                    type: 'success',
                    message: 'Type updated successfully!'
                });
            } else {
                await createInventoryType(form);
                setToast({
                    type: 'success',
                    message: 'Type created successfully!'
                });
            }
            
            // Reload types
            const data = await getInventoryTypes();
            setTypes(data || []);
            closeModal();
        } catch (error) {
            setToast({
                type: 'error',
                message: `Failed to ${editingType ? 'update' : 'create'} type`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/inventory" className="p-2 hover:bg-gray-100 rounded-sm flex items-center me-2">
                        <MoveLeft />
                    </Link>
                    <h1 className="font-bold text-[24px]">Type Management</h1>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowFilter(!showFilter)}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        <ListFilter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button
                        onClick={handleExport}
                        className="bg-green-600 text-white hover:bg-green-700"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {showFilter && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search types..."
                                    value={searchItem}
                                    onChange={(e) => setSearchItem(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Inventory Types</h2>
                                <Button
                                    size="sm"
                                    onClick={() => openModal()}
                                    className="bg-[#26599F]"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Type
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg">
                            <Table hoverable>
                                <TableHead>
                                    <TableRow>
                                        <TableHeadCell className="p-4">
                                            <Checkbox />
                                        </TableHeadCell>
                                        <TableHeadCell>Type Name</TableHeadCell>
                                        <TableHeadCell>Description</TableHeadCell>
                                        <TableHeadCell>Specifications</TableHeadCell>
                                        <TableHeadCell colSpan={2}>
                                            <span>Action</span>
                                        </TableHeadCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-5">
                                                <div>
                                                    <Spinner size="xl" color="info" aria-label="Loading..." />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredTypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No inventory types found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTypes.map((type, index) => (
                                            <TableRow key={type.id} className="bg-white">
                                                <TableCell className="p-4">
                                                    <Checkbox />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-gray-900">
                                                    {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                                                </TableCell>
                                                <TableCell>{type.description || '-'}</TableCell>
                                                <TableCell>
                                                    {Array.isArray(type.specifications) && type.specifications.length > 0 ? (
                                                        <span className="text-sm">
                                                            {type.specifications.join(', ')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No specifications</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="flex items-center space-x-3">
                                                    <Edit2
                                                        className="text-[#26599F] hover:text-blue-700 cursor-pointer"
                                                        onClick={() => openModal(type)}
                                                    />
                                                    <Trash2
                                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                                        onClick={() => handleDelete(type)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                    <div className="relative z-10 bg-white backdrop-blur-md w-[600px] rounded-lg shadow-xl rounded-md">
                        <div className="flex items-center justify-between border-b border-gray-200 p-4 rounded-t-md">
                            <h1 className="text-xl font-bold">
                                {editingType ? 'Edit Type' : 'Add New Type'}
                            </h1>
                            <X onClick={closeModal} className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500" />
                        </div>
                        <form className="p-6" onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="" className="block text-sm font-medium mb-2 text-gray-900">
                                    Type Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    placeholder="e.g., server, switch, router"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300 text-gray-700"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="" className="block mb-2 text-gray-900 text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Brief description of this inventory type"
                                    rows={3}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg transition-all duration-200 outline-none focus:border-[#26599F] border-gray-300 text-gray-700"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Specifications
                                    </label>
                                    <Button
                                        type="button"
                                        size="xs"
                                        onClick={addSpecField}
                                        className="bg-[#26599F]"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Field
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {specFields.map((fieldName, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Field Name"
                                                    value={fieldName}
                                                    onChange={(e) => handleSpecChange(index, e.target.value)}
                                                    className="flex-1 p-2 border border-gray-300 rounded text-sm mr-2"
                                                />
                                                <Button
                                                    type="button"
                                                    size="xs"
                                                    color="red"
                                                    onClick={() => removeSpecField(fieldName)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    color="gray"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#26599F]"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <AppToast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
        </div>
    );
}