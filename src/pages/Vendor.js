import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/header";
import "./Vendor.css";
// IMPORT AXIOS
import axios from "axios";

// Definisikan BASE URL untuk kemudahan
const API_URL = "http://127.0.0.1:8000/api/vendors";

const Vendor = () => {
  // === 1. DATA DUMMY (DIHAPUS & DIGANTI DENGAN STATE KOSONG) ===
  // Mengganti data dummy dengan state untuk data yang akan diambil dari API
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false); // State untuk loading

  // === 2. STATE (TIDAK BERUBAH) ===

  // ... (State lainnya tetap sama)
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    vendor_no: "", vendor_name: "", contact_name: "", contact_no: "", email: "", provinsi: "", kab: "", tahun: ""
  });

  // State untuk Detail View
  const [showDetail, setShowDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [filterProvinsi, setFilterProvinsi] = useState("");
  const [filterKab, setFilterKab] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // Dropdown & Ref
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef(null);

  // === 3. LOGIC FILTER (DIHAPUS, DIGANTI DENGAN PANGGILAN API) ===

  // Data yang akan ditampilkan di tabel adalah hasil dari vendors state
  // Logika Filter sekarang akan digantikan oleh Back-end melalui API
  
  // === FUNGSI UTAMA: MENGAMBIL DATA DARI API ===
  const fetchVendors = async () => {
    setLoading(true);
    try {
        // Membangun URL dengan query params (filter)
        const params = new URLSearchParams();
        if (search) params.append('search', search); 
        if (filterProvinsi) params.append('provinsi', filterProvinsi);
        if (filterKab) params.append('kab', filterKab);
        if (filterTahun) params.append('tahun', filterTahun);

        const url = `${API_URL}?${params.toString()}`;
        
        const response = await axios.get(url);
        // Asumsi BE mengembalikan array vendor di response.data
        setVendors(response.data);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Gagal mengambil data vendor dari server.");
    } finally {
        setLoading(false);
    }
  };

  // useEffect untuk memuat data pertama kali dan saat filter berubah
  // Kita akan menggunakan 'vendors' sebagai data yang ditampilkan, jadi kita hilangkan 'filteredVendors'
  useEffect(() => {
    // Panggil fetchVendors setiap kali filter berubah
    fetchVendors();
  }, [filterProvinsi, filterKab, filterTahun, search]); 

  // Menggunakan 'vendors' untuk rendering tabel karena sudah difilter oleh BE
  const vendorsToDisplay = vendors; 


  // === 4. HANDLERS (LOGIC UTAMA) ===

  // A. Buka Modal untuk TAMBAH BARU (TIDAK BERUBAH)
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ // Reset form kosong
      vendor_no: "", vendor_name: "", contact_name: "", contact_no: "", email: "", provinsi: "", kab: "", tahun: ""
    });
    setShowModal(true);
  };

  // B. Buka Modal untuk EDIT (TIDAK BERUBAH)
  const handleOpenEdit = (vendor) => {
    setIsEditMode(true);
    setFormData(vendor); // Isi form dengan data yang dipilih
    setShowModal(true);
  };

  // C. Logic SIMPAN (Mengganti manipulasi state lokal dengan API POST/PUT)
  const handleSave = async () => {
    try {
        if (isEditMode) {
            const url = `${API_URL}/${formData.vendor_id}`;

            const payload = {
                ...formData,
                _method: "PUT",
            };

            await axios.post(url, payload); // ← pakai POST + _method PUT
            alert(`Data vendor ${formData.vendor_id} berhasil diperbarui!`);
        } else {
            const dataToSend = { ...formData };
            delete dataToSend.vendor_id;

            await axios.post(API_URL, dataToSend);
            alert("Vendor berhasil ditambahkan!");
        }

        fetchVendors();
    } catch (error) {
        console.error("Error saving data:", error.response?.data || error.message);
        alert(`Gagal menyimpan data.`);
    }

    setShowModal(false);
    setFormData({ vendor_no: "", vendor_name: "", contact_name: "", contact_no: "", email: "", provinsi: "", kab: "", tahun: "" });
  };

  // D. Logic View Detail (Data sudah diambil, hanya menampilkan modal, TIDAK BERUBAH)
  const handleView = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetail(true);
  };

  // E. Logic Hapus (Mengganti manipulasi state lokal dengan API DELETE)
  const handleDelete = async (vendor_id) => {
    if (window.confirm("Hapus vendor ini? Data akan hilang permanen!")) {
        try {
            const url = `${API_URL}/${vendor_id}`;
            await axios.delete(url);
            alert(`Vendor ID ${vendor_id} berhasil dihapus.`);
            
            // Ambil data terbaru setelah penghapusan
            fetchVendors(); 

        } catch (error) {
            console.error("Error deleting data:", error);
            alert("Gagal menghapus data vendor.");
        }
    }
  };

  // F. Logic Ekspor Data
  const handleExport = async () => {
    const exportUrl = "http://localhost:8000/api/vendors/export";
    try {
        const response = await axios.get(exportUrl, {
            responseType: 'blob', // Penting untuk download file
        });
        
        // Membuat URL objek dari blob data dan memicu download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // Asumsi BE mengirimkan header 'Content-Disposition' untuk nama file,
        // jika tidak, gunakan nama default:
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'vendors_data.xlsx'; // Default
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (fileNameMatch.length > 1) fileName = fileNameMatch[1];
        }

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        alert("Ekspor data berhasil!");

    } catch (error) {
        console.error("Error exporting data:", error);
        alert("Gagal mengekspor data vendor.");
    }
  };

  // G. Logic Unduh Template (Import)
  const handleDownloadTemplate = async () => {
    const templateURL = "http://127.0.0.1:8000/api/vendors/template/download";
    try {
        const response = await axios.get(templateURL, {
            responseType: 'blob', // Penting untuk download file
        });

        // Logika download file sama dengan Ekspor
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_import_vendor.xlsx'); // Sesuaikan nama file
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        alert("Template berhasil diunduh!");
        setShowDropdown(false); // Tutup dropdown setelah aksi
        
    } catch (error) {
        console.error("Error downloading template:", error);
        alert("Gagal mengunduh template import.");
    }
  };

  // H. Logic Import File
  const handleImportFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const importUrl = "http://localhost:8000/api/vendors/import";
    const formData = new FormData();
    formData.append('file', file); // Pastikan nama field ini sesuai dengan yang diterima Laravel

    try {
        await axios.post(importUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        alert("Import data berhasil! Data terbaru dimuat.");
        setShowDropdown(false);
        fileInputRef.current.value = null; // Reset input file
        fetchVendors(); // Muat ulang data untuk melihat hasil import

    } catch (error) {
        console.error("Error importing data:", error.response?.data || error.message);
        alert(`Gagal mengimpor data: ${error.response?.data?.message || 'Terjadi kesalahan saat upload file.'}`);
    }
  };
  
  // =========================================================================
  // ====================== BAGIAN RENDER (HANYA MENGUBAH EVENT HANDLER) =====
  // =========================================================================

  return (
    <div className="vendor-container">
      {/* ... (Sidebar & Header tidak berubah) ... */}
      <Sidebar />

      <div className="vendor-main">
      <Header/>

        {/* === TOPBAR === */}
        <div className="topbar-container">
          <div className="topbar-left">
            <div className="input-wrapper">
              <span className="icon-search">🔍</span>
              {/* setSearch akan memicu useEffect untuk fetchVendors */}
              <input
                type="text"
                placeholder="Cari"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Filter-filter ini akan memicu useEffect untuk fetchVendors */}
            <input placeholder="Provinsi" value={filterProvinsi} onChange={(e) => setFilterProvinsi(e.target.value)} />
            <input placeholder="Kab" value={filterKab} onChange={(e) => setFilterKab(e.target.value)} />
            <input placeholder="Tahun" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="input-tahun" />
          </div>

          <div className="topbar-right">
            {/* Mengganti alert dengan handleExport */}
            <button className="btn-action btn-export" onClick={handleExport}>📤 Ekspor</button>

            <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
              <button className="btn-action btn-import" onClick={() => setShowDropdown(!showDropdown)}>
                📥 Impor ▼
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  {/* Mengganti alert dengan handleDownloadTemplate */}
                  <button onClick={handleDownloadTemplate}>📄 Unduh Template</button>
                  <button onClick={() => fileInputRef.current.click()}>📂 Pilih File</button>
                </div>
              )}
            </div>

            {/* TOMBOL + BARU (handleOpenAdd tidak berubah) */}
            <button className="btn-action btn-new" onClick={handleOpenAdd}>
              + Baru
            </button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              // Mengganti console.log dengan handleImportFile
              onChange={handleImportFile}
            />
          </div>
        </div>

        {/* === TABEL === */}
        <div className="vendor-content">
          <div className="table-responsive">
            <table className="vendor-table">
              <thead>
                {/* ... (Header Tabel) ... */}
                <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Contact</th>
                    <th>Telepon</th>
                    <th>Email</th>
                    <th>Provinsi</th>
                    <th>Kab</th>
                    <th>Tahun</th>
                    <th className="sticky-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                            Memuat data...
                        </td>
                    </tr>
                ) : vendorsToDisplay.length > 0 ? (
                  vendorsToDisplay.map((v) => (
                    <tr key={v.id}>
                      {/* ... (Data Tabel tidak berubah) ... */}
                      <td>{v.vendor_no}</td>
                      <td className="col-name">{v.vendor_name}</td>
                      <td>{v.contact_name}</td>
                      <td>{v.contact_no}</td>
                      <td>{v.email}</td>
                      <td>{v.provinsi}</td>
                      <td>{v.kab}</td>
                      <td>{v.tahun}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-view" onClick={() => handleView(v)} title="Lihat">👁️</button>
                          <button className="btn-edit" onClick={() => handleOpenEdit(v)} title="Edit">✏️</button>
                          {/* handleDelete tidak berubah, hanya isinya yang ganti */}
                          <button className="btn-delete" onClick={() => handleDelete(v.vendor_id)} title="Hapus">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ... (Modal Tambah/Edit dan Modal Detail tidak berubah karena menggunakan handleSave) ... */}
        {showModal && (
          // ... (Modal Tambah/Edit) ...
          <div className="modal-overlay">
            <div className="modal" style={{ position: 'relative' }}>
              <h3>{isEditMode ? "Edit Data Vendor" : "Tambah Data Vendor"}</h3>
              <div className="modal-body">
                {isEditMode && (
                    <>
                      <label>ID Vendor</label>
                      <input value={formData.id} disabled style={{ backgroundColor: '#eee' }} />
                    </>
                  )}
                {/* ... (Input form lainnya tidak berubah) ... */}
                <label>Nama</label>
                <input
                  placeholder="Nama Perusahaan/Vendor"
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                />
                <label>Contact</label>
                <input
                  placeholder="Nama PIC"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
                <label>Telepon</label>
                <input
                  placeholder="Nomor Telepon"
                  value={formData.contact_no}
                  onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                />
                <label>Email</label>
                <input
                  placeholder="Alamat Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <label>Provinsi</label>
                <input
                  placeholder="Provinsi"
                  value={formData.provinsi}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                />
                <label>Kab</label>
                <input
                  placeholder="Kab"
                  value={formData.kab}
                  onChange={(e) => setFormData({ ...formData, kab: e.target.value })}
                />
                <label>Tahun</label>
                <input
                  type="number"
                  placeholder="Tahun Terdaftar"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                />
              </div>

              <div className="modal-buttons">
                {/* Tombol Simpan memicu handleSave yang sudah diubah ke API */}
                <button className="btn-save" onClick={handleSave}>
                  {isEditMode ? "Simpan Perubahan" : "Simpan Data"}
                </button>
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
              </div>

            </div>
          </div>
        )}
        
        {/* ... (Modal Detail View tidak berubah) ... */}
        {showDetail && selectedVendor && (
            <div className="modal-overlay">
                <div className="modal" style={{ position: 'relative' }}>
                    <h3>Detail Vendor</h3>
                    <div className="detail-content">
                        <p><strong>ID:</strong> {selectedVendor.vendor_no}</p>
                        <p><strong>Name:</strong> {selectedVendor.vendor_name}</p>
                        <p><strong>Contact:</strong> {selectedVendor.contact_name}</p>
                        <p><strong>Phone:</strong> {selectedVendor.contact_no}</p>
                        <p><strong>Email:</strong> {selectedVendor.email}</p>
                        <p><strong>Provinsi:</strong> {selectedVendor.provinsi}</p>
                        <p><strong>Kab:</strong> {selectedVendor.kab}</p>
                        <p><strong>Tahun:</strong> {selectedVendor.tahun}</p>
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

export default Vendor;