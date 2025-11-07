import React, { useState, useEffect } from "react";
import { api } from './../Utils/api';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    X,
    Upload,
    Eye,
    EyeOff,
    ChevronDown,
    Globe,
    Tag,
    Code,
} from "lucide-react";



const Seo = () => {
    const [seoPages, setSeoPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentSEOPage, setCurrentSEOPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });
    const [iconPreview, setIconPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        page_name: "",
        page_slug: "",
        seo_title: "",
        seo_description: "",
        canonical: "",
        google_site_verification_name: "",
        google_site_verification_content: "",
        meta_property_og: [],
        meta_name_twitter: [],
        google_tag_manager_header: "",
        google_tag_manager_body: "",
        sitemap_loc: "",
        sitemap_priority: 0.5,
        sitemap_changefreq: "monthly",
        status: "active",
    });

    // Fetch SEO pages
    const fetchSEOPages = async (page = 1, search = "", status = "") => {
        setLoading(true);
        try {
            const params = {
                page: page.toString(),
                limit: "10",
                ...(search && { search }),
                ...(status && { status }),
            };

            const response = await api.get("/seo/getAll", {
                params,
                withCredentials: true,
            });

            if (response.data.success) {
                setSeoPages(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching SEO pages:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSEOPages();
    }, []);

    // Search handler
    const handleSearch = (term) => {
        setSearchTerm(term);
        fetchSEOPages(1, term, selectedStatus);
    };

    // Status filter
    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        fetchSEOPages(1, searchTerm, status);
    };

    // File selection handler
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setIconPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Open modal for create/edit
    const openModal = (seoPage = null) => {
        if (seoPage) {
            setEditMode(true);
            setCurrentSEOPage(seoPage);
            setFormData({
                page_name: seoPage.page_name,
                page_slug: seoPage.page_slug,
                seo_title: seoPage.seo.title,
                seo_description: seoPage.seo.description,
                canonical: seoPage.seo.canonical || "",
                google_site_verification_name:
                    seoPage.seo.google_site_verification?.name || "",
                google_site_verification_content:
                    seoPage.seo.google_site_verification?.content || "",
                meta_property_og: seoPage.seo.meta_property_og || [],
                meta_name_twitter: seoPage.seo.meta_name_twitter || [],
                google_tag_manager_header: seoPage.google_tag_manager?.header || "",
                google_tag_manager_body: seoPage.google_tag_manager?.body || "",
                sitemap_loc: seoPage.sitemap.loc,
                sitemap_priority: seoPage.sitemap.priority,
                sitemap_changefreq: seoPage.sitemap.changefreq,
                status: seoPage.status,
            });
            if (seoPage.seo.icon) {
                setIconPreview(seoPage.seo.icon);
            }
        } else {
            setEditMode(false);
            setCurrentSEOPage(null);
            setFormData({
                page_name: "",
                page_slug: "",
                seo_title: "",
                seo_description: "",
                canonical: "",
                google_site_verification_name: "",
                google_site_verification_content: "",
                meta_property_og: [],
                meta_name_twitter: [],
                google_tag_manager_header: "",
                google_tag_manager_body: "",
                sitemap_loc: "",
                sitemap_priority: 0.5,
                sitemap_changefreq: "monthly",
                status: "active",
            });
            setIconPreview(null);
            setSelectedFile(null);
        }
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentSEOPage(null);
        setFormData({
            page_name: "",
            page_slug: "",
            seo_title: "",
            seo_description: "",
            canonical: "",
            google_site_verification_name: "",
            google_site_verification_content: "",
            meta_property_og: [],
            meta_name_twitter: [],
            google_tag_manager_header: "",
            google_tag_manager_body: "",
            sitemap_loc: "",
            sitemap_priority: 0.5,
            sitemap_changefreq: "monthly",
            status: "active",
        });
        setIconPreview(null);
        setSelectedFile(null);
    };

    // Add meta tag
    const addMetaTag = (type) => {
        if (type === "og") {
            setFormData({
                ...formData,
                meta_property_og: [
                    ...formData.meta_property_og,
                    { property: "", content: "" },
                ],
            });
        } else if (type === "twitter") {
            setFormData({
                ...formData,
                meta_name_twitter: [
                    ...formData.meta_name_twitter,
                    { name: "", content: "" },
                ],
            });
        }
    };

    // Remove meta tag
    const removeMetaTag = (type, index) => {
        if (type === "og") {
            const newTags = formData.meta_property_og.filter((_, i) => i !== index);
            setFormData({ ...formData, meta_property_og: newTags });
        } else if (type === "twitter") {
            const newTags = formData.meta_name_twitter.filter((_, i) => i !== index);
            setFormData({ ...formData, meta_name_twitter: newTags });
        }
    };

    // Update meta tag
    const updateMetaTag = (type, index, field, value) => {
        if (type === "og") {
            const newTags = [...formData.meta_property_og];
            newTags[index][field] = value;
            setFormData({ ...formData, meta_property_og: newTags });
        } else if (type === "twitter") {
            const newTags = [...formData.meta_name_twitter];
            newTags[index][field] = value;
            setFormData({ ...formData, meta_name_twitter: newTags });
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("page_name", formData.page_name);
            formDataToSend.append("page_slug", formData.page_slug);
            formDataToSend.append("seo_title", formData.seo_title);
            formDataToSend.append("seo_description", formData.seo_description);
            formDataToSend.append("canonical", formData.canonical);
            formDataToSend.append(
                "google_site_verification_name",
                formData.google_site_verification_name
            );
            formDataToSend.append(
                "google_site_verification_content",
                formData.google_site_verification_content
            );
            formDataToSend.append(
                "meta_property_og",
                JSON.stringify(formData.meta_property_og)
            );
            formDataToSend.append(
                "meta_name_twitter",
                JSON.stringify(formData.meta_name_twitter)
            );
            formDataToSend.append(
                "google_tag_manager_header",
                formData.google_tag_manager_header
            );
            formDataToSend.append(
                "google_tag_manager_body",
                formData.google_tag_manager_body
            );
            formDataToSend.append("sitemap_loc", formData.sitemap_loc);
            formDataToSend.append("sitemap_priority", formData.sitemap_priority);
            formDataToSend.append("sitemap_changefreq", formData.sitemap_changefreq);
            formDataToSend.append("status", formData.status);

            if (selectedFile) {
                formDataToSend.append("icon", selectedFile);
            }

            let response;
            if (editMode) {
                response = await api.put(
                    `/seo/update/${currentSEOPage._id}`,
                    formDataToSend,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        withCredentials: true,
                    }
                );
            } else {
                response = await api.post("/seo/create", formDataToSend, {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                });
            }

            if (response.data.success) {
                closeModal();
                fetchSEOPages(pagination.currentPage, searchTerm, selectedStatus);
                alert(
                    editMode
                        ? "SEO page updated successfully!"
                        : "SEO page created successfully!"
                );
            } else {
                alert(response.data.message || "Error saving SEO page");
            }
        } catch (error) {
            console.error("Error saving SEO page:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
            } else {
                alert(error.response?.data?.message || "Error saving SEO page");
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete SEO page
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this SEO page?")) return;

        try {
            const response = await api.delete(`/seo/delete/${id}`, {
                withCredentials: true,
            });

            if (response.data.success) {
                fetchSEOPages(pagination.currentPage, searchTerm, selectedStatus);
                alert("SEO page deleted successfully!");
            } else {
                alert(response.data.message || "Error deleting SEO page");
            }
        } catch (error) {
            console.error("Error deleting SEO page:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
            } else {
                alert(error.response?.data?.message || "Error deleting SEO page");
            }
        }
    };

    // Remove icon
    const handleRemoveIcon = async (id) => {
        if (!confirm("Are you sure you want to remove this icon?")) return;

        try {
            const response = await api.delete(`/seo/remove-icon/${id}/icon`, {
                withCredentials: true,
            });

            if (response.data.success) {
                fetchSEOPages(pagination.currentPage, searchTerm, selectedStatus);
                alert("Icon removed successfully!");
            }
        } catch (error) {
            console.error("Error removing icon:", error);
            if (error.response?.status === 401) {
                alert("Session expired. Please login again.");
            } else {
                alert(error.response?.data?.message || "Error removing icon");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-yellow-600">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                SEO Management
                            </h1>
                            <p className="text-gray-600">
                                Manage SEO settings for your pages
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/3 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search pages..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 w-full sm:w-64"
                                />
                            </div>

                            {/* Add Button */}
                            <button
                                onClick={() => openModal()}
                                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                Add SEO Page
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold">Icon</th>
                                    <th className="px-6 py-4 text-left font-semibold">
                                        Page Name
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold">
                                        Page Slug
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold">
                                        SEO Title
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : seoPages.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            No SEO pages found
                                        </td>
                                    </tr>
                                ) : (
                                    seoPages.map((seoPage) => (
                                        <tr
                                            key={seoPage._id}
                                            className="hover:bg-yellow-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                {seoPage.seo.icon ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={seoPage.seo.icon}
                                                            alt={seoPage.page_name}
                                                            className="w-12 h-12 object-cover rounded-lg border-2 border-yellow-200"
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveIcon(seoPage._id)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {seoPage.page_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                                    <Globe className="w-4 h-4 mr-1" />
                                                    {seoPage.page_slug}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {seoPage.seo.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${seoPage.status === "active"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {seoPage.status === "active" ? (
                                                        <>
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-4 h-4 mr-1" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openModal(seoPage)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(seoPage._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                                    {Math.min(pagination.currentPage * 10, pagination.totalItems)}{" "}
                                    of {pagination.totalItems} results
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            fetchSEOPages(
                                                pagination.currentPage - 1,
                                                searchTerm,
                                                selectedStatus
                                            )
                                        }
                                        disabled={pagination.currentPage === 1}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md">
                                        {pagination.currentPage}
                                    </span>
                                    <button
                                        onClick={() =>
                                            fetchSEOPages(
                                                pagination.currentPage + 1,
                                                searchTerm,
                                                selectedStatus
                                            )
                                        }
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-6 rounded-t-xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">
                                        {editMode ? "Edit SEO Page" : "Add SEO Page"}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Page Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Page Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.page_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, page_name: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                            placeholder="e.g., Home Page, About Us, Contact"
                                            required
                                        />
                                    </div>

                                    {/* Page Slug */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Page Slug *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.page_slug}
                                            onChange={(e) =>
                                                setFormData({ ...formData, page_slug: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                            placeholder="e.g., /home, /about-us, /contact"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* SEO Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.seo_title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, seo_title: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                        placeholder="e.g., Best Leather Products | Your Brand Name"
                                        required
                                    />
                                </div>

                                {/* SEO Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SEO Description *
                                    </label>
                                    <textarea
                                        value={formData.seo_description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                seo_description: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                        rows="3"
                                        placeholder="e.g., Discover premium leather products crafted with excellence. Shop our collection of bags, wallets, and accessories with fast shipping and quality guarantee."
                                        required
                                    />
                                </div>

                                {/* Canonical URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Canonical URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.canonical}
                                        onChange={(e) =>
                                            setFormData({ ...formData, canonical: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                        placeholder="e.g., https://yourdomain.com/page-url"
                                    />
                                </div>

                                {/* Icon Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Page Icon/Favicon
                                    </label>
                                    <div className="space-y-4">
                                        {iconPreview && (
                                            <div className="relative inline-block">
                                                <img
                                                    src={iconPreview}
                                                    alt="Preview"
                                                    className="w-16 h-16 object-cover rounded-lg border-2 border-yellow-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIconPreview(null);
                                                        setSelectedFile(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="iconUpload"
                                            />
                                            <label
                                                htmlFor="iconUpload"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Choose Icon
                                            </label>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Recommended: 32x32px or 16x16px PNG/ICO format
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Google Site Verification */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        Google Site Verification
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Meta Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.google_site_verification_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        google_site_verification_name: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                                placeholder="google-site-verification"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Content Value
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.google_site_verification_content}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        google_site_verification_content: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                                placeholder="your-verification-code"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Property OG Tags */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Open Graph Meta Tags
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => addMetaTag("og")}
                                            className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                                        >
                                            Add OG Tag
                                        </button>
                                    </div>
                                    {formData.meta_property_og.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2"
                                        >
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={tag.property}
                                                    onChange={(e) =>
                                                        updateMetaTag(
                                                            "og",
                                                            index,
                                                            "property",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="e.g., og:title, og:description, og:image"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={tag.content}
                                                    onChange={(e) =>
                                                        updateMetaTag(
                                                            "og",
                                                            index,
                                                            "content",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="Content value"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeMetaTag("og", index)}
                                                className="px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Meta Name Twitter Tags */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Twitter Meta Tags
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => addMetaTag("twitter")}
                                            className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm"
                                        >
                                            Add Twitter Tag
                                        </button>
                                    </div>
                                    {formData.meta_name_twitter.map((tag, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2"
                                        >
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={tag.name}
                                                    onChange={(e) =>
                                                        updateMetaTag(
                                                            "twitter",
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="e.g., twitter:card, twitter:site, twitter:creator"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="text"
                                                    value={tag.content}
                                                    onChange={(e) =>
                                                        updateMetaTag(
                                                            "twitter",
                                                            index,
                                                            "content",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    placeholder="Content value"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeMetaTag("twitter", index)}
                                                className="px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Google Tag Manager */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Code className="w-5 h-5" />
                                        Google Tag Manager
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Header Script
                                            </label>
                                            <textarea
                                                value={formData.google_tag_manager_header}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        google_tag_manager_header: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                                rows="3"
                                                placeholder="<!-- Google Tag Manager --> script goes here"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Body Script (noscript)
                                            </label>
                                            <textarea
                                                value={formData.google_tag_manager_body}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        google_tag_manager_body: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                                rows="3"
                                                placeholder="<!-- Google Tag Manager (noscript) --> script goes here"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sitemap Settings */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Sitemap Settings
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location URL *
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.sitemap_loc}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        sitemap_loc: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                                placeholder="https://yourdomain.com/page-url"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Priority (0.0-1.0)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="1"
                                                value={formData.sitemap_priority}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        sitemap_priority: parseFloat(e.target.value),
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Change Frequency
                                            </label>
                                            <select
                                                value={formData.sitemap_changefreq}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        sitemap_changefreq: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
                                            >
                                                <option value="always">Always</option>
                                                <option value="hourly">Hourly</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                                <option value="never">Never</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === "active"}
                                                onChange={() =>
                                                    setFormData({ ...formData, status: "active" })
                                                }
                                                className="mr-2 text-yellow-600 focus:ring-yellow-600"
                                            />
                                            Active
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === "inactive"}
                                                onChange={() =>
                                                    setFormData({ ...formData, status: "inactive" })
                                                }
                                                className="mr-2 text-yellow-600 focus:ring-yellow-600"
                                            />
                                            Inactive
                                        </label>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                                    >
                                        {loading ? "Saving..." : editMode ? "Update" : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Seo;
