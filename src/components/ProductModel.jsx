import { useState, useEffect } from "react";
import { X, Link, Image, Trash2, Edit } from "lucide-react";
import { api } from "../Utils/api";
import { toast } from "react-toastify";

export default function ProductModel({ isOpen, onClose, fetchProducts, editingProduct, fetchMenuData, categories, submenus, }) {
    const [sending, setsending] = useState(false);

    const [filteredSubmenus, setFilteredSubmenus] = useState([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        viewImage: null,
        hoverImage: null,
        viewImagePreview: null,
        hoverImagePreview: null,
        categoryTitle: "",
        submenuTitle: "",
        url: "",
    });

    // Fetch navbar menu + submenu data
    useEffect(() => {
        fetchMenuData();
    }, []);

    // Prefill form for editing
    useEffect(() => {
        if (editingProduct) {
            setForm({
                title: editingProduct.title || "",
                description: editingProduct.description || "",
                categoryTitle: editingProduct.categoryTitle || "",
                submenuTitle: editingProduct.submenuTitle || "",
                url: editingProduct.url || "",
                viewImagePreview: editingProduct.viewImage || null,
                hoverImagePreview: editingProduct.hoverImage || null,
                viewImage: null,
                hoverImage: null,
            });
        } else {
            setForm({
                title: "",
                description: "",
                categoryTitle: "",
                submenuTitle: "",
                url: "",
                viewImage: null,
                hoverImage: null,
                viewImagePreview: null,
                hoverImagePreview: null,
            });
        }
    }, [editingProduct]);

    // Filter submenus dynamically
    useEffect(() => {
        if (form.categoryTitle) {
            const filtered = submenus.filter(
                (sub) => sub.parent === form.categoryTitle
            );
            setFilteredSubmenus(filtered);
        } else {
            setFilteredSubmenus([]);
        }
    }, [form.categoryTitle, submenus]);

    // Auto-select submenu when editing and category/submenu exist
    // useEffect(() => {
    //     if (editingProduct && editingProduct.categoryTitle) {
    //         const relatedSubmenus = submenus.filter(
    //             (sub) => sub.parent === editingProduct.categoryTitle
    //         );
    //         setFilteredSubmenus(relatedSubmenus);
    //     }
    // }, [submenus, editingProduct]);

    const handleChanges = (id, value) => {
        setForm((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setForm((prev) => ({
                ...prev,
                [field]: file,
                [`${field}Preview`]: preview,
            }));
        }
    };

    const handleImageDelete = (field) => {
        setForm((prev) => ({
            ...prev,
            [field]: null,
            [`${field}Preview`]: null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setsending(true);
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("url", form.url);
            formData.append("categoryTitle", form.categoryTitle);
            formData.append("submenuTitle", form.submenuTitle);
            if (form.viewImage) formData.append("viewImage", form.viewImage);
            if (form.hoverImage) formData.append("hoverImage", form.hoverImage);

            const endpoint = editingProduct
                ? `/products/updateproduct/${editingProduct._id}`
                : "/products/addnewproduct";
            const method = editingProduct ? api.put : api.post;

            const res = await method(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                toast.success(editingProduct ? "Product updated!" : "Product created!");
                if (!editingProduct) {

                    setForm({
                        title: "",
                        description: "",
                        viewImage: null,
                        hoverImage: null,
                        viewImagePreview: null,
                        hoverImagePreview: null,
                        categoryTitle: "",
                        submenuTitle: "",
                        url: "",
                    });
                }
                onClose();
                fetchProducts();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            toast.error(error.response?.data.message);
        } finally {
            setsending(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle =
        "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

    const ImageDropzone = ({ name, label, preview, onChange, onDelete }) => (
        <div className="flex flex-col items-center">
            <label htmlFor={name} className={labelStyle}>
                {label}
            </label>
            <div className="w-full h-32 border-2 border-dashed border-blue-300 rounded-lg p-2 flex flex-col items-center justify-center bg-blue-50/50 cursor-pointer hover:bg-blue-100 transition-colors relative">
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-md"
                        />
                        <button
                            type="button"
                            onClick={onDelete}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-700 transition shadow-md"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </>
                ) : (
                    <div className="text-blue-600 text-center">
                        <Image className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs font-medium">Upload {label}</span>
                    </div>
                )}
                <input
                    id={name}
                    name={name}
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 border border-blue-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-blue-100">
                    <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-3">
                        <Edit className="w-6 h-6" />
                        {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <X className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <div>
                        <label htmlFor="categoryTitle" className={labelStyle}>
                            Category *
                        </label>
                        <select
                            id="categoryTitle"
                            value={form.categoryTitle}
                            onChange={(e) => handleChanges("categoryTitle", e.target.value)}
                            className={inputStyle}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat.title}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="submenuTitle" className={labelStyle}>
                            Submenu
                        </label>
                        <select
                            id="submenuTitle"
                            value={form.submenuTitle}
                            onChange={(e) => handleChanges("submenuTitle", e.target.value)}
                            className={inputStyle}
                            disabled={!form.categoryTitle}
                        >
                            <option value="">Select Submenu</option>
                            {filteredSubmenus.map((sub, idx) => (
                                <option key={idx} value={sub.title}>
                                    {sub.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="title" className={labelStyle}>
                            Title *
                        </label>
                        <input
                            id="title"
                            value={form.title}
                            onChange={(e) => handleChanges("title", e.target.value)}
                            className={inputStyle}
                            placeholder="Product Name"
                            required
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <label htmlFor="description" className={labelStyle}>
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={form.description}
                            onChange={(e) => handleChanges("description", e.target.value)}
                            className={inputStyle + " h-24 resize-none"}
                            placeholder="Enter product details..."
                        />
                    </div>

                    <div>
                        <label htmlFor="url" className={labelStyle}>
                            URL
                        </label>
                        <div className="relative">
                            <input
                                id="url"
                                value={form.url}
                                onChange={(e) => handleChanges("url", e.target.value)}
                                className={inputStyle + " pl-8"}
                                placeholder="/products/item-slug"
                            />
                            <Link className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                        </div>
                    </div>

                    <ImageDropzone
                        name="hoverImage"
                        label="Hover Image"
                        preview={form.hoverImagePreview}
                        onChange={(e) => handleFileChange(e, "hoverImage")}
                        onDelete={() => handleImageDelete("hoverImage")}
                    />

                    <ImageDropzone
                        name="viewImage"
                        label="View Image"
                        preview={form.viewImagePreview}
                        onChange={(e) => handleFileChange(e, "viewImage")}
                        onDelete={() => handleImageDelete("viewImage")}
                    />

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100 md:col-span-2 lg:col-span-3">
                        <button
                            type="button"
                            onClick={() => {
                                onClose(),
                                toast.info('Edit mode cancelled. Changes were not saved.')
                            }}
                            className={`px-6 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition font-medium ${sending ? ' cursor-not-allowed': 'cursor-pointer'} `}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={sending}
                            className={`px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold shadow-lg flex items-center gap-1 ${sending ? 'cursor-not-allowed' :'cursor-pointer'} `}
                        >
                            {sending ? "Saving..." : (
                                <>
                                    <Edit className="w-4 h-4" />
                                    {editingProduct ? "Update Product" : "Create Product"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
