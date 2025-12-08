import React, { useState, useRef } from "react";
import "../pages/Vendor.css";

const Topbar = ({
  search, setSearch,
  filterProvinsi, setFilterProvinsi,
  filterKab, setFilterKab,
  filterTahun, setFilterTahun,
  onAddNew, // <-- Prop untuk membuka modal 'Tambah Baru'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);

  // Helper untuk handle change dengan aman (mencegah error jika prop tidak dikirim)
  // Catatan: Fungsi ini tidak diperlukan lagi jika kita menggunakan onChange langsung
  // pada input seperti yang sudah Anda lakukan, tapi saya pertahankan untuk clarity.
  const safeSet = (setter, value) => {
    if (setter) setter(value);
  };
  
  // 1. LOGIC INTERNAL TOPBAR
  
  // Handler untuk Ekspor (Dummy)
  const handleExport = () => {
      alert("Logic Ekspor data");
  };

  // Handler untuk Unduh Template (Dummy)
  const handleDownloadTemplate = () => {
      alert("Unduh Template Logic");
      setShowDropdown(false); 
  };
  
  // Handler untuk input file (Impor)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File diimpor:", file.name); 
      alert(`File ${file.name} siap diproses!`);
    }
    setShowDropdown(false); 
    // Reset input file agar bisa import file yang sama lagi
    e.target.value = null; 
  };

  // Handler untuk Pilih File (memicu input file tersembunyi)
  const handleSelectFile = () => {
      fileInputRef.current.click();
      // handleFileChange akan menangani setShowDropdown(false)
  };


  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <div className="input-wrapper">
          <span className="icon-search">🔍</span>
          <input
            type="text"
            placeholder="Cari"
            // Menggunakan prop langsung (search dan setSearch)
            value={search}
            onChange={(e) => safeSet(setSearch, e.target.value)}
          />
        </div>
        <input 
            placeholder="Provinsi" 
            value={filterProvinsi} 
            onChange={(e) => safeSet(setFilterProvinsi, e.target.value)} 
        />
        <input 
            placeholder="Kab" 
            value={filterKab} 
            onChange={(e) => safeSet(setFilterKab, e.target.value)} 
        />
        <input 
            placeholder="Tahun" 
            value={filterTahun} 
            onChange={(e) => safeSet(setFilterTahun, e.target.value)} 
            className="input-tahun" 
        />
      </div>

      <div className="topbar-right">
        {/* Menggunakan handler lokal yang sudah didefinisikan */}
        <button className="btn-action btn-export" onClick={handleExport}>📤 Ekspor</button>

        <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
          <button className="btn-action btn-import" onClick={() => setShowDropdown(!showDropdown)}>
            📥 Impor ▼
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleDownloadTemplate}>📄 Unduh Template</button>
              <button onClick={handleSelectFile}>📂 Pilih File</button>
            </div>
          )}
        </div>

        {/* TOMBOL + BARU: Menggunakan prop onAddNew */}
        <button className="btn-action btn-new" onClick={onAddNew}>
          + Baru
        </button>

        {/* Input File Tersembunyi untuk Import */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
      </div>
    </div>
  );
};

export default Topbar;