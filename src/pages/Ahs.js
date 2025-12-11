import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";

// Pastikan file CSS ini ada (untuk styling item dan tabel)
import "./Item.css";
import "../components/AhsList.css";

// ==================================================================
// 1. SUB-KOMPONEN: AHS DETAIL (Tampilan Rincian Item saat Accordion dibuka)
// ==================================================================
const AhsDetail = ({ selectedAhs }) => {
    if (!selectedAhs) return null;

    // Hitung total dari items
    const items = selectedAhs.items || [];
    const total = items.length > 0
        ? items.reduce((sum, item) => sum + ((item.volume || 0) * (item.hpp || 0)), 0)
        : (selectedAhs.hpp || 0);

    return (
        <div className="ahs-detail">
            {/* Header Detail */}
            <h4 className="detail-title" style={{ marginTop: 0, color: '#2e1a5e' }}>
                {selectedAhs.deskripsi}
            </h4>
            <p className="detail-info" style={{ color: '#666', marginBottom: '15px', fontSize: '13px' }}>
                {/* --- PERUBAHAN DI SINI: Ganti No AHS jadi ID --- */}
                ID: <strong>{selectedAhs.id}</strong> •
                Satuan: <strong>{selectedAhs.satuan}</strong> •
                Vendor: <strong>{selectedAhs.vendor?.vendor_name || selectedAhs.vendor?.nama || "-"}</strong>
            </p>

            {/* Tabel Rincian */}
            <div className="table-container">
                <table className="detail-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>ITEM ID</th>
                            <th style={{ padding: '8px' }}>URAIAN</th>
                            <th style={{ padding: '8px' }}>SATUAN</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>VOLUME</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>HPP (Rp)</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>JUMLAH (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? (
                            items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '8px' }}>
                                        {/* Cek semua kemungkinan nama property untuk ID */}
                                        {item.displayId || item.item_id || item.itemId || item.id || "-"}
                                    </td>
                                    <td style={{ padding: '8px' }}>{item.uraian}</td>
                                    <td style={{ padding: '8px' }}>{item.satuan}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.volume}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                        {Number(item.hpp).toLocaleString('id-ID')}
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                        {(item.volume * item.hpp).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#999' }}>
                                    Tidak ada rincian item.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', background: '#eef2f5' }}>
                            <td colSpan="5" style={{ padding: '10px', textAlign: 'right' }}>TOTAL</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                {total.toLocaleString('id-ID')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

// ==================================================================
// 2. SUB-KOMPONEN: AHS LIST TABLE (Tabel Utama)
// ==================================================================
const AhsListTable = ({ data, selectedId, onSelect, onEdit, onDelete }) => {

    // Helper: Hitung Total HPP untuk kolom tabel utama
    const calculateTotal = (ahs) => {
        if (ahs.items && ahs.items.length > 0) {
            return ahs.items.reduce((sum, item) => sum + (item.volume * item.hpp), 0);
        }
        return ahs.hpp || 0;
    };

    // Handler klik baris (Toggle Accordion)
    const handleRowClick = (e, id) => {
        e.stopPropagation();
        onSelect(id === selectedId ? null : id);
    };

    return (
        <div className="ahs-list-container">
            <div className="table-responsive">
                <table className="ahs-table">
                    <thead>
                        <tr>
                            {/* --- PERUBAHAN DI SINI: Header jadi ID --- */}
                            <th>ID</th>
                            <th>Deskripsi</th>
                            <th>Satuan</th>
                            <th>Provinsi</th>
                            <th>Kabupaten</th>
                            <th>Tahun</th>
                            <th>Harga Pokok Total</th>
                            <th className="sticky-action">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((ahs) => (
                                <React.Fragment key={ahs.id}>
                                    {/* --- BARIS DATA UTAMA --- */}
                                    <tr
                                        className={`ahs-row ${ahs.id === selectedId ? "active" : ""}`}
                                        onClick={(e) => handleRowClick(e, ahs.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {/* --- PERUBAHAN DI SINI: Tampilkan ahs.id --- */}
                                        <td>{ahs.id}</td>

                                        <td className="col-deskripsi">{ahs.deskripsi}</td>
                                        <td>{ahs.satuan}</td>
                                        <td>{ahs.provinsi}</td>
                                        <td>{ahs.kabupaten}</td>
                                        <td>{ahs.tahun}</td>
                                        <td className="col-hpp" style={{ fontWeight: 'bold', color: '#2e1a5e' }}>
                                            Rp {calculateTotal(ahs).toLocaleString('id-ID')}
                                        </td>

                                        {/* Kolom Aksi */}
                                        <td className="ahs-actions sticky-action">
                                            <button
                                                className="btn-icon btn-view"
                                                title={ahs.id === selectedId ? "Tutup Detail" : "Lihat Detail"}
                                                onClick={(e) => handleRowClick(e, ahs.id)}
                                            >
                                                {ahs.id === selectedId ? "❌" : "👁️"}
                                            </button>
                                            <button
                                                className="btn-icon btn-edit"
                                                title="Edit AHS"
                                                onClick={(e) => { e.stopPropagation(); onEdit(ahs.id); }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                title="Hapus AHS"
                                                onClick={(e) => { e.stopPropagation(); onDelete(ahs.id); }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>

                                    {/* --- BARIS DETAIL (ACCORDION) --- */}
                                    {ahs.id === selectedId && (
                                        <tr className="ahs-detail-row">
                                            <td colSpan="8" style={{ padding: 0, border: 'none' }}>
                                                <div style={{ padding: '20px', backgroundColor: '#fcfcfc', borderBottom: '2px solid #ddd' }}>
                                                    <AhsDetail selectedAhs={ahs} />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data-cell" style={{ textAlign: 'center', padding: '20px' }}>
                                    Tidak ada data ditemukan
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ==================================================================
// 3. KOMPONEN UTAMA: HALAMAN AHS (Main Page)
// ==================================================================
const Ahs = ({ dataAhsFromApp, onDeleteAhs }) => {
    const navigate = useNavigate();

    // Menggunakan data dari props (dari App.js) atau fallback ke array kosong
    const ahsList = dataAhsFromApp || [];

    // === UI States ===
    const [search, setSearch] = useState("");
    const [filterProvinsi, setFilterProvinsi] = useState("");
    const [filterKab, setFilterKab] = useState("");
    const [filterTahun, setFilterTahun] = useState("");

    // State untuk Accordion (ID yang sedang dibuka)
    const [selectedId, setSelectedId] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    // === Handlers ===
    const handleNavigateAdd = () => navigate("/ahs/add");

    const handleNavigateEdit = (id) => {
        navigate(`/ahs/edit/${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Yakin hapus data AHS ini?")) {
            // Panggil fungsi delete yang dikirim dari App.js
            if (onDeleteAhs) {
                onDeleteAhs(id);
                // Tutup detail jika yang dihapus sedang terbuka
                if (selectedId === id) setSelectedId(null);
            }
        }
    };

    // Filter Logic
    const filteredList = ahsList.filter(item => {
        const term = search.toLowerCase();
        const matchSearch =
            // --- PERUBAHAN LOGIKA SEARCH: Menambahkan pencarian by ID ---
            (item.id && item.id.toString().toLowerCase().includes(term)) ||
            (item.ahs_no && item.ahs_no.toLowerCase().includes(term)) ||
            (item.deskripsi && item.deskripsi.toLowerCase().includes(term));

        // Filter tambahan
        const matchProv = filterProvinsi ? (item.provinsi && item.provinsi.toLowerCase().includes(filterProvinsi.toLowerCase())) : true;
        const matchKab = filterKab ? (item.kabupaten && item.kabupaten.toLowerCase().includes(filterKab.toLowerCase())) : true;
        const matchTahun = filterTahun ? (item.tahun && item.tahun.toString().includes(filterTahun)) : true;

        return matchSearch && matchProv && matchKab && matchTahun;
    });

    return (
        <div className="vendor-container">
            <Sidebar />
            <div className="vendor-main">
                <Header />

                {/* --- Topbar Filter & Actions --- */}
                <div className="topbar-container">
                    <div className="topbar-left">
                        <div className="input-wrapper">
                            <span className="icon-search">🔍</span>
                            <input
                                type="text"
                                // Update placeholder text
                                placeholder="Cari "
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <input type="text" placeholder="Provinsi" value={filterProvinsi} onChange={(e) => setFilterProvinsi(e.target.value)} />
                        <input type="text" placeholder="Kabupaten" value={filterKab} onChange={(e) => setFilterKab(e.target.value)} />
                        <input type="text" placeholder="Tahun" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="input-tahun" />
                    </div>

                    <div className="topbar-right">
                        <button className="btn-action btn-export" onClick={() => alert("Fitur Export belum aktif")}>📥 Export</button>

                        <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                            <button className="btn-action btn-import" onClick={() => setShowDropdown(!showDropdown)}>📥 Import ▼</button>
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    <button onClick={() => alert("Download Template")}>📄 Unduh Template</button>
                                    <button onClick={() => alert("Upload File")}>📂 Pilih File</button>
                                </div>
                            )}
                        </div>

                        <button className="btn-action btn-new" onClick={handleNavigateAdd}>+ Baru</button>
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                <div className="vendor-content">
                    <AhsListTable
                        data={filteredList}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onEdit={handleNavigateEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
};

export default Ahs;