import React, { useState } from 'react';
import './header.css'; // Pastikan file CSS ini diimpor

const Header = () => {
    // 1. State untuk mengontrol visibilitas dropdown
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    
    // Data dummy (ganti dengan data admin/user yang sebenarnya)
    const adminName = 'Admin'; 

    // 2. Fungsi untuk menangani klik ikon profil
    const handleProfileClick = () => {
        // Toggle visibilitas dropdown
        setDropdownVisible(prev => !prev);
    };

    // 3. Fungsi untuk menangani logout
    const handleLogout = () => {
        alert('Admin berhasil Logout!'); // Ganti dengan logika logout yang sebenarnya (misalnya menghapus token, navigasi ke halaman login)
        setDropdownVisible(false); // Tutup dropdown setelah logout
    };

    return (
        <header 
            className="header-bar" 
            // Style inline yang Anda berikan
            style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                padding: '10px 25px', 
                background: 'white', 
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                position: 'relative', // PENTING: Untuk posisi dropdown
                zIndex: 100 // Pastikan Header di atas konten lain
            }}
        >
            <div className="profile-container">
                {/* Ikon Profil (Button) */}
                <button 
                    className="profile-icon" 
                    onClick={handleProfileClick}
                >
                    👤
                </button>

                {/* Dropdown Profil (Conditional Rendering) */}
                {isDropdownVisible && (
                    <div className="profile-dropdown">
                        <p className="admin-name">{adminName}</p>
                        <hr />
                        <button 
                            className="logout-button" 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;