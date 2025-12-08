// src/data/ahsData.js

export const AHS_LIST = [
  {
    id: "AHS1",
    deskripsi: "Pekerjaan Uitzet/Ukur Ulang & Marking",
    satuan: "Unit",
    provinsi: "Jawa Timur",
    kabupaten: "Madiun",
    tahun: "2024",
    total: 0, // akan dihitung di komponen
    items: [
      { itemId: "M_100", uraian: "Sewa Motor", satuan: "Hr", volume: 0.05, hpp: 24000 },
      { itemId: "M_101", uraian: "Alat Ukur", satuan: "Bh", volume: 0.05, hpp: 70000 },
      { itemId: "M_084", uraian: "Tenaga Ahli", satuan: "ho", volume: 0.01, hpp: 281446 },
      { itemId: "M_088", uraian: "Surveyor", satuan: "ho", volume: 0.02, hpp: 175910 },
      { itemId: "M_089", uraian: "Juru Gambar", satuan: "ho", volume: 0.04, hpp: 205228 },
    ],
  },
  {
    id: "AHS2",
    deskripsi: "Administrasi dan Dokumentasi",
    satuan: "Unit",
    provinsi: "Jawa Tengah",
    kabupaten: "Wonogiri",
    tahun: "2025",
    total: 0, // akan dihitung di komponen
    items: [
      { itemId: "M_114", uraian: "Kertas folio 70 gr", satuan: "Rim", volume: 0.02, hpp: 37600 },
      { itemId: "M_115", uraian: "Ball point", satuan: "Bh", volume: 0.02, hpp: 550 },
      { itemId: "M_116", uraian: "Kertas sampul", satuan: "Lbr", volume: 0.02, hpp: 82 },
      { itemId: "M_117", uraian: "Cetak gambar", satuan: "Bh", volume: 0.08, hpp: 1200 },
      { itemId: "M_118", uraian: "Tinta print refill", satuan: "Bh", volume: 0.02, hpp: 55800 },
    ],
  },
];
