import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";
import "./Item.css";

// Base URL API
const API_BASE_URL = "http://127.0.0.1:8000/api";

const Item = () => {
    // === 1. STATE & DATA ===
    const [items, setItems] = useState([]);
    // const [vendorData, setVendorData] = useState([]); // Tidak butuh load semua vendor lagi
    const [loading, setLoading] = useState(false);

    // State Filter & Search
    const [search, setSearch] = useState("");
    const [filterProvinsi, setFilterProvinsi] = useState("");
    const [filterKab, setFilterKab] = useState("");
    const [filterTahun, setFilterTahun] = useState("");

    // State Modal & UI
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // State Form Data
    const [formData, setFormData] = useState({
        id: "",
        item_no: "", // Akan diisi otomatis oleh handleOpenAdd
        ahs: "",
        deskripsi: "",
        merek: "",
        satuan: "",
        hpp: "",

        // Vendor Logic
        vendorName: "",
        vendor_no: "",
        vendor_id: "",

        provinsi: "",
        kabupaten: "",
        tahun: "",
        deskripsiProduk: "",
        teksSpesifikasi: "",

        // File Upload
        fotoFile: null,
        docSpecFile: null,

        // Preview URL
        fotoUrl: "",
        fileSpesifikasiName: ""
    });

    // Refs
    const fileInputRef = useRef(null);
    const vendorInputRef = useRef(null);

    // Vendor Autocomplete
    const [vendorSuggestions, setVendorSuggestions] = useState([]);
    const [vendorNotFound, setVendorNotFound] = useState(false);

    // Helper untuk menampilkan nama vendor
    const getVendorName = (v) => {
        if (!v) return "";
        return v.vendor_name || v.nama || v.name || v.vendor_no || "";
    };

    // === 2. FETCH DATA ITEMS ===

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("item_no", search);
            if (filterProvinsi) params.append("provinsi", filterProvinsi);
            if (filterKab) params.append("kab", filterKab);
            if (filterTahun) params.append("tahun", filterTahun);

            const response = await axios.get(`${API_BASE_URL}/items?${params.toString()}`);

            if (response.data && Array.isArray(response.data.data)) {
                setItems(response.data.data);
            } else if (Array.isArray(response.data)) {
                setItems(response.data);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error("Gagal load items:", error);
        } finally {
            setLoading(false);
        }
    }, [search, filterProvinsi, filterKab, filterTahun]);

    useEffect(() => {
        const handler = setTimeout(() => { fetchItems(); }, 500);
        return () => clearTimeout(handler);
    }, [fetchItems]);


    // === 3. LOGIC LIVE SEARCH VENDOR ===

    const handleVendorChange = async (e) => {
        const value = e.target.value;
        setFormData({ ...formData, vendorName: value, vendor_id: "", vendor_no: "" });
        setVendorNotFound(false);

        if (value.length > 0) {
            try {
                const response = await axios.get(`${API_BASE_URL}/vendors?search=${value}`);
                const data = response.data.data ? response.data.data : response.data;

                if (Array.isArray(data) && data.length > 0) {
                    setVendorSuggestions(data);
                    setVendorNotFound(false);
                } else {
                    setVendorSuggestions([]);
                    setVendorNotFound(true);
                }
            } catch (error) {
                console.error("Error searching vendor:", error);
            }
        } else {
            setVendorSuggestions([]);
        }
    };

    const handleSelectVendor = (vendor) => {
        const vName = getVendorName(vendor);
        setFormData({
            ...formData,
            vendorName: vName,
            vendor_id: vendor.vendor_id,
            vendor_no: vendor.vendor_no
        });
        setVendorSuggestions([]);
        setVendorNotFound(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (vendorInputRef.current && !vendorInputRef.current.contains(event.target)) {
                setVendorSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // === 4. CRUD HANDLERS ===

    // --- [UPDATE] LOGIC TAMBAH DATA DENGAN AUTO ID ---
    const handleOpenAdd = async () => {
        setIsEditMode(false);

        // Reset form dulu
        const initialData = {
            id: "", item_no: "Loading...", // Placeholder saat loading
            ahs: "", deskripsi: "", merek: "", satuan: "", hpp: "",
            vendorName: "", vendor_no: "", vendor_id: "",
            provinsi: "", kabupaten: "",
            tahun: new Date().getFullYear().toString(),
            deskripsiProduk: "", teksSpesifikasi: "",
            fotoFile: null, docSpecFile: null, fotoUrl: "", fileSpesifikasiName: ""
        };
        setFormData(initialData);
        setVendorSuggestions([]);
        setShowModal(true);

        // Fetch Next ID dari Backend
        try {
            const response = await axios.get(`${API_BASE_URL}/items/next-id`);
            setFormData(prev => ({
                ...prev,
                item_no: response.data.next_id // Mengisi otomatis ID (misal: M_006)
            }));
        } catch (error) {
            console.error("Gagal mengambil ID otomatis:", error);
            setFormData(prev => ({ ...prev, item_no: "Manual Input" }));
        }
    };

    const handleOpenEdit = (item) => {
        setIsEditMode(true);
        const vName = item.vendor ? getVendorName(item.vendor) : "";
        const vNo = item.vendor ? item.vendor.vendor_no : "";

        setFormData({
            id: item.item_id,
            item_no: item.item_no,
            ahs: item.ahs,
            deskripsi: item.deskripsi,
            merek: item.merek,
            satuan: item.satuan,
            hpp: item.hpp,

            vendorName: vName,
            vendor_id: item.vendor_id,
            vendor_no: vNo,

            provinsi: item.provinsi,
            kabupaten: item.kab,
            tahun: item.tahun,
            deskripsiProduk: item.produk_deskripsi,
            teksSpesifikasi: item.spesifikasi,

            fotoUrl: item.produk_foto,
            fileSpesifikasiName: item.produk_dokumen ? "Lihat Dokumen" : "",
            fotoFile: null, docSpecFile: null
        });
        setShowModal(true);
    };

    const handleSaveModal = async () => {
        if (formData.vendorName && !formData.vendor_no && !formData.vendor_id) {
            alert("Vendor belum valid! Mohon pilih vendor dari daftar saran.");
            return;
        }

        setLoading(true);

        const data = new FormData();
        // data.append("item_no", formData.item_no); // Tidak perlu dikirim karena Backend generate ulang saat Store
        data.append("ahs", formData.ahs || "-");
        data.append("deskripsi", formData.deskripsi || "-");
        data.append("merek", formData.merek || "-");
        data.append("satuan", formData.satuan || "-");
        data.append("hpp", formData.hpp || "0");
        data.append("provinsi", formData.provinsi || "-");
        data.append("kab", formData.kabupaten || "-");
        data.append("tahun", formData.tahun || "");
        data.append("produk_deskripsi", formData.deskripsiProduk || "-");
        data.append("spesifikasi", formData.teksSpesifikasi || "-");

        if (isEditMode) {
            if (formData.vendor_id) data.append("vendor_id", formData.vendor_id);
        } else {
            if (formData.vendor_no) {
                data.append("vendor_no", formData.vendor_no);
            } else {
                setLoading(false);
                alert("Gagal: Data Vendor tidak lengkap (Vendor No hilang).");
                return;
            }
        }

        if (formData.fotoFile) data.append("produk_foto[]", formData.fotoFile);
        if (formData.docSpecFile) data.append("produk_dokumen[]", formData.docSpecFile);

        try {
            if (isEditMode) {
                data.append("_method", "PUT");
                await axios.post(`${API_BASE_URL}/items/${formData.id}`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                alert("Data berhasil diperbarui!");
            } else {
                await axios.post(`${API_BASE_URL}/items`, data, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                alert("Data berhasil ditambahkan!");
            }
            fetchItems();
            setShowModal(false);
        } catch (error) {
            console.error("Error save:", error.response);
            const msg = error.response?.data?.message || "Gagal menyimpan data.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin hapus data?")) {
            try {
                await axios.delete(`${API_BASE_URL}/items/${id}`);
                fetchItems();
            } catch (error) {
                alert("Gagal menghapus.");
            }
        }
    };

    const handleExport = () => window.open(`${API_BASE_URL}/items/export`, '_blank');
    const handleDownloadTemplate = () => window.open(`${API_BASE_URL}/items/template/download`, '_blank');

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/items/import`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            alert("Import berhasil!");
            fetchItems();
        } catch (e) { alert("Gagal Import."); }
        finally { setLoading(false); }
        setShowDropdown(false);
        e.target.value = null;
    };

    // === RENDER UI ===
    return (
        <div className="vendor-container">
            <Sidebar />

            <div className="vendor-main">
                <Header />

                {/* Topbar */}
                <div className="topbar-container">
                    <div className="topbar-left">
                        <div className="input-wrapper">
                            <span className="icon-search">🔍</span>
                            <input type="text" placeholder="Cari" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <input type="text" placeholder="Provinsi" value={filterProvinsi} onChange={(e) => setFilterProvinsi(e.target.value)} />
                        <input type="text" placeholder="Kabupaten" value={filterKab} onChange={(e) => setFilterKab(e.target.value)} />
                        <input type="text" placeholder="Tahun" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="input-tahun" />
                    </div>

                    <div className="topbar-right">
                        <button className="btn-action btn-export" onClick={handleExport}>📥 Exspors</button>
                        <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                            <button className="btn-action btn-import" onClick={() => setShowDropdown(!showDropdown)}>📥 Import ▼</button>
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <button onClick={handleDownloadTemplate}>📄 Unduh Template</button>
                                    <button onClick={() => fileInputRef.current.click()}>📂 Pilih File</button>
                                </div>
                            )}
                        </div>
                        <button className="btn-action btn-new" onClick={handleOpenAdd}>+ Baru</button>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
                    </div>
                </div>

                {/* Tabel */}
                <div className="vendor-content">
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>AHS</th>
                                    <th>Deskripsi</th>
                                    <th>Merek</th>
                                    <th>Satuan</th>
                                    <th>HPP</th>
                                    <th>Vendor</th>
                                    <th>Provinsi</th>
                                    <th>Kab</th>
                                    <th>Tahun</th>
                                    <th>Foto</th>
                                    <th>Deskripsi Produk</th>
                                    <th>Spesifikasi</th>
                                    <th className="sticky-action">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(items) && items.length > 0 ? items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.item_no}</td>
                                        <td>{item.ahs}</td>
                                        <td className="col-deskripsi">{item.deskripsi}</td>
                                        <td>{item.merek}</td>
                                        <td>{item.satuan}</td>
                                        <td>{new Intl.NumberFormat('id-ID').format(item.hpp)}</td>
                                        <td>{item.vendor ? getVendorName(item.vendor) : "-"}</td>
                                        <td>{item.provinsi}</td>
                                        <td>{item.kab}</td>
                                        <td>{item.tahun}</td>
                                        <td>
                                            <img
                                                src={item.produk_foto ? `http://127.0.0.1:8000/storage/${item.produk_foto}` : "https://via.placeholder.com/100?text=No+Img"}
                                                alt="img" className="table-img"
                                            />
                                        </td>
                                        <td className="col-desc-prod">{item.produk_deskripsi}</td>
                                        <td className="col-specs">
                                            {item.produk_dokumen ? <a href={`http://127.0.0.1:8000/storage/${item.produk_dokumen}`} target="_blank" rel="noreferrer" className="link-doc">📄 Lihat Dokumen</a> : "-"}
                                            <div className="spec-text">{item.spesifikasi}</div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-view" onClick={() => { setSelectedItem(item); setShowDetail(true); }} title="Lihat">👁️</button>
                                                <button className="btn-edit" onClick={() => handleOpenEdit(item)} title="Edit">✏️</button>
                                                <button className="btn-delete" onClick={() => handleDelete(item.item_id)} title="Hapus">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="14" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Form */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ position: 'relative' }}>
                            <h3>{isEditMode ? "Edit Data Item" : "Tambah Data Item"}</h3>
                            <div className="modal-body">
                                {/* Field ID Item - Read Only untuk Add dan Edit */}
                                <label>ID Item (Otomatis)</label>
                                <input
                                    value={formData.item_no}
                                    disabled
                                    style={{ backgroundColor: '#eee', fontWeight: 'bold' }}
                                />

                                <label>AHS</label>
                                <input placeholder="Material / Jasa" value={formData.ahs} onChange={(e) => setFormData({ ...formData, ahs: e.target.value })} />
                                <label>Deskripsi</label>
                                <input placeholder="Nama Item" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} />
                                <label>Merek</label>
                                <input placeholder="Merek Produk" value={formData.merek} onChange={(e) => setFormData({ ...formData, merek: e.target.value })} />
                                <label>Satuan</label>
                                <input placeholder="Unit (Bh, Paket, dll)" value={formData.satuan} onChange={(e) => setFormData({ ...formData, satuan: e.target.value })} />
                                <label>HPP</label>
                                <input placeholder="Harga Satuan (Rp)" value={formData.hpp} onChange={(e) => setFormData({ ...formData, hpp: e.target.value })} />

                                {/* --- FITUR PENCARIAN VENDOR LIVE --- */}
                                <div style={{ position: 'relative' }} ref={vendorInputRef}>
                                    <label>Vendor</label>
                                    <input
                                        placeholder="Ketik untuk mencari vendor..."
                                        value={formData.vendorName}
                                        onChange={handleVendorChange} // Memicu Live API Search
                                        style={{ border: vendorNotFound ? '2px solid red' : '1px solid #ccc' }}
                                    />
                                    {vendorNotFound && <p style={{ color: 'red', fontSize: '12px', margin: '0' }}>Vendor tidak ditemukan.</p>}

                                    {vendorSuggestions.length > 0 && (
                                        <div className="autocomplete-dropdown">
                                            {vendorSuggestions.map((vendor) => (
                                                <div
                                                    key={vendor.vendor_id}
                                                    className="suggestion-item"
                                                    onClick={() => handleSelectVendor(vendor)}
                                                >
                                                    {getVendorName(vendor)} <span>({vendor.provinsi})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* ----------------------------------- */}

                                <label>Provinsi</label>
                                <input placeholder="Lokasi Provinsi" value={formData.provinsi} onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })} />
                                <label>Kab</label>
                                <input placeholder="Lokasi Kabupaten" value={formData.kabupaten} onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })} />
                                <label>Tahun</label>
                                <input placeholder="Tahun Anggaran" type="number" value={formData.tahun} onChange={(e) => setFormData({ ...formData, tahun: e.target.value })} />

                                <label style={{ fontWeight: 'bold', marginTop: '10px', display: 'block' }}>Upload Foto Produk</label>
                                {isEditMode && formData.fotoUrl && <small style={{ color: 'blue' }}>Foto Existing: Ada</small>}
                                <input type="file" className="input-file" onChange={(e) => setFormData({ ...formData, fotoFile: e.target.files[0] })} />

                                <label>Deskripsi Produk</label>
                                <input placeholder="Detail Lengkap" value={formData.deskripsiProduk} onChange={(e) => setFormData({ ...formData, deskripsiProduk: e.target.value })} />

                                <label style={{ fontWeight: 'bold', marginTop: '10px', display: 'block' }}>Spesifikasi (Dokumen & Teks)</label>
                                {isEditMode && formData.fileSpesifikasiName && <small style={{ color: 'blue' }}>{formData.fileSpesifikasiName}</small>}
                                <input type="file" className="input-file" style={{ marginBottom: '5px' }} onChange={(e) => setFormData({ ...formData, docSpecFile: e.target.files[0] })} />
                                <textarea
                                    placeholder="• Daya: 150W&#10;• Tegangan: 220V"
                                    rows="4"
                                    style={{ width: '100%', padding: '8px' }}
                                    value={formData.teksSpesifikasi}
                                    onChange={(e) => setFormData({ ...formData, teksSpesifikasi: e.target.value })}
                                />
                            </div>

                            <div className="modal-buttons">
                                <button className="btn-save" onClick={handleSaveModal} disabled={loading}>
                                    {loading ? "Memproses..." : (isEditMode ? "Simpan Perubahan" : "Simpan Data")}
                                </button>
                                <button className="btn-cancel" onClick={() => setShowModal(false)} disabled={loading}>Batal</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Detail */}
                {showDetail && selectedItem && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ position: 'relative' }}>
                            <h3>Detail Item</h3>
                            <div className="detail-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <p><strong>ID:</strong> {selectedItem.item_no}</p>
                                <p><strong>AHS:</strong> {selectedItem.ahs}</p>
                                <p><strong>Deskripsi:</strong> {selectedItem.deskripsi}</p>
                                <p><strong>Merek:</strong> {selectedItem.merek}</p>
                                <p><strong>Satuan:</strong> {selectedItem.satuan}</p>
                                <p><strong>HPP:</strong> {new Intl.NumberFormat('id-ID').format(selectedItem.hpp)}</p>
                                <p><strong>Vendor:</strong> {selectedItem.vendor ? getVendorName(selectedItem.vendor) : "-"}</p>
                                <p><strong>Provinsi:</strong> {selectedItem.provinsi}</p>
                                <p><strong>Kabupaten:</strong> {selectedItem.kab}</p>
                                <p><strong>Tahun:</strong> {selectedItem.tahun}</p>

                                <div style={{ margin: '15px 0' }}>
                                    <strong>Foto Produk:</strong><br />
                                    <img
                                        src={selectedItem.produk_foto ? `http://127.0.0.1:8000/storage/${selectedItem.produk_foto}` : "https://via.placeholder.com/100?text=No+Img"}
                                        alt="Foto Produk"
                                        style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    />
                                </div>

                                <p><strong>Deskripsi Produk:</strong> {selectedItem.produk_deskripsi}</p>
                                <div style={{ margin: '10px 0' }}>
                                    <strong>Spesifikasi Teknis:</strong>
                                    <p>
                                        <strong>File Dokumen:</strong>
                                        {selectedItem.produk_dokumen ? <a href={`http://127.0.0.1:8000/storage/${selectedItem.produk_dokumen}`} target="_blank" rel="noreferrer"> Lihat Dokumen</a> : " -"}
                                    </p>
                                    <p style={{ whiteSpace: 'pre-line', margin: '5px 0 0 10px', color: '#555' }}>
                                        {selectedItem.spesifikasi}
                                    </p>
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button className="btn-cancel" onClick={() => setShowDetail(false)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Item;