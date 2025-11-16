import { useState, useEffect } from "react";
import { X, Image, Trash2, Edit, Plus, Link } from "lucide-react";
import { api } from "../Utils/api";
import { toast } from "react-toastify";

export default function SingleProductModel({
    isOpen,
    onClose,
    editingSingleProduct,
    fetchMenuData,
    categories,
    submenus,
    fetchProducts
}) {
    const [sending, setSending] = useState(false);

    const [products, setProducts] = useState([]);
    const [filteredSubmenus, setFilteredSubmenus] = useState([]);
    const [filteredProductNames, setFilteredProductNames] = useState([]);

    

    const [form, setForm] = useState({
        category: "",
        submenu: "",
        productName: "",
        title: "",
        title2: "",
        description: "",
        description2: "",
        bannerImage: null,
        bannerImagePreview: null,
        productDetails: [],
    });

   
    

    const fetchAllProducts = async () => {
        try {
            const res = await api.get("/products/getproduct");
            // console.log(res);
            
            setProducts(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchMenuData();
        fetchAllProducts();
    }, []);


    // Prefill form for editing
    
    useEffect(() => {
        if (editingSingleProduct) {
            setForm({
                category: editingSingleProduct.category || "",
                submenu: editingSingleProduct.submenu || "",
                productName: editingSingleProduct.productName || "",

                title: editingSingleProduct.title || "",
                title2: editingSingleProduct.title2 || "",
                description: editingSingleProduct.description || "",
                description2: editingSingleProduct.description2 || "",

                bannerImage: null,
                bannerImagePreview: editingSingleProduct.bannerImage || null,

                // FIX DETAIL IMAGES PREVIEW
                productDetails: editingSingleProduct.productDetails?.map(d => ({
                    title: d.title,
                    description: d.description,
                    productimage: null,
                    preview: d.productimage || null
                })) || [],
            });


        } else {
            setForm({
                category: "",
                submenu: "",
                productName: "",
                title: "",
                title2: "",
                description: "",
                description2: "",
                bannerImage: null,
                bannerImagePreview: null,
                productDetails: [],
            });
        }
    }, [editingSingleProduct]);

    
    // Filter submenus based on category
    
    useEffect(() => {
        if (form.category) {
            const filtered = submenus.filter((s) => s.parent === form.category);
            setFilteredSubmenus(filtered);
            // Reset submenu and product name if category changes
            if (!filtered.some(s => s.title === form.submenu)) {
                setForm((prev) => ({ ...prev, submenu: "", productName: "" }));
            }
        } else {
            setFilteredSubmenus([]);
        }
    }, [form.category, submenus]);

    
    // Filter PRODUCT NAMES based on category + submenu
    
    useEffect(() => {
        if (form.category && form.submenu) {
            const filtered = products.filter(
                (p) =>
                    p.category === form.category &&
                    p.submenu === form.submenu
            );
            setFilteredProductNames(filtered);
        } else {
            setFilteredProductNames([]);
        }
    }, [form.category, form.submenu, products]);

    
    // Handle input field change
    
    const handleChanges = (id, value) => {
        setForm((prev) => ({ ...prev, [id]: value }));
    };

    
    // Image upload logic
    
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

    
    // Remove banner image preview
    
    const handleImageDelete = () => {
        setForm((prev) => ({
            ...prev,
            bannerImage: null,
            bannerImagePreview: null,
        }));
    };

    
    // Add item to productDetails[]
    
    const addDetail = () => {
        setForm((prev) => ({
            ...prev,
            productDetails: [
                ...prev.productDetails,
                { title: "", description: "", productimage: null, preview: null },
            ],
        }));
    };

    
    // Handle individual detail updates
    
    const updateDetail = (index, key, value) => {
        const updated = [...form.productDetails];
        updated[index][key] = value;
        setForm((prev) => ({ ...prev, productDetails: updated }));
    };

    const updateDetailImage = (index, file) => {
        if (!file) { 
            const updated = [...form.productDetails];
            updated[index].productimage = null;
            updated[index].preview = null;
            setForm((prev) => ({ ...prev, productDetails: updated }));
            return;
        }

        const preview = URL.createObjectURL(file);
        const updated = [...form.productDetails];
        updated[index].productimage = file;
        updated[index].preview = preview;
        setForm((prev) => ({ ...prev, productDetails: updated }));
    };

    const removeDetail = (index) => {
        const updated = [...form.productDetails];
        updated.splice(index, 1);
        setForm((prev) => ({ ...prev, productDetails: updated }));
    };

    
    // Submit form
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const formData = new FormData();

            formData.append("category", form.category);
            formData.append("submenu", form.submenu);
            formData.append("productName", form.productName);
            formData.append("title", form.title);
            formData.append("title2", form.title2);
            formData.append("description", form.description);
            formData.append("description2", form.description2);

            if (form.bannerImage) {
                formData.append("bannerImage", form.bannerImage);
            }

            form.productDetails.forEach((item, idx) => {
                formData.append(`productDetails[${idx}].title`, item.title);
                formData.append(`productDetails[${idx}].description`, item.description);

                if (item.productimage instanceof File) {
                    formData.append(
                        `productDetails[${idx}].productimage`,
                        item.productimage
                    );
                }
            });

            const endpoint = editingSingleProduct
                ? `/singleproduct/updatesingleproduct/${editingSingleProduct._id}`
                : "/singleproduct/addsingleproduct";

            const method = editingSingleProduct ? api.put : api.post;

            const res = await method(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                toast.success(editingSingleProduct ? "Updated!" : "Created!");
                onClose();
                fetchProducts();

            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSending(false);
        }
    };


    if (!isOpen) return null;

    const inputStyle =
        "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

    // Reusable ImageDropzone component adapted from ProductModel
    const ImageDropzone = ({ name, label, preview, onChange, onDelete, hideLabel = false, containerClass = "" }) => (
        <div className={`flex flex-col ${containerClass}`}>
            {!hideLabel && (
                <label htmlFor={name} className={labelStyle}>
                    {label}
                </label>
            )}
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
                        <span className="text-xs font-medium">{label}</span>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90%] overflow-y-scroll p-8 border border-blue-100">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-blue-100">
                    <h2 className="text-2xl font-extrabold text-blue-700 flex items-center gap-3">
                        <Edit className="w-6 h-6" />
                        {editingSingleProduct ? "Edit Single Product" : "Add New Single Product"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-red-600 bg-gray-100 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <X className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* CATEGORY */}
                    <div>
                        <label htmlFor="category" className={labelStyle}>Category *</label>
                        <select
                            id="category"
                            className={inputStyle}
                            value={form.category}
                            onChange={(e) => handleChanges("category", e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories
                                .filter((cat) => cat.subItems && cat.subItems.length > 0)
                                .map((c) => (
                                    <option key={c.title} value={c.title}>
                                        {c.title}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* SUBMENU */}
                    <div>
                        <label htmlFor="submenu" className={labelStyle}>Submenu *</label>
                        <select
                            id="submenu"
                            className={inputStyle}
                            value={form.submenu}
                            onChange={(e) => handleChanges("submenu", e.target.value)}
                            required
                            disabled={!form.category}
                        >
                            <option value="">Select Submenu</option>
                            {filteredSubmenus.map((s) => (
                                <option key={s.title} value={s.title}>
                                    {s.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* PRODUCT NAME (LINK PRODUCT) */}
                    <div>
                        <label htmlFor="productName" className={labelStyle}>Product Name *</label>
                        <select
                            id="productName"
                            className={inputStyle}
                            value={form.productName}
                            onChange={(e) => handleChanges("productName", e.target.value)}
                            disabled={!form.submenu}
                            required
                        >
                            <option value="">Select Product Name</option>
                            {filteredProductNames.map((p) => (
                                <option key={p._id} value={p.title}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TITLE 1 */}
                    <div>
                        <label htmlFor="title" className={labelStyle}>Title *</label>
                        <input
                            id="title"
                            className={inputStyle}
                            value={form.title}
                            onChange={(e) => handleChanges("title", e.target.value)}
                            placeholder="Main Product Title"
                            required
                        />
                    </div>

                    {/* TITLE 2 */}
                    <div>
                        <label htmlFor="title2" className={labelStyle}>Title 2</label>
                        <input
                            id="title2"
                            className={inputStyle}
                            value={form.title2}
                            onChange={(e) => handleChanges("title2", e.target.value)}
                            placeholder="Optional secondary title"
                        />
                    </div>

                    {/* BANNER IMAGE */}
                    <ImageDropzone
                        name="bannerImage"
                        label="Banner Image"
                        preview={form.bannerImagePreview}
                        onChange={(e) => handleFileChange(e, "bannerImage")}
                        onDelete={handleImageDelete}
                        containerClass="lg:col-span-1"
                    />

                    {/* DESCRIPTION 1 */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label htmlFor="description" className={labelStyle}>Description 1</label>
                        <textarea
                            id="description"
                            className={inputStyle + " h-20 resize-none"}
                            value={form.description}
                            onChange={(e) => handleChanges("description", e.target.value)}
                            placeholder="Enter main product description"
                        ></textarea>
                    </div>

                    {/* DESCRIPTION 2 */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label htmlFor="description2" className={labelStyle}>Description 2</label>
                        <textarea
                            id="description2"
                            className={inputStyle + " h-20 resize-none"}
                            value={form.description2}
                            onChange={(e) => handleChanges("description2", e.target.value)}
                            placeholder="Enter secondary product description"
                        ></textarea>
                    </div>


                    {/* PRODUCT DETAILS SECTION */}
                    <div className="md:col-span-2 lg:col-span-3 border-t pt-4 border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Link className="w-5 h-5" /> Product Details (Sections)
                            </h3>
                            <button
                                type="button"
                                onClick={addDetail}
                                className="bg-blue-600 text-white px-4 py-2 rounded-full flex gap-2 items-center hover:bg-blue-700 transition"
                            >
                                <Plus className="w-5 h-5" /> Add Detail Section
                            </button>
                        </div>

                        {form.productDetails.map((item, index) => (
                            <div key={index} className="border border-blue-200 bg-blue-50/30 p-4 rounded-xl mb-4 relative">
                                <h4 className="text-md font-semibold mb-3 text-blue-700">Detail Section #{index + 1}</h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* TITLE */}
                                    <div className="md:col-span-2">
                                        <label htmlFor={`detail-title-${index}`} className={labelStyle}>Detail Title</label>
                                        <input
                                            id={`detail-title-${index}`}
                                            className={inputStyle}
                                            placeholder="Section Title"
                                            value={item.title}
                                            onChange={(e) => updateDetail(index, "title", e.target.value)}
                                        />
                                    </div>

                                    {/* IMAGE UPLOAD */}
                                    <ImageDropzone
                                        name={`detail-image-${index}`}
                                        label="Upload Detail Image"
                                        preview={item.preview}
                                        onChange={(e) => updateDetailImage(index, e.target.files[0])}
                                        onDelete={() => updateDetailImage(index, null)}
                                        hideLabel={true}
                                    />
                                </div>


                                {/* DESCRIPTION */}
                                <div className="mt-3">
                                    <label htmlFor={`detail-description-${index}`} className={labelStyle}>Detail Description</label>
                                    <textarea
                                        id={`detail-description-${index}`}
                                        className={inputStyle + " h-20 resize-none"}
                                        placeholder="Section Description"
                                        value={item.description}
                                        onChange={(e) =>
                                            updateDetail(index, "description", e.target.value)
                                        }
                                    ></textarea>
                                </div>

                                {/* REMOVE BUTTON */}
                                <button
                                    type="button"
                                    onClick={() => removeDetail(index)}
                                    className="absolute top-1 right-1 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
                                    title="Remove Detail Section"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* SUBMIT BUTTONS */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 md:col-span-2 lg:col-span-3">
                        <button
                            type="button"
                            onClick={() => {
                                onClose(),
                                    toast.info('Operation cancelled.')
                            }}
                            className={`px-6 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition font-medium ${sending ? ' cursor-not-allowed' : 'cursor-pointer'} `}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={sending}
                            className={`px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition ${sending ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {sending ? "Saving..." : editingSingleProduct ? "Update Single Product" : "Create Single Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}