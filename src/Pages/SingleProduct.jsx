import React, { useEffect, useState, useCallback, lazy } from "react";
import { api } from "./../Utils/api";
import { Trash2, Edit, Plus, Search, Layers, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
// import SingleproductModel from "../components/SingleProductModel";

const SingleproductModel = lazy(() =>
    import("../components/SingleproductModel")
);

function SingleProducts() {
    const [productData, setProductData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [categories, setCategories] = useState([]);
    const [submenus, setSubmenus] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubmenu, setSelectedSubmenu] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Fetch Single Products
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/singleproduct/getsingleproducts");
            setProductData(res.data.data || []);
            // console.log(res.data.data ,'single peoducts all data');
            
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            toast.error(`Failed to load single products: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        
    }, [fetchProducts]);

    // Fetch categories + submenus from navbar
    const fetchMenuData = useCallback(async () => {
        try {
            const res = await api.get("/navbar/getnavbar");
            const allMenus = res.data.data.menuItems;

            setCategories(allMenus);

            const allSubs = allMenus.flatMap(
                (menu) =>
                    menu.subItems?.map((sub) => ({
                        parent: menu.title,
                        title: sub.title,
                    })) || []
            );

            setSubmenus(allSubs);
        } catch (err) {
            console.error("Menu fetch error:", err);
        }
    }, []);

    useEffect(() => {
        if (fetchMenuData) {
            fetchMenuData();
        }
    }, [fetchMenuData]);


    // Delete single product
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this single product?")) return;

        setDeletingId(id);
        try {
            await api.delete(`/singleproduct/deletesingleproduct/${id}`);
            setProductData((prev) => prev.filter((p) => p._id !== id));
            toast.success("Single product deleted!");
        } catch (err) {
            toast.error("Delete failed");
        }
        setDeletingId(null);
    };

    // console.log(editingProduct,'edit single product');
    

    // Filtering Search + Category + Submenu
    const filteredProducts = productData.filter((p) => {
        const titleMatch = p.productName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const categoryMatch = selectedCategory
            ? p.category === selectedCategory
            : true;

        const submenuMatch = selectedSubmenu
            ? p.submenu === selectedSubmenu
            : true;

        return titleMatch && categoryMatch && submenuMatch;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(start, start + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedSubmenu]);

    return (
        <div className="bg-gray-50 min-h-full rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100">

            {/* HEADER */}
            <header className="flex items-center gap-3 mb-8 pb-4 border-b border-blue-100">
                <Layers className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-800">
                    Single Product Management
                </h2>
            </header>

            {/* SEARCH + FILTERS + ADD */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">

                <div className="relative flex-grow md:w-80">
                    <input
                        type="search"
                        placeholder="Search by product name..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                </div>

                <div className="flex gap-4">

                    {/* Category Dropdown */}
                    <select
                        className="border p-3 rounded-xl bg-white shadow-sm"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubmenu("");
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.title} value={cat.title}>
                                {cat.title}
                            </option>
                        ))}
                    </select>

                    {/* Submenu Dropdown */}
                    <select
                        className="border p-3 rounded-xl bg-white shadow-sm"
                        value={selectedSubmenu}
                        disabled={!selectedCategory}
                        onChange={(e) => setSelectedSubmenu(e.target.value)}
                    >
                        <option value="">All Submenus</option>
                        {submenus
                            .filter((s) => s.parent === selectedCategory)
                            .map((sub) => (
                                <option key={sub.title} value={sub.title}>
                                    {sub.title}
                                </option>
                            ))}
                    </select>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center bg-blue-600 cursor-pointer text-white px-5 py-3 rounded-xl shadow-md"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Single Product
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-xl shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            {[
                                "Category",
                                "Submenu",
                                "Product Name",

                                "Banner Image",
                                "Actions",
                            ].map((h) => (
                                <th key={h} className="p-5 text-left text-md font-bold text-blue-700 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center">
                                    <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                                </td>
                            </tr>
                        ) : currentProducts.length ? (
                            currentProducts.map((item) => (
                                <tr key={item._id}>
                                    <td className="p-3 font-medium text-blue-700">
                                        {item.category}
                                    </td>
                                    <td className="p-3">{item.submenu}</td>
                                    <td className="p-3">{item.productName}</td>


                                    <td className="p-3">
                                        <img
                                            src={item.bannerImage}
                                            className="w-14 h-14 rounded object-cover"
                                            alt="banner"
                                        />
                                    </td>

                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(item);
                                                setOpen(true);
                                            }}
                                            className="p-2 bg-blue-100 rounded-full cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-red-100 rounded-full cursor-pointer"
                                        >
                                            {deletingId === item._id ? (
                                                <Loader2 className="animate-spin w-4 h-4" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No single products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <Pagination
                products={filteredProducts}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                handlePageChange={setCurrentPage}
            />

            {/* MODAL */}
            {open && (
                <SingleproductModel
                    isOpen={open}
                    onClose={() => {
                        setOpen(false);
                        setEditingProduct(null);
                    }}
                    fetchMenuData={fetchMenuData}
                    editingSingleProduct={editingProduct}
                    fetchProducts={fetchProducts}
                    categories={categories}
                    submenus={submenus}
                />
            )}
        </div>
    );
}

export default React.memo(SingleProducts);
