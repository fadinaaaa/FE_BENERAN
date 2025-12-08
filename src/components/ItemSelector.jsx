// src/components/UniversalSelector.jsx

import React, { useState, useMemo } from "react";
import "./ItemSelector.css"; 

const UniversalSelector = ({ itemList, ahsList, selectedObject, onSelect }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // === GABUNGKAN DATA & FILTER ===
  const unifiedData = useMemo(() => {
    const term = searchTerm.toLowerCase();

    // 1. Format Item (Material/Upah)
    const formattedItems = (itemList || []).map(item => ({
      ...item,
      uniqueId: `ITEM-${item.id}`, 
      type: 'ITEM', // Tetap disimpan di background untuk logic, tapi tidak ditampilkan
      // Gunakan field 'kode' atau 'id' sesuai database Anda. 
      // Jika di DB cuma angka (1), bisa di format string: `M_${item.id}`
      displayId: item.kode || item.item_id || `M_${item.id}`, 
      displayName: item.uraian || item.nama,
      displayUnit: item.satuan,
      displayPrice: item.hpp
    }));

    // 2. Format AHS
    const formattedAhs = (ahsList || []).map(ahs => ({
      ...ahs,
      uniqueId: `AHS-${ahs.id}`,
      type: 'AHS',
      // Gunakan 'ahs_no' jika ada, atau format manual
      displayId: ahs.ahs_no || `AHS-${ahs.id}`,
      displayName: ahs.deskripsi || ahs.uraian,
      displayUnit: ahs.satuan || ahs.unit,
      displayPrice: ahs.total || ahs.hpp || 0
    }));

    // 3. Gabung
    const allData = [...formattedItems, ...formattedAhs];

    // 4. Filter
    return allData.filter(obj => {
      const idMatch = obj.displayId ? obj.displayId.toString().toLowerCase().includes(term) : false;
      const nameMatch = obj.displayName ? obj.displayName.toLowerCase().includes(term) : false;
      return idMatch || nameMatch;
    });

  }, [itemList, ahsList, searchTerm]);

  // === HANDLER ===
  const handleSelect = (obj) => {
    onSelect(obj); 
    setShowModal(false); 
    setSearchTerm(""); 
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchTerm("");
  };

  return (
    <div className="item-selector-container">
      {/* INPUT TRIGGER */}
      <div className="input-group">
        <input
          type="text"
          className="selector-display"
          placeholder="Cari Item atau AHS..."
          // TAMPILAN SAAT DIPILIH: "ID - NAMA"
          value={selectedObject ? `${selectedObject.displayId || selectedObject.id} - ${selectedObject.displayName || selectedObject.uraian || selectedObject.deskripsi}` : ""}
          readOnly
          onClick={() => setShowModal(true)}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Pilih Item</h3>
              <span className="close-icon" onClick={handleClose}>&times;</span>
            </div>

            <div className="modal-search-box">
              <input
                type="text"
                placeholder="Ketik ID (Contoh: M_001 atau AHS-01) atau Nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="table-responsive">
              <table className="item-table">
                <thead>
                  <tr>
                    {/* Kolom Tipe Dihapus, ID jadi yang pertama */}
                    <th style={{ width: '20%' }}>ID</th>
                    <th>Uraian / Deskripsi</th>
                    <th style={{ width: '10%' }}>Satuan</th>
                    <th style={{ textAlign: "right", width: '20%' }}>Harga</th>
                    <th style={{ textAlign: "center", width: '10%' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {unifiedData.length > 0 ? (
                    unifiedData.map((obj) => (
                      <tr key={obj.uniqueId} className="item-row" onClick={() => handleSelect(obj)}>
                        {/* Tampilkan ID sebagai pembeda (M_... atau AHS-...) */}
                        <td style={{ fontWeight: 'bold', color: '#333' }}>
                            {obj.displayId}
                        </td>
                        <td>{obj.displayName}</td>
                        <td>{obj.displayUnit}</td>
                        <td style={{ textAlign: "right" }}>
                          {Number(obj.displayPrice).toLocaleString("id-ID")}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn-pilih-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(obj);
                            }}
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        Data tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleClose}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSelector;