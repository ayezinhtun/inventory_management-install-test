import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from 'flowbite-react';
import { 
    getInventoryTypes, 
    createInventoryType, 
    updateInventoryType, 
    deleteInventoryType 
} from '../../context/TypeContext';
import AppToast from '../toast/Toast';

export default function TypeManagement({ onTypesChange, showToast }) {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [specFields, setSpecFields] = useState([]);

    const [form, setForm] = useState({
        name: '',
        description: '',
        specifications: {}
    });

    useEffect(() => {
        loadTypes();
    }, []);

    useEffect(() => {
        if (onTypesChange && types.length > 0) {
            onTypesChange(types);
        }
    }, [types, onTypesChange]);

    const loadTypes = async () => {
        try {
            setLoading(true);
            const data = await getInventoryTypes();
            setTypes(data || []);
            if (onTypesChange) {
                onTypesChange(data || []);
            }
        } catch (error) {
            const errorMessage = 'Failed to load inventory types';
            setToast({
                type: 'error',
                message: errorMessage
            });
            if (showToast) {
                showToast({ type: 'error', message: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            specifications: {}
        });
        setSpecFields([]);
        setEditingType(null);
    };

    const openModal = (type = null) => {
        if (type) {
            setForm({
                name: type.name,
                description: type.description || '',
                specifications: type.specifications || {}
            });
            setSpecFields(Object.keys(type.specifications || {}));
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
        
        if (specFields.includes(fieldName)) {
            setToast({
                type: 'error',
                message: 'Field name already exists'
            });
            return;
        }

        setSpecFields(prev => [...prev, fieldName]);
        setForm(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [fieldName]: {
                    type: 'text',
                    required: false,
                    label: fieldName.toUpperCase()
                }
            }
        }));
    };

    const removeSpecField = (fieldName) => {
        setSpecFields(prev => prev.filter(field => field !== fieldName));
        setForm(prev => {
            const newSpecs = { ...prev.specifications };
            delete newSpecs[fieldName];
            return { ...prev, specifications: newSpecs };
        });
    };

    const handleSpecChange = (fieldName, property, value) => {
        setForm(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [fieldName]: {
                    ...prev.specifications[fieldName],
                    [property]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingType) {
                await updateInventoryType(editingType.id, form);
                const successMessage = 'Type updated successfully!';
                setToast({
                    type: 'success',
                    message: successMessage
                });
                if (showToast) {
                    showToast({ type: 'success', message: successMessage });
                }
            } else {
                await createInventoryType(form);
                const successMessage = 'Type created successfully!';
                setToast({
                    type: 'success',
                    message: successMessage
                });
                if (showToast) {
                    showToast({ type: 'success', message: successMessage });
                }
            }
            
            await loadTypes();
            closeModal();
        } catch (error) {
            const errorMessage = `Failed to ${editingType ? 'update' : 'create'} type`;
            setToast({
                type: 'error',
                message: errorMessage
            });
            if (showToast) {
                showToast({ type: 'error', message: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type) => {
        if (!confirm(`Are you sure you want to delete "${type.name}"?`)) {
            return;
        }

        try {
            await deleteInventoryType(type.id);
            const successMessage = 'Type deleted successfully!';
            setToast({
                type: 'success',
                message: successMessage
            });
            if (showToast) {
                showToast({ type: 'success', message: successMessage });
            }
            await loadTypes();
        } catch (error) {
            const errorMessage = 'Failed to delete type';
            setToast({
                type: 'error',
                message: errorMessage
            });
            if (showToast) {
                showToast({ type: 'error', message: errorMessage });
            }
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Inventory Types</h3>
                <Button
                    size="sm"
                    onClick={() => openModal()}
                    className="bg-[#26599F]"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Type
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="space-y-2">
                    {types.map((type) => (
                        <div
                            key={type.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                            <div>
                                <div className="font-medium">{type.name}</div>
                                {type.description && (
                                    <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="xs"
                                    color="gray"
                                    onClick={() => openModal(type)}
                                >
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="xs"
                                    color="light"
                                    onClick={() => handleDelete(type)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                                    {specFields.map((fieldName) => (
                                        <div key={fieldName} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Field Label"
                                                    value={form.specifications[fieldName]?.label || ''}
                                                    onChange={(e) => handleSpecChange(fieldName, 'label', e.target.value)}
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

                                            <div className="grid grid-cols-3 gap-2">
                                                <select
                                                    value={form.specifications[fieldName]?.type || 'text'}
                                                    onChange={(e) => handleSpecChange(fieldName, 'type', e.target.value)}
                                                    className="p-2 border border-gray-300 rounded text-sm"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="ip">IP Address</option>
                                                </select>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.specifications[fieldName]?.required || false}
                                                        onChange={(e) => handleSpecChange(fieldName, 'required', e.target.checked)}
                                                        className="mr-2"
                                                    />
                                                    <label className="text-sm">Required</label>
                                                </div>

                                                {form.specifications[fieldName]?.type === 'number' && (
                                                    <input
                                                        type="number"
                                                        placeholder="Min value"
                                                        value={form.specifications[fieldName]?.min || ''}
                                                        onChange={(e) => handleSpecChange(fieldName, 'min', e.target.value ? Number(e.target.value) : null)}
                                                        className="p-2 border border-gray-300 rounded text-sm"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#26599F] text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
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