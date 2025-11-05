import React, { useEffect, useState } from 'react'
import { api } from './../Utils/api';
import { Trash2, Edit, Plus, Search, Layers, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductModel from '../components/ProductModel';
import Pagination from '../components/Pagination';

function Products() {
    const [productData, setproductData] = useState([])
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submenus, setSubmenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");


    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const tableHeaders = ['Category', 'Submenu', 'Title', 'Description', 'URL', 'Hover Image', 'View Image', 'Actions']

    // Fetch product data 
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await api.get('/products/getproduct');
            setproductData(res.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(errorMessage);
            console.error("Error fetching products:", err);
            toast.error(`Failed to load products: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch navbar menu + submenu data
    const fetchMenuData = async () => {
        try {
            const res = await api.get("/navbar/getnavbar");
            const allMenus = res.data.data.menuItems;
            setCategories(allMenus);

            const allSubmenus = allMenus.flatMap((menu) =>
                menu.subItems?.map((sub) => ({
                    parent: menu.title,
                    title: sub.title,
                }))
            );
            setSubmenus(allSubmenus);
        } catch (err) {
            console.error("Error fetching menu data:", err);
        }
    };

    // Handle product deletion
    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            return;
        }

        try {
            setDeletingId(id);
            await api.delete(`/products/deleteproduct/${id}`);
            setproductData(prev => prev.filter(p => p._id !== id));
            toast.success("Product deleted successfully!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Delete failed";
            console.error("Error deleting product:", error);
            toast.error(`Deletion failed: ${errorMessage}`);
        } finally {
            setDeletingId(null);
        }
    };


    //. Filter the products by search term
    const filteredProducts = productData.filter((product) =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };



    return (
        <div className="bg-gray-50 min-h-full rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-100">
            {/* Header and Controls */}
            <header className="flex items-center gap-4 mb-8 pb-4 border-b border-blue-100">
                <Layers className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
                    Products Management
                </h2>
            </header>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="relative flex-grow md:flex-grow-0 md:w-80">
                    <input
                        type="search"
                        placeholder="Search products..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-5 h-5" />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-300/50 hover:bg-blue-700 transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 cursor-pointer">
                        <Plus className="w-5 h-5" />
                        <span className="ml-2">Add New Product</span>
                    </button>
                </div>
            </div>

            {/* Data Table Container */}
            <div className="overflow-x-auto w-full rounded-xl border border-gray-200 shadow-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50/70">
                        <tr>
                            {tableHeaders.map((header) => (
                                <th key={header} className="p-4 text-left text-sm font-bold text-blue-700 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={tableHeaders.length} className="p-8 text-center text-blue-500 text-lg">
                                    <Loader2 className="w-6 h-6 inline-block animate-spin mr-2" /> Loading products...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={tableHeaders.length} className="p-8 text-center text-red-600 bg-red-50/50 font-medium border-t-2 border-red-200">
                                    Failed to load products: {error}
                                </td>
                            </tr>
                        ) : currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <tr key={product?._id || Math.random()} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 whitespace-nowrap text-sm font-semibold text-blue-600">{product.category}</td>
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-600">{product.submenu}</td>

                                    <td className="p-4 text-sm text-gray-800 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis font-medium" title={product.title}>
                                        {product.title}
                                    </td>

                                    <td className="p-4 text-sm text-gray-600 max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis" title={product.description}>
                                        {product.description}
                                    </td>

                                    <td className="p-4 text-sm text-blue-500 whitespace-nowrap">
                                        <p target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {product.url}
                                        </p>
                                    </td>

                                    <td className="p-4 whitespace-nowrap">
                                        <img
                                            src={product.hoverImage}
                                            alt={`Hover image for ${product.title}`}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm transition-transform hover:scale-110"
                                        />
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <img
                                            src={product.viewImage}
                                            alt={`View image for ${product.title}`}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm transition-transform hover:scale-110"
                                        />
                                    </td>

                                    <td className="p-4 whitespace-nowrap text-sm flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setOpen(true);
                                            }}
                                            className="p-2 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors shadow-sm focus:outline-none focus:ring-2 cursor-pointer focus:ring-blue-500"
                                            title="Edit Product"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors shadow-sm focus:outline-none focus:ring-2 cursor-pointer focus:ring-red-500 "
                                            title="Delete Product">
                                            {deletingId === product._id ? (
                                                <Loader2 className="w-5 h-5 inline-block cursor-not-allowed animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}


                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="p-8 text-center text-gray-500 text-lg">
                                    <p className="font-semibold">No products found. </p>
                                    <p className="text-sm mt-1">Start by clicking "Add New Product" above.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Product Modal */}
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

            {/* Pagination added here */}
            <Pagination
                products={filteredProducts}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                handlePageChange={handlePageChange}
            />
        </div>
    )
}

export default Products;
