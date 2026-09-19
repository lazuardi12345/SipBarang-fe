import { TarifPengiriman } from "./../domain/entities/TarifPengiriman";

/**
 * Data master tarif ini diambil langsung dari surat "Kiriman Dari Karawang -
 * Mobil CDD 8 Ton (Panjang 6 M)" milik PT Almira Yuniar Trek.
 * Kolom "Total - PPh 2%" pada surat asli sudah otomatis dihitung di sini
 * lewat helper `hitungTotalSetelahPPh` bila suatu saat tarif berubah.
 */

let counter = 0;
function row(
  areaDistribusi,
  tujuanKirim,
  total,
  totalSetelahPPh
) {
  counter += 1;
  return {
    id: `tarif-${counter}`,
    areaDistribusi,
    tujuanKirim,
    total,
    totalSetelahPPh,
  };
}

export const SEED_TARIF = [
  // Zona 1
  row("Zona 1", "Cikampek", 441000, 432180),
  row("Zona 1", "Cikarang", 490000, 480200),
  row("Zona 1", "Haurgelis, Sukra", 978000, 958440),
  row("Zona 1", "Karawang", 490000, 480200),
  row("Zona 1", "Pagaden Baru", 1164000, 1140720),
  row("Zona 1", "Pamanukan", 1164000, 1140720),
  row("Zona 1", "Purwakarta", 553000, 541940),
  row("Zona 1", "Subang", 701000, 686980),

  // Zona 2
  row("Zona 2", "Bandung", 1601000, 1568980),
  row("Zona 2", "Bekasi Timur", 582000, 570360),
  row("Zona 2", "Bekasi Utara", 699000, 685020),
  row("Zona 2", "Indramayu", 2518000, 2467640),
  row("Zona 2", "Jatibarang", 2518000, 2467640),
  row("Zona 2", "Sumedang", 2168000, 2124640),
  row("Zona 2", "Tambun", 582000, 570360),

  // Zona 3
  row("Zona 3", "Bantarujek", 2518000, 2467640),
  row("Zona 3", "Cidaun Garut", 3711000, 3636780),
  row("Zona 3", "Cikijing", 2518000, 2467640),
  row("Zona 3", "Cililin", 1601000, 1568980),
  row("Zona 3", "Cirebon", 2649000, 2596020),
  row("Zona 3", "Garut", 2430000, 2381400),
  row("Zona 3", "Kuningan", 2823000, 2766540),
  row("Zona 3", "Lemah Sugih", 1345000, 1318100),
  row("Zona 3", "Majalengka", 2678000, 2624440),
  row("Zona 3", "Malongbong", 2430000, 2381400),
  row("Zona 3", "Pengalengan - Bandung", 1892000, 1854160),
  row("Zona 3", "Saguling - Bandung", 1601000, 1568980),
  row("Zona 3", "Singaparna Tasik", 2969000, 2909620),
  row("Zona 3", "Tasikmalaya", 2969000, 2909620),
  row("Zona 3", "Wado", 2678000, 2624440),

  // Zona 4
  row("Zona 4", "Banjar", 1524000, 1493520),
  row("Zona 4", "Bayongbong, Cikajang", 1300000, 1274000),
  row("Zona 4", "Bungbulang", 3711000, 3636780),
  row("Zona 4", "Ciamis", 3376000, 3308480),
  row("Zona 4", "Ciawi - Pangandaran", 1704000, 1669920),
  row("Zona 4", "Cibeber Cikalong Tasik", 3376000, 3308480),
  row("Zona 4", "Cibingbin", 3318000, 3251640),
  row("Zona 4", "Cijulang, Parigi", 3580000, 3508400),
  row("Zona 4", "Ciledug (Cirebon)", 2649000, 2596020),
  row("Zona 4", "Cinunuk Wanaraja - Garut", 1166000, 1142680),
  row("Zona 4", "Cipatujah", 3580000, 3508400),
  row("Zona 4", "Cipongkor", 1600000, 1568000),
  row("Zona 4", "Cisayong/Cikalong Tasikmalaya", 3376000, 3308480),
  row("Zona 4", "Jatinegara Hayawang Ciamis", 3376000, 3308480),
  row("Zona 4", "Karangnunggal Tasik", 1562000, 1530760),
  row("Zona 4", "Kawali", 1793000, 1757140),
  row("Zona 4", "Malausma", 1582000, 1550360),
  row("Zona 4", "Pacet (Bandung)", 1892000, 1854160),
  row("Zona 4", "Pamempek", 3711000, 3636780),
  row("Zona 4", "Pamijahan", 3376000, 3308480),
  row("Zona 4", "Pangandaran - Parigi", 3580000, 3508400),
  row("Zona 4", "Parung Ponteng", 1952000, 1912960),
  row("Zona 4", "Purbayani", 1556000, 1524880),
  row("Zona 4", "Rancabuaya", 3711000, 3636780),
  row("Zona 4", "Rancah", 1793000, 1757140),
  row("Zona 4", "Salopa", 3376000, 3308480),
  row("Zona 4", "Sedong", 2649000, 2596020),
  row("Zona 4", "Sela Gebang", 1767000, 1731660),
  row("Zona 4", "Sindang Laut", 2649000, 2596020),
  row("Zona 4", "Singajaya", 1556000, 1524880),
  row("Zona 4", "Talaga", 2518000, 2467640),

  // Jabodetabek - Jakarta
  row("Jabodetabek - Jakarta", "Cakung", 771000, 755580),
  row("Jabodetabek - Jakarta", "Cengkareng", 1077000, 1055460),
  row("Jabodetabek - Jakarta", "Jakarta Barat", 1062000, 1040760),
  row("Jabodetabek - Jakarta", "Jakarta Pusat", 1062000, 1040760),
  row("Jabodetabek - Jakarta", "Jakarta Selatan", 1062000, 1040760),
  row("Jabodetabek - Jakarta", "Jakarta Timur", 771000, 755580),
  row("Jabodetabek - Jakarta", "Jakarta Utara", 1077000, 1055460),
  row("Jabodetabek - Jakarta", "Sunda Kelapa", 1077000, 1055460),
  row("Jabodetabek - Jakarta", "Tanjung Priok", 1077000, 1055460),

  // Jabodetabek - Bekasi + Depok
  row("Jabodetabek - Bekasi & Depok", "Bekasi Barat", 698000, 684040),
  row("Jabodetabek - Bekasi & Depok", "Depok", 1499000, 1469020),
  row("Jabodetabek - Bekasi & Depok", "Jatiwaringin", 699000, 685020),
  row("Jabodetabek - Bekasi & Depok", "Jatiwarna", 699000, 685020),
  row("Jabodetabek - Bekasi & Depok", "Lubang Buaya", 809000, 792820),
  row("Jabodetabek - Bekasi & Depok", "Pondok Gede", 809000, 792820),
  row("Jabodetabek - Bekasi & Depok", "Pulo Gebang", 702000, 687960),
  row("Jabodetabek - Bekasi & Depok", "Ujung Aspal Bekasi", 809000, 792820),
  row("Jabodetabek - Bekasi & Depok", "Muara Gembong", 946000, 927080),

  // Pandeglang, Serang, Rangkasbitung - Tangerang dsk
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Banten", 1082000, 1060360),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Bayah", 1693000, 1659140),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Cikotok", 1701000, 1666980),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Cilegon", 2474000, 2424520),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Malimping, Labuhan", 2474000, 2424520),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Merak", 1371000, 1343580),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Pandeglang", 2474000, 2424520),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Rangkasbitung", 1082000, 1060360),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Serang", 1041000, 1020180),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Tangerang", 1455000, 1425900),
  row("Pandeglang/Serang/Rangkasbitung - Tangerang", "Cisauk", 958000, 938840),

  // Sukabumi
  row("Sukabumi", "Cianjur Kota", 1165000, 1141700),
  row("Sukabumi", "Sukabumi / Cibadak", 1892000, 1854160),
  row("Sukabumi", "Jampang Surade / Kulon", 1371000, 1343580),
  row("Sukabumi", "Ujung Genteng, Ciracap", 1371000, 1343580),
  row("Sukabumi", "Pelabuhan Ratu", 2474000, 2424520),

  // Bogor
  row("Bogor", "Bogor", 1499000, 1469020),
  row("Bogor", "Ciawi", 1426000, 1397480),
  row("Bogor", "Cimanggu", 876000, 858480),
  row("Bogor", "Cisarua", 1426000, 1397480),
  row("Bogor", "Jasinga", 1892000, 1854160),
  row("Bogor", "Leuwiliang", 1499000, 1469020),
  row("Bogor", "Cigombong", 1499000, 1469020),
  row("Bogor", "Parung", 1499000, 1469020),
  row("Bogor", "Ciampea", 793000, 777140),
  row("Bogor", "Cibungbulan", 793000, 777140),
  row("Bogor", "Jonggol", 728000, 713440),
  row("Bogor", "Puncak", 1426000, 1397480),
  row("Bogor", "Cianjur Selatan", 2223000, 2178540),
  row("Bogor", "Semplak", 608000, 595840),
];
