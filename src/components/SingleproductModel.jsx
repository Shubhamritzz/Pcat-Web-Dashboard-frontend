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
        description: "",
        images: [],
        specifications: [],
        keyFeatures: [],
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

    // useEffect(() => {
    //     if (editingSingleProduct) {
    //         setForm({
    //             category: editingSingleProduct.category || "",
    //             submenu: editingSingleProduct.submenu || "",
    //             productName: editingSingleProduct.productName || "",

    //             images: editingSingleProduct.images || [],
    //             specifications: editingSingleProduct.specifications || [],
    //             keyFeatures: editingSingleProduct.keyFeatures || [],

    //             description: editingSingleProduct.description || "",


    //         });


    //     } else {
    //         setForm({
    //             category: "",
    //             submenu: "",
    //             productName: "",
    //             description: "",
    //             images: [],
    //             specifications: [],
    //             keyFeatures: [],


    //         });
    //     }
    // }, [editingSingleProduct]);

    useEffect(() => {
        if (editingSingleProduct) {
            setForm({
                category: editingSingleProduct.category || "",
                submenu: editingSingleProduct.submenu || "",
                productName: editingSingleProduct.productName || "",
                description: editingSingleProduct.description || "",

                // FIX 1: Convert image URLs → { file:null, preview:url }
                images: (editingSingleProduct.Images || []).map(img => ({
                    file: null,
                    preview: img
                })),

                // FIX 2: Convert specifications to your UI structure
                specifications: (editingSingleProduct.Specifications || []).map(spec => ({
                    specTitle: spec.specTitle || "",
                    specDesc: spec.specDesc || ""
                })),

                // FIX 3: Convert keyFeatures if required
                keyFeatures: (editingSingleProduct.KeyFeatures || []).map(f => f)
            });
        } else {
            setForm({
                category: "",
                submenu: "",
                productName: "",
                description: "",
                images: [],
                specifications: [],
                keyFeatures: [],
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




    // Submit form

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            const formData = new FormData();

            // IMAGES
            form.images?.forEach((img) => {
                if (img.file) {
                    // new images
                    formData.append("Images", img.file);
                } else {
                    // old existing images
                    formData.append("ExistingImages[]", img.preview);
                }
            });


            // SPECIFICATIONS
            form.specifications?.forEach((spec, index) => {
                formData.append(`Specifications[${index}].specTitle`, spec.specTitle);
                formData.append(`Specifications[${index}].specDesc`, spec.specDesc);
            });

            // KEY FEATURES
            form.keyFeatures?.forEach((feat, index) => {
                formData.append(`KeyFeatures[${index}]`, feat);
            });


            formData.append("category", form.category);
            formData.append("submenu", form.submenu);
            formData.append("productName", form.productName);
            formData.append("description", form.description);



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
                    style={{ pointerEvents: preview ? "none" : "auto" }}
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


                    {/* IMAGES SECTION */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className={labelStyle}>Product Images {editingSingleProduct && 'Image will be replace'}</label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            {form.images?.map((img, index) => (
                                <ImageDropzone
                                    key={index}
                                    name={`image-${index}`}
                                    label={`Image ${index + 1}`}
                                    preview={img.preview}
                                    
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const preview = URL.createObjectURL(file);

                                        setForm(prev => {
                                            const updated = [...prev.images];

                                            // If empty placeholder image → replace it
                                            if (!updated[index].preview && !updated[index].file) {
                                                updated[index] = { file, preview };
                                            } else {
                                                // Otherwise add new image at the end
                                                updated.push({ file, preview });
                                            }

                                            return { ...prev, images: updated };
                                        });
                                    }}

                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        const updated = [...form.images];
                                        updated.splice(index, 1);
                                        setForm(prev => ({ ...prev, images: updated }));
                                    }}
                                />
                            ))}

                            <button
                                type="button"
                                onClick={() =>
                                    setForm(prev => ({
                                        ...prev,
                                        images: [...(prev.images || []), { file: null, preview: '' }]
                                    }))
                                }
                                className="p-3 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>


                    {/* SPECIFICATIONS */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className={labelStyle}>Specifications</label>

                        {form.specifications?.map((spec, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg mb-3">

                                {/* Title */}
                                <div>
                                    <label className={labelStyle}>Title</label>
                                    <input
                                        type="text"
                                        className={inputStyle}
                                        value={spec.specTitle}
                                        onChange={(e) => {
                                            const updated = [...form.specifications];
                                            updated[index].specTitle = e.target.value;
                                            setForm(prev => ({ ...prev, specifications: updated }));
                                        }}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelStyle}>Description</label>
                                    <input
                                        type="text"
                                        className={inputStyle}
                                        value={spec.specDesc}
                                        onChange={(e) => {
                                            const updated = [...form.specifications];
                                            updated[index].specDesc = e.target.value;
                                            setForm(prev => ({ ...prev, specifications: updated }));
                                        }}
                                    />
                                </div>

                                {/* Delete */}

                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = [...form.specifications];
                                        updated.splice(index, 1);
                                        setForm(prev => ({ ...prev, specifications: updated }));
                                    }}
                                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 h-8 w-8 flex items-center justify-center"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setForm(prev => ({
                                    ...prev,
                                    specifications: [
                                        ...(prev.specifications || []),
                                        { specTitle: "", specDesc: "" }
                                    ]
                                }))
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Specification
                        </button>
                    </div>

                    {/* KEY FEATURES */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label className={labelStyle}>Key Features</label>

                        {form.keyFeatures?.map((feat, index) => (
                            <div key={index} className="flex items-center gap-3 mb-3">

                                <input
                                    type="text"
                                    className={inputStyle}
                                    value={feat}
                                    onChange={(e) => {
                                        const updated = [...form.keyFeatures];
                                        updated[index] = e.target.value;
                                        setForm(prev => ({ ...prev, keyFeatures: updated }));
                                    }}
                                    placeholder={`Feature ${index + 1}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = [...form.keyFeatures];
                                        updated.splice(index, 1);
                                        setForm(prev => ({ ...prev, keyFeatures: updated }));
                                    }}
                                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() =>
                                setForm(prev => ({
                                    ...prev,
                                    keyFeatures: [...(prev.keyFeatures || []), ""]
                                }))
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Feature
                        </button>
                    </div>



                    {/* DESCRIPTION 1 */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <label htmlFor="description" className={labelStyle}>Description </label>
                        <textarea
                            id="description"
                            className={inputStyle + " h-20 resize-none"}
                            value={form.description}
                            onChange={(e) => handleChanges("description", e.target.value)}
                            placeholder="Enter main product description"
                        ></textarea>
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