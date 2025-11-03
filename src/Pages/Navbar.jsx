import { useState, useEffect } from "react";
import { api } from './../Utils/api';
import {
    UploadCloud,
    Plus,
    Trash2,
    GripVertical,
    Save,
    X,
    Pencil
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
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50/50">
            {/* menu items */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <GripVertical className="hidden md:block text-gray-400" />
                <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => handleMenuFieldChange('title', e.target.value)}
                    disabled={!isEditable}
                    className="border rounded-md px-3 py-2 w-full md:w-1/3 disabled:bg-gray-100"
                />
                <input
                    type="text"
                    placeholder="URL (e.g., /about)"
                    value={item.url}
                    onChange={(e) => handleMenuFieldChange('url', e.target.value)}
                    disabled={!isEditable}
                    className="border rounded-md px-3 py-2 w-full md:w-1/3 disabled:bg-gray-100"
                />
                <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
                    <input
                        type="checkbox"
                        className="accent-blue-600 w-4 h-4"
                        checked={item.isVisible}
                        onChange={(e) => handleMenuFieldChange('isVisible', e.target.checked)}
                        disabled={!isEditable}
                    />
                    Visible
                </label>
                {isEditable && (
                    <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 transition p-1">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Subitems */}
            <div className="pl-6 md:pl-12 mt-4">
                {(item.subItems || []).map((sub) => (
                    <div key={sub.id} className="flex flex-col sm:flex-row gap-2 mb-3 items-center">
                        <input
                            type="text"
                            placeholder="Sub Title"
                            value={sub.title}
                            onChange={(e) => handleSubChange(sub.id, 'title', e.target.value)}
                            disabled={!isEditable}
                            className="border rounded-md px-3 py-2 w-full sm:w-1/3 disabled:bg-gray-100"
                        />
                        <input
                            type="text"
                            placeholder="Sub URL"
                            value={sub.url}
                            onChange={(e) => handleSubChange(sub.id, 'url', e.target.value)}
                            disabled={!isEditable}
                            className="border rounded-md px-3 py-2 w-full sm:w-1/3 disabled:bg-gray-100"
                        />
                        {isEditable && (
                            <button
                                onClick={() => removeSubItem(sub.id)}
                                className="text-gray-400 hover:text-red-500 transition p-1">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {isEditable && (
                    <button
                        type="button"
                        onClick={addSubItem}
                        className="text-sm text-white bg-blue-600 p-2 rounded-md cursor-pointer hover:bg-blue-700 flex items-center gap-1 w-[125px]">
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
    const [isEditable, setIsEditable] = useState(true);
    const [sending, setsending] = useState(false);

    // Fetch backend data to show on fields after or before the data dend
    useEffect(() => {
        const fetchNavbar = async () => {
            try {
                const res = await api.get('/navbar/getnavbar');
                const data = res.data?.data || {};

                //  Ensure all IDs are unique
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
            menuItems: prev.menuItems.map((item) => (item.id === id ? updatedItem : item))
        }));
    };

    // handle remove menu item
    const removeMenuItem = (id) => {
        setFormData((prev) => ({
            ...prev,
            menuItems: prev.menuItems.filter((p) => p.id !== id)
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
            companyDetail: { ...prev.companyDetail, [field]: value }
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
                toast.success('Navbar updated successfully!');
            } else {
                toast.error('Failed to update navbar!')
            }
        } catch (error) {
            console.error("Error updating navbar:", error.response?.data || error);
            setsending(false);
        }
    };

    if (!formData) return <div className="p-6">Loading...</div>;

    return (
        <div className="bg-white min-h-screen rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center md:text-left">
                Navbar Configuration
            </h2>

            <form onSubmit={onformSubmit}>
                {/* Logo */}
                <Section title="Logo & Branding">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-28 h-28 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                            {formData?.logo ? (
                                <img src={formData.logoPreview || formData?.logo?.url} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <UploadCloud className="w-8 h-8" />
                            )}
                        </div>
                        {isEditable && (
                            <input
                                type="file"
                                onChange={handleLogoChange}
                                accept="image/*"
                                className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                            />
                        )}
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt Text</label>
                        <input
                            type="text"
                            value={formData.logo?.altText || ''}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    logo: { ...prev.logo, altText: e.target.value },
                                }))
                            }
                            disabled={!isEditable}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                    </div>
                </Section>

                {/* Company details */}
                <Section title="Company Details">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={formData.companyDetail?.name || ''}
                            onChange={(e) => handleCompanyDetails('name', e.target.value)}
                            disabled={!isEditable}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                        <input
                            type="text"
                            placeholder="Tagline"
                            value={formData.companyDetail?.tagline || ''}
                            onChange={(e) => handleCompanyDetails('tagline', e.target.value)}
                            disabled={!isEditable}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                        <input
                            type="number"
                            placeholder="Founded Year"
                            value={formData.companyDetail?.foundyear || ''}
                            onChange={(e) => handleCompanyDetails('foundyear', e.target.value)}
                            disabled={!isEditable}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                    </div>
                </Section>

                {/* Menu Items */}
                <Section title="Menu Items">
                    {isEditable && (
                        <div className="flex justify-end mb-4">
                            <button
                                type="button"
                                onClick={addMenuNewItem}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Menu Item
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
                </Section>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                    {!isEditable && (
                        <button
                            type="button"
                            onClick={() => setIsEditable(true)}
                            className="bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-600 transition text-base font-medium flex items-center gap-2">
                            <Pencil className="w-5 h-5" /> Edit
                        </button>
                    )}
                    {isEditable && (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditable(false)}
                                className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition text-base font-medium flex items-center gap-2">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 transition text-base font-medium flex items-center gap-2">
                                {sending ? <p>Sending....</p> :
                                    <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}

export default Navbar;
