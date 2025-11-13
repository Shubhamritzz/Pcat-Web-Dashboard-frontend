import React, {
    useEffect,
    useState,
    useCallback,
    lazy,
} from "react";
import { api } from "./../Utils/api";
import { Trash2, Edit, Plus, Search, Layers, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";


const ProductModel = lazy(() => import("../components/ProductModel"));

function Products() {
    const [productData, setProductData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submenus, setSubmenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get("/products/getproduct");
            setProductData(res.data.data);
            setError(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            toast.error(`Failed to load products: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Fetch menu/submenu
    const fetchMenuData = useCallback(async () => {
        try {
            const res = await api.get("/navbar/getnavbar");
            const allMenus = res.data.data.menuItems;
            setCategories(allMenus);

            const allSubmenus = allMenus.flatMap(
                (menu) =>
                    menu.subItems?.map((sub) => ({
                        parent: menu.title,
                        title: sub.title,
                    })) || []
            );
            setSubmenus(allSubmenus);
        } catch (err) {
            console.error("Error fetching menu data:", err);
        }
    }, []);

    // Delete product
    const handleDeleteProduct = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?"))
            return;
        setDeletingId(id);
        try {
            await api.delete(`/products/deleteproduct/${id}`);
            setProductData((prev) => prev.filter((p) => p._id !== id));
            toast.success("Product deleted successfully!");
        } catch (err) {
            const msg = err.response?.data?.message || "Delete failed";
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    }, []);

    // Filter + paginate (no useMemo)
    const filteredProducts = productData.filter((p) =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const start = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(start, start + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="bg-gray-50 min-h-full rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100 transition-all">
            {/* Header */}
            <header className="flex items-center gap-3 mb-8 pb-4 border-b border-blue-100">
                <Layers className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
                    Products Management
                </h2>
            </header>

            {/* Search + Add */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="relative flex-grow md:w-80">
                    <input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center bg-blue-600 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-transform hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Product
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-xl border-gray-200 shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            {[
                                "Category",
                                "Submenu",
                                "Title",
                                "Description",
                                "URL",
                                "Hover",
                                "View",
                                "Actions",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="p-5 text-left text-md font-bold text-blue-700 uppercase"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-blue-500">
                                    <Loader2 className="inline-block animate-spin mr-2 w-6 h-6" />
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-red-600">
                                    {error}
                                </td>
                            </tr>
                        ) : currentProducts.length ? (
                            currentProducts.map((product) => (
                                <tr key={product._id}>
                                    <td className="p-3 text-blue-600 font-semibold">
                                        {product.category}
                                    </td>
                                    <td className="p-3 text-gray-600">{product.submenu}</td>
                                    <td className="p-3 font-medium">{product.title}</td>
                                    <td className="p-3 text-gray-600 truncate max-w-[200px]">
                                        {product.description}
                                    </td>
                                    <td className="p-3 text-blue-500 truncate max-w-[150px]">
                                        {product.url}
                                    </td>
                                    <td className="p-3">
                                        <img
                                            src={product.hoverImage}
                                            alt="Hover"
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <img
                                            src={product.viewImage}
                                            alt="View"
                                            className="w-10 h-10 rounded object-cover"
                                        />
                                    </td>
                                    <td className="p-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setOpen(true);
                                            }}
                                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                        >
                                            {deletingId === product._id ? (
                                                <Loader2 className="animate-spin w-4 h-4" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-gray-500">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                products={filteredProducts}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                handlePageChange={handlePageChange}
            />

            {/* Product Modal (Lazy-loaded) */}
            {open && (
                
                    <ProductModel
                        isOpen={open}
                        onClose={() => {
                            setOpen(false);
                            setEditingProduct(null);
                        }}
                        fetchProducts={fetchProducts}
                        editingProduct={editingProduct}
                        fetchMenuData={fetchMenuData}
                        submenus={submenus}
                        setSubmenus={setSubmenus}
                        categories={categories}
                        setCategories={setCategories}
                    />
            )}
        </div>
    );
}

export default React.memo(Products);
