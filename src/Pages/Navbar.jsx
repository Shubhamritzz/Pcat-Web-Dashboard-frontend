import { useState, useEffect } from "react";
import { api } from './../Utils/api';
import {
    UploadCloud,
    Plus,
    Trash2,
    GripVertical,
    Save,
    X,
    Pencil,
    Zap,
    Loader2
} from 'lucide-react';
import { toast } from "react-toastify";
import Section from "../components/Section";


// Menu item editor
const MenuItemsEditor = ({ item, onUpdate, onRemove, isEditable }) => {

    // this add new Submenu in array after click on new Submenu
    const addSubItem = () => {
        const newSub = {
            id: crypto.randomUUID(),
            title: '',
            url: ''
        };
        const allSub = [...(item.subItems || []), newSub];
        onUpdate(item.id, { ...item, subItems: allSub });
    };

    // handle remove submenu Item
    const removeSubItem = (sid) => {
        const filtered = (item.subItems || []).filter((s) => s.id !== sid);
        onUpdate(item.id, { ...item, subItems: filtered });
    };

    // handle change in fields of menu items
    const handleMenuFieldChange = (field, value) => {
        onUpdate(item.id, { ...item, [field]: value });
    };

    // handle change in fields of Submenu items
    const handleSubChange = (sid, field, value) => {
        const updated = (item.subItems || []).map((sub) =>
            sub.id === sid ? { ...sub, [field]: value } : sub
        );
        onUpdate(item.id, { ...item, subItems: updated });
    };

    return (
        <div className="border border-blue-200/60 rounded-xl p-5 mb-5 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            {/* menu items */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <GripVertical className="hidden md:block text-blue-400 cursor-move" />
                <input
                    type="text"
                    placeholder="Main Menu Title"
                    value={item.title}
                    onChange={(e) => handleMenuFieldChange('title', e.target.value)}
                    disabled={!isEditable}
                    className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2 w-full md:w-1/3 disabled:bg-gray-50/70 transition-colors"
                />
                <input
                    type="text"
                    placeholder="URL (e.g., /about)"
                    value={item.url}
                    onChange={(e) => handleMenuFieldChange('url', e.target.value)}
                    disabled={!isEditable}
                    className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2 w-full md:w-1/3 disabled:bg-gray-50/70 transition-colors"
                />
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 select-none cursor-pointer">
                    <input
                        type="checkbox"
                        className="accent-blue-600 w-4 h-4 rounded"
                        checked={item.isVisible}
                        onChange={(e) => handleMenuFieldChange('isVisible', e.target.checked)}
                        disabled={!isEditable}
                    />
                    <span className={item.isVisible ? "text-blue-600" : "text-gray-500"}>
                        {item.isVisible ? "Visible" : "Hidden"}
                    </span>
                </label>
                {isEditable && (
                    <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 transition p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Subitems */}
            {(item.subItems || []).length > 0 && (
                <p className="flex items-center text-blue-600 text-base font-semibold mt-4 mb-3 ml-4 md:ml-10 gap-2">
                    <Zap className="w-4 h-4" /> Sub-Menu Items
                </p>
            )}
            <div className={`pl-6 md:pl-12 mt-2 border-l-2 border-blue-100`}>
                {(item.subItems || []).map((sub) => (
                    <div key={sub.id} className="flex flex-col sm:flex-row gap-3 mb-3 items-center p-2 rounded-lg bg-blue-50/50">
                        <input
                            type="text"
                            placeholder="Sub-Item Title"
                            value={sub.title}
                            onChange={(e) => handleSubChange(sub.id, 'title', e.target.value)}
                            disabled={!isEditable}
                            className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-lg px-3 py-2 w-full sm:w-1/3 text-sm disabled:bg-white transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Sub-Item URL"
                            value={sub.url}
                            onChange={(e) => handleSubChange(sub.id, 'url', e.target.value)}
                            disabled={!isEditable}
                            className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-lg px-3 py-2 w-full sm:w-1/3 text-sm disabled:bg-white transition-colors"
                        />
                        {isEditable && (
                            <button
                                onClick={() => removeSubItem(sub.id)}
                                className="text-gray-500 hover:text-red-500 transition p-1 rounded-full hover:bg-white focus:outline-none">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {isEditable && (
                    <button
                        type="button"
                        onClick={addSubItem}
                        className="mt-3 text-sm text-blue-700 bg-blue-100 p-2 px-4 rounded-full cursor-pointer hover:bg-blue-200 transition flex items-center gap-1 font-medium shadow-sm">
                        <Plus className="w-4 h-4" /> Add Sub Item
                    </button>
                )}
            </div>
        </div>
    );
};

// Main Navbar component
function Navbar() {
    const [formData, setFormData] = useState({});
    const [isEditable, setIsEditable] = useState(false);
    const [sending, setsending] = useState(false);

    // Fetch backend data to show on fields after or before the data dend
    useEffect(() => {
        const fetchNavbar = async () => {
            try {
                const res = await api.get('/navbar/getnavbar');
                const data = res.data?.data || {};

            
                const fixedMenu = (data.menuItems || []).map((item) => ({
                    ...item,
                    id: item.id || crypto.randomUUID(),
                    subItems: (item.subItems || []).map((sub) => ({
                        ...sub,
                        id: sub.id || crypto.randomUUID(),
                    })),
                }));

                setFormData({ ...data, menuItems: fixedMenu });
                setIsEditable(false);
            } catch (err) {
                console.error("Error fetching navbar:", err);
                toast.error("Failed to load navbar data ",err.message);
            }
        };
        fetchNavbar();
    }, []);

    // this add new menu in array after click on new mwnu
    const addMenuNewItem = () => {
        const newItem = {
            id: crypto.randomUUID(),
            title: '',
            url: '',
            isVisible: true,
            subItems: []
        };
        setFormData((prev) => ({
            ...prev,
            menuItems: [...(prev?.menuItems || []), newItem]
        }));
    };

    // update subMenu item coming from menuItems and check is and update
    const updatesubMenuItem = (id, updatedItem) => {
        setFormData((prev) => ({
            ...prev,
            menuItems: (prev.menuItems || []).map((item) => (item.id === id ? updatedItem : item))
        }));
    };

    // handle remove menu item
    const removeMenuItem = (id) => {
        setFormData((prev) => ({
            ...prev,
            menuItems: (prev.menuItems || []).filter((p) => p.id !== id)
        }));
    };

    //handle logo
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setFormData((prev) => ({
                ...prev,
                url: file,
                logoPreview: preview,
            }));
        }
    };

    //handle company deatils 
    const handleCompanyDetails = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            companyDetail: { ...(prev.companyDetail || {}), [field]: value }
        }));
    };

    // send data to backend
    const onformSubmit = async (e) => {
        e.preventDefault();
        setsending(true);
        try {
            const res = await api.put('/navbar/updatenavbar', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(res);
            setIsEditable(false);
            setsending(false);
            if (res.data.success) {
                toast.success('Navbar updated successfully! ');
            } else {
                toast.error('Failed to update navbar! ')
            }
        } catch (error) {
            console.error("Error updating navbar:", error.response?.data || error);
            toast.error(`Error: ${error.response?.data?.message || 'Update failed.'}`);
            setsending(false);
        }
    };

    if (Object.keys(formData).length === 0) return <div className="p-6 text-center text-xl text-gray-500"><Loader2 className="w-6 h-6 inline-block animate-spin mr-2" />Loading Navbar ...</div>;

    return (
        <div className="bg-gray-50 min-h-screen rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
            <header className="flex justify-between items-center mb-10 border-b pb-4 border-blue-100">
                <h2 className="text-2xl md:text-4xl font-bold flex justify-center items-center text-black-500">
                    <Pencil className="w-6 text-blue-500 h-6 inline-block mr-2 align-text-bottom" /> Navbar Managment
                </h2>
                <div className="flex gap-3">
                    {!isEditable && (
                        <button
                            type="button"
                            onClick={() => setIsEditable(true)}
                            className="bg-blue-500 text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition text-base font-semibold flex items-center gap-2 shadow-lg shadow-blue-200/50 cursor-pointer">
                            <Pencil className="w-5 h-5" /> Edit Mode
                        </button>
                    )}
                </div>
            </header>

            <form onSubmit={onformSubmit}>
                {/* Logo */}
                <Section title="Logo & Branding">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-lg shadow-inner">
                        <div className="w-32 h-32 border-4 border-blue-500 border-dashed rounded-xl flex items-center justify-center bg-blue-50/50  p-2 overflow-hidden">
                            {formData?.logoPreview || formData?.logo?.url ? (
                                <img src={formData.logoPreview || formData.logo.url} alt="Logo" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <UploadCloud className="w-10 h-10" />
                            )}
                        </div>
                        {isEditable && (
                            <input
                                type="file"
                                onChange={handleLogoChange}
                                accept="image/*"
                                className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
                            />
                        )}
                        <div className="mt-2 w-full max-w-sm">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Alt Text</label>
                            <input
                                type="text"
                                value={formData.logo?.altText || ''}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        logo: { ...(prev.logo || {}), altText: e.target.value },
                                    }))
                                }
                                disabled={!isEditable}
                                placeholder="Descriptive text for the logo"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                            />
                        </div>
                    </div>
                </Section>

                {/* Company details */}
                <Section title="Company Details">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-white rounded-lg shadow-inner">
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={formData.companyDetail?.name || ''}
                            onChange={(e) => handleCompanyDetails('name', e.target.value)}
                            disabled={!isEditable}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Tagline"
                            value={formData.companyDetail?.tagline || ''}
                            onChange={(e) => handleCompanyDetails('tagline', e.target.value)}
                            disabled={!isEditable}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                        />
                        <input
                            type="number"
                            placeholder="Founded Year (e.g., 2023)"
                            value={formData.companyDetail?.foundyear || ''}
                            onChange={(e) => handleCompanyDetails('foundyear', e.target.value)}
                            disabled={!isEditable}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                        />
                    </div>
                </Section>

                {/* Menu Items */}
                <Section title="Navigation Menu Items">
                    {isEditable && (
                        <div className="flex justify-end mb-6">
                            <button
                                type="button"
                                onClick={addMenuNewItem}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition text-base font-semibold flex items-center gap-2 shadow-lg shadow-blue-300/50">
                                <Plus className="w-5 h-5" /> Add New Menu
                            </button>
                        </div>
                    )}

                    {(formData.menuItems || []).map((item) => (
                        <MenuItemsEditor
                            key={item.id}
                            item={item}
                            onUpdate={updatesubMenuItem}
                            onRemove={removeMenuItem}
                            isEditable={isEditable}
                        />
                    ))}

                    {(formData.menuItems || []).length === 0 && (
                        <p className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-200 rounded-xl">
                            No menu items defined yet. Click "Add New Menu" to start!
                        </p>
                    )}

                </Section>

                {/* Buttons */}
                <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end gap-4">
                    {isEditable && (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditable(false);
                                    toast.info('Edit mode cancelled. Changes were not saved.');
                                }}
                                className="bg-red-500 text-white px-6 py-2.5 rounded-full hover:bg-red-600 transition text-base font-semibold flex items-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className={`px-8 py-2.5 rounded-full text-base font-semibold flex items-center gap-2 transition ${sending
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-300/50'
                                    }`}>
                                {sending ? (
                                    <p>Saving...</p>
                                ) : (
                                    <><Save className="w-5 h-5" /> Save Changes</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Navbar;