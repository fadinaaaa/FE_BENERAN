import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Notification from "../components/Notification";
import ItemSelector from "../components/ItemSelector";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/AddAHS.css";

const AddAHS = ({ onAddSubmit, onEditSubmit, allItemList, allAhsData }) => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    // --- DEBUGGING: Cek data yang diterima ---
    // console.log("Mode Edit:", isEditMode);
    // console.log("ID dari URL:", id);
    // console.log("Data AHS Global:", allAhsData);

    const [formData, setFormData] = useState({
        ahs: "",
        deskripsi: "",
        satuan: "m3",
        provinsi: "",
        kab: "",
        tahun: new Date().getFullYear().toString(),
        merek: "",
        vendor: "",
        foto: null,
        deskripsiProduk: "",
        spesifikasiFile: null,
        spesifikasiTeks: "",
    });

    const [items, setItems] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [selectedItemToAdd, setSelectedItemToAdd] = useState(null);
    const [currentItemVolume, setCurrentItemVolume] = useState(1);

    // 1. Generate ID Otomatis jika Mode Tambah
    useEffect(() => {
        if (!isEditMode) {
            const generateAHSId = () => {
                const randomNum = Math.floor(100 + Math.random() * 900);
                return `AHS-${randomNum}`;
            };
            setFormData((prev) => ({ ...prev, ahs: generateAHSId() }));
        }
    }, [isEditMode]);

    // 2. Load Data jika Mode Edit
    useEffect(() => {
        // Pastikan allAhsData ada isinya sebelum mencari
        if (isEditMode && allAhsData && allAhsData.length > 0) {

            // Cari data (Gunakan String() untuk keamanan tipe data)
            const dataToEdit = allAhsData.find((item) => String(item.id) === String(id));

            if (dataToEdit) {
                console.log("Data ditemukan untuk Edit:", dataToEdit); // Debugging

                // Logika Penanganan Vendor yang Aman
                let vendorName = "";
                if (dataToEdit.vendor) {
                    if (typeof dataToEdit.vendor === 'object') {
                        vendorName = dataToEdit.vendor.vendor_name || dataToEdit.vendor.nama || "";
                    } else {
                        vendorName = dataToEdit.vendor;
                    }
                }

                setFormData({
                    ahs: dataToEdit.ahs_no || dataToEdit.ahs || `AHS-${dataToEdit.id}`,
                    deskripsi: dataToEdit.deskripsi || "",
                    satuan: dataToEdit.satuan || "m3",
                    provinsi: dataToEdit.provinsi || "",
                    kab: dataToEdit.kab || "",
                    tahun: dataToEdit.tahun || "",
                    merek: dataToEdit.merek || "",
                    vendor: vendorName,
                    foto: dataToEdit.produk_foto || dataToEdit.foto || null,
                    deskripsiProduk: dataToEdit.produk_deskripsi || dataToEdit.deskripsiProduk || "",
                    spesifikasiFile: dataToEdit.produk_dokumen || dataToEdit.spesifikasiFile || null,
                    spesifikasiTeks: dataToEdit.spesifikasi || dataToEdit.spesifikasiTeks || "",
                });

                // Mapping Items dengan Safety Check
                const loadedItems = (dataToEdit.items || []).map(i => ({
                    itemId: i.item_id || i.itemId || "UNKNOWN",
                    uraian: i.uraian || "Item Tanpa Nama",
                    satuan: i.satuan || "-",
                    volume: i.volume || 0,
                    hpp: i.hpp || 0
                }));
                setItems(loadedItems);
            } else {
                console.warn(`Data AHS dengan ID ${id} tidak ditemukan di allAhsData.`);
            }
        }
    }, [isEditMode, id, allAhsData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "foto" || name === "spesifikasiFile") {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItemToAdd(item);
    };

const handleAddItem = () => {
        if (!selectedItemToAdd || !currentItemVolume) {
            alert("Silakan pilih item dan isi volumenya.");
            return;
        }

        // Cek duplikasi
        const checkId = selectedItemToAdd.kode || selectedItemToAdd.id || selectedItemToAdd.item_id;
        const isDuplicate = items.some((item) => item.itemId === checkId);

        if (isDuplicate) {
            alert("Item ini sudah ada di daftar.");
            return;
        }

        const itemToSave = {
            // ID Asli (Integer) untuk dikirim ke Database/Backend
            itemId: selectedItemToAdd.id, 
            
            // === [TAMBAHAN] ID Tampilan untuk Tabel (ambil dari UniversalSelector) ===
            displayId: selectedItemToAdd.displayId || selectedItemToAdd.item_no || selectedItemToAdd.id,

            // Ambil data lainnya
            uraian: selectedItemToAdd.displayName || selectedItemToAdd.uraian,
            satuan: selectedItemToAdd.displayUnit || selectedItemToAdd.satuan,
            volume: Number(currentItemVolume),
            hpp: Number(selectedItemToAdd.displayPrice || selectedItemToAdd.hpp || 0),
        };

        setItems((prevItems) => [...prevItems, itemToSave]);
        setSelectedItemToAdd(null);
        setCurrentItemVolume(1);
    };

    const handleRemoveItem = (itemId) => {
        if (window.confirm("Yakin ingin menghapus item ini dari AHS?")) {
            setItems((prev) => prev.filter((item) => item.itemId !== itemId));
        }
    };

    const handleSave = () => {
        if (!formData.deskripsi) {
            alert("Deskripsi pekerjaan wajib diisi!");
            return;
        }
        setShowNotification(true);
    };

    const confirmSave = () => {
        setShowNotification(false);

        // Hitung total saat save
        const calculatedTotal = items.reduce((sum, item) => sum + (item.volume * item.hpp), 0);

        const ahsDataToSubmit = {
            id: isEditMode ? Number(id) : Date.now(),
            ahs_no: formData.ahs,
            deskripsi: formData.deskripsi,
            satuan: formData.satuan,
            hpp: calculatedTotal,
            provinsi: formData.provinsi,
            kab: formData.kab,
            tahun: formData.tahun,
            merek: formData.merek,
            vendor: { vendor_name: formData.vendor },

            // Mapping Items agar sesuai struktur Database/App
            items: items.map(i => ({
                item_id: i.itemId,
                uraian: i.uraian,
                satuan: i.satuan,
                volume: Number(i.volume),
                hpp: Number(i.hpp)
            })),

            produk_foto: formData.foto,
            produk_deskripsi: formData.deskripsiProduk,
            produk_dokumen: formData.spesifikasiFile,
            spesifikasi: formData.spesifikasiTeks,

            // Simpan field legacy agar kompatibel
            foto: formData.foto,
            deskripsiProduk: formData.deskripsiProduk,
            spesifikasiFile: formData.spesifikasiFile,
            spesifikasiTeks: formData.spesifikasiTeks,
        };

        if (isEditMode) {
            onEditSubmit(ahsDataToSubmit);
        } else {
            onAddSubmit(ahsDataToSubmit);
        }
        navigate("/ahs");
    };

    // Style Helper
    const inputWrapperStyle = { marginBottom: '15px', width: '100%' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#333' };
    const inputStyle = {
        width: '100%', padding: '10px', borderRadius: '5px',
        border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px'
    };
    return (
        <div className="add-ahs-content">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <button onClick={() => navigate('/ahs')} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    <FaArrowLeft size={20} color="#333" />
                </button>
                <h2 style={{ margin: 0 }}>{isEditMode ? "Edit Data AHS" : "Tambah Data AHS"}</h2>
            </div>

            <form className="ahs-form">
                {/* Form Inputs */}
                <div style={inputWrapperStyle}>
                    <label>ID</label>
                    <input type="text" name="ahs" value={formData.ahs} readOnly style={{ backgroundColor: "#f5f5f5", width: '100%' }} />
                </div>

                <div style={inputWrapperStyle}>
                    <label>Deskripsi Pekerjaan</label>
                    <input type="text" name="deskripsi" value={formData.deskripsi} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={inputWrapperStyle}>
                        <label>Satuan</label>
                        <input type="text" name="satuan" value={formData.satuan} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div style={inputWrapperStyle}>
                        <label>Tahun</label>
                        <input type="text" name="tahun" value={formData.tahun} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={inputWrapperStyle}>
                        <label>Provinsi</label>
                        <input type="text" name="provinsi" value={formData.provinsi} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div style={inputWrapperStyle}>
                        <label>Kab</label>
                        <input type="text" name="kab" value={formData.kab} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={inputWrapperStyle}>
                        <label>Merek</label>
                        <input type="text" name="merek" value={formData.merek} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                    <div style={inputWrapperStyle}>
                        <label>Vendor</label>
                        <input type="text" name="vendor" value={formData.vendor} onChange={handleChange} style={{ width: '100%' }} />
                    </div>
                </div>

                {/* 1. Deskripsi Produk */}
                <div style={inputWrapperStyle}>
                    <label style={labelStyle}>Deskripsi Produk</label>
                    <input
                        type="text"
                        name="deskripsiProduk"
                        value={formData.deskripsiProduk}
                        onChange={handleChange}
                        placeholder="Contoh: Semen Gresik 50kg Tipe 1"
                        style={inputStyle}
                    />
                </div>

                <div style={inputWrapperStyle}>
                    <label style={labelStyle}>Upload Foto Produk</label>
                    <input type="file" name="foto" onChange={handleChange} accept="image/*" style={{ ...inputStyle, padding: '7px' }} />
                    {(formData.foto instanceof File) && <small style={{ display: 'block', marginTop: '5px', color: 'green' }}>File terpilih: {formData.foto.name}</small>}
                </div>

                {/* 2. Spesifikasi (Dokumen & Teks Menyatu) */}
                <div style={inputWrapperStyle}>
                    <label style={labelStyle}>Spesifikasi (Dokumen & Teks)</label>

                    {/* Input File (Bagian Atas) */}
                    <input
                        type="file"
                        name="spesifikasiFile"
                        onChange={handleChange}
                        style={{ ...inputStyle, marginBottom: '0', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: '1px solid #eee' }}
                    />

                    {/* Textarea (Bagian Bawah) */}
                    <textarea
                        name="spesifikasiTeks"
                        value={formData.spesifikasiTeks}
                        onChange={handleChange}
                        placeholder="Contoh: &#10;• Berat: 50kg&#10;• Standar: SNI"
                        rows="4"
                        style={{
                            ...inputStyle,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            resize: 'vertical',
                            minHeight: '80px',
                            marginTop: '-1px' // Agar border menyatu sempurna
                        }}
                    ></textarea>

                    {(formData.spesifikasiFile instanceof File) && <small style={{ display: 'block', marginTop: '5px', color: 'green' }}>Dokumen terpilih: {formData.spesifikasiFile.name}</small>}
                </div>

                <hr style={{ margin: "20px 0", borderTop: "1px solid #eee" }} />

                <h3>Item</h3>

                {/* Item Selector Section */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div style={{ flex: 3 }}>
                        <ItemSelector
                            itemList={allItemList}
                            // Ubah 'selectedItem' menjadi 'selectedObject' (Sesuai kode Child Component)
                            selectedObject={selectedItemToAdd}
                            onSelect={handleItemSelect}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Volume</label>
                        <input
                            type="number"
                            value={currentItemVolume}
                            onChange={(e) => setCurrentItemVolume(e.target.value)}
                            style={{ width: '100%', padding: '10px', height: '42px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="btn-save"
                        style={{ height: '42px', padding: '0 20px' }}
                    >
                        + Tambah
                    </button>
                </div>

                {/* Table Items */}
                <div className="item-list">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: '#f0f0f0' }}>
                            <tr>
                                <th style={{ padding: '8px', width: '100px', textAlign: 'left' }}>ITEM ID</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Uraian</th>
                                <th style={{ padding: '8px', width: '80px' }}>Satuan</th>
                                <th style={{ padding: '8px', width: '80px', textAlign: 'center' }}>Vol</th>
                                <th style={{ padding: '8px', width: '120px', textAlign: 'right' }}>HPP</th>
                                <th style={{ padding: '8px', width: '120px', textAlign: 'right' }}>Jumlah</th>
                                <th style={{ padding: '8px', width: '60px', textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                    {/* === [PERUBAHAN] Tampilkan Display ID, kalau tidak ada pakai Item ID biasa === */}
                                    <td style={{ padding: '8px' }}>{item.displayId || item.itemId}</td>

                                    <td style={{ padding: '8px' }}>{item.uraian}</td>
                                    <td style={{ padding: '8px' }}>{item.satuan}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.volume}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.hpp.toLocaleString('id-ID')}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{(item.volume * item.hpp).toLocaleString('id-ID')}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.itemId)}
                                            style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '15px', color: '#888' }}>
                                        Belum ada rincian item.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                            <tr>
                                <td colSpan="5" style={{ padding: '10px', textAlign: 'right' }}>TOTAL HARGA POKOK:</td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                    {items.reduce((sum, i) => sum + (i.volume * i.hpp), 0).toLocaleString('id-ID')}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Buttons */}
                <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                    <button type="button" className="btn-save" onClick={handleSave} style={{ flex: 1 }}>
                        {isEditMode ? "Simpan Perubahan" : "Simpan Data Baru"}
                    </button>
                    <button type="button" className="btn-cancel" onClick={() => navigate('/ahs')} style={{ flex: 1 }}>
                        Batal
                    </button>
                </div>
            </form>

            {showNotification && (
                <Notification
                    message={isEditMode ? "Simpan perubahan data ini?" : "Simpan data baru ini?"}
                    onConfirm={confirmSave}
                    onCancel={() => setShowNotification(false)}
                />
            )}
        </div>
    );
};

export default AddAHS;