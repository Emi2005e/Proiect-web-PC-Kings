CREATE USER emi WITH ENCRYPTED PASSWORD 'emi';
GRANT ALL PRIVILEGES ON DATABASE cti_2026 TO emi;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emi;


-- e. Categorie mare (ENUM cu maxim 5 valori)
CREATE TYPE tip_componenta AS ENUM ('procesor', 'placa_video', 'memorie_ram', 'stocare', 'sursa');


CREATE TABLE componente (
    id SERIAL PRIMARY KEY, -- a. id
    nume VARCHAR(255) NOT NULL, -- b. nume
    descriere TEXT NOT NULL, -- c. descriere
    imagine VARCHAR(255) NOT NULL, -- d. imagine
    categorie tip_componenta NOT NULL, -- e. categorie ENUM
    producator VARCHAR(100) NOT NULL, -- f. categorie minora
    pret NUMERIC(8, 2) NOT NULL, -- g. caracteristica numerica 1
    garantie_luni INTEGER NOT NULL, -- h. caracteristica numerica 2
    data_adaugare DATE NOT NULL, -- i. caracteristica tip Date
    stare_produs VARCHAR(50) NOT NULL, -- j. single value string
    tehnologii TEXT NOT NULL, -- k. multiple value string (separate prin virgula)
    recomandat_gaming BOOLEAN NOT NULL -- l. caracteristica booleana
);

-- INSERARE 15 PRODUSE PENTRU TESTAREA FILTRELOR
INSERT INTO componente 
    (nume, descriere, imagine, categorie, producator, pret, garantie_luni, data_adaugare, stare_produs, tehnologii, recomandat_gaming) 
VALUES
('Intel Core i9-14900K', 'Procesor flagship pentru entuziaști, excelent pentru multitasking.', 'intel_i9.jpg', 'procesor', 'Intel', 3200.50, 36, '2024-01-15', 'Nou', 'Hyper-Threading,Turbo Boost', TRUE),
('AMD Ryzen 7 7800X3D', 'Cel mai bun procesor de gaming datorita tehnologiei 3D V-Cache.', 'ryzen_7.jpg', 'procesor', 'AMD', 2150.00, 36, '2023-11-05', 'Nou', '3D V-Cache,Precision Boost', TRUE),
('Intel Core i3-12100F', 'Procesor excelent pentru sisteme de buget sau office.', 'intel_i3.jpg', 'procesor', 'Intel', 450.00, 24, '2023-05-10', 'Resigilat', 'Hyper-Threading,PCIe 5.0', FALSE),
('NVIDIA GeForce RTX 4090', 'Performanta absoluta in 4K. Monstrul grafic al generatiei.', 'rtx_4090.jpg', 'placa_video', 'Nvidia', 9500.00, 48, '2024-02-20', 'Nou', 'Ray Tracing,DLSS 3.0,RGB', TRUE),
('AMD Radeon RX 7900 XTX', 'Alternativa perfecta de top, cu memorie masiva de 24GB.', 'rx_7900.jpg', 'placa_video', 'AMD', 5200.00, 36, '2023-12-12', 'Nou', 'Ray Tracing,FSR 3.0,RGB', TRUE),
('NVIDIA GeForce RTX 3060', 'O placa foarte capabila pentru 1080p, la un pret corect.', 'rtx_3060.jpg', 'placa_video', 'Nvidia', 1450.99, 12, '2022-08-30', 'Resigilat', 'Ray Tracing,DLSS 2.0', TRUE),
('Intel Arc A770', 'O gura de aer proaspat pe piata GPU, excelenta pentru encodare AV1.', 'intel_arc.jpg', 'placa_video', 'Intel', 1650.00, 24, '2023-03-14', 'Nou', 'Ray Tracing,XeSS,AV1 Encoder', FALSE),
('Corsair Vengeance RGB 32GB', 'Kit de memorii rapide DDR5 cu iluminare sincronizabila.', 'ram_corsair.jpg', 'memorie_ram', 'Corsair', 850.00, 99, '2024-05-01', 'Nou', 'DDR5,XMP 3.0,RGB', TRUE),
('Kingston FURY Beast 16GB', 'Memorii fiabile pentru orice build de buget sau office.', 'ram_kingston.jpg', 'memorie_ram', 'Kingston', 220.00, 60, '2023-01-10', 'Nou', 'DDR4,XMP 2.0', FALSE),
('G.Skill Trident Z5 64GB', 'Kit masiv pentru editare video și randare 3D.', 'ram_gskill.jpg', 'memorie_ram', 'G.Skill', 1400.00, 99, '2024-04-18', 'Resigilat', 'DDR5,EXPO,RGB', TRUE),
('Samsung 990 PRO 2TB', 'SSD M.2 NVMe super rapid, loading screen-uri inexistente.', 'ssd_samsung.jpg', 'stocare', 'Samsung', 890.50, 60, '2024-01-05', 'Nou', 'NVMe,PCIe 4.0', TRUE),
('WD Blue SN570 1TB', 'SSD fiabil și accesibil pentru sistemul de operare.', 'ssd_wd.jpg', 'stocare', 'Western Digital', 280.00, 36, '2022-11-22', 'Nou', 'NVMe,PCIe 3.0', FALSE),
('Seagate BarraCuda 4TB', 'Hard disk urias pentru arhivarea datelor si pozelor tale.', 'hdd_seagate.jpg', 'stocare', 'Seagate', 450.00, 24, '2021-09-10', 'Resigilat', 'HDD,SATA 3', FALSE),
('Seasonic Focus GX-850', 'Sursa complet modulara, extrem de silentioasa.', 'sursa_seasonic.jpg', 'sursa', 'Seasonic', 720.00, 120, '2023-07-25', 'Nou', 'Modulara,80+ Gold', TRUE),
('Corsair RM750e', 'Alimentare constanta si sigura pentru componentele tale.', 'sursa_corsair.jpg', 'sursa', 'Corsair', 550.00, 84, '2023-10-10', 'Nou', 'Modulara,80+ Gold', TRUE);