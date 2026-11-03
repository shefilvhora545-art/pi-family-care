// ==================================================
// SAMPLE CATALOG: EVERYDAY MEDICINES AND PHARMACY ITEMS
// ==================================================
// About 500 common Indian pharmacy products for practice and demos.
// Prices are approximate MRPs and stock levels are made up: each
// store sets its own real prices and stock. No photos (each product
// shows its own pack card until the store adds a real photo).
//
// Entry: { cat, rx, form, pack, generic, uses, dose, store, items }
//   generic: "{s}" is replaced by the strength ("Amlodipine 5 mg").
//   items:   [brand, company, [[strength, price], ...]]
//   Name:    brand + strength + form ("Amlong 5 Tablet").
// Loaded by db/tools/seed_daily_medicines.js.

const ROOM = "Store below 30°C in a dry place, away from direct sunlight. Keep out of reach of children.";
const ROOM25 = "Store below 25°C in a dry place. Keep out of reach of children.";
const SYRUP = "Store below 25°C. Shake well before use. Keep the bottle tightly closed and out of reach of children.";
const FRIDGE = "Store unopened in a refrigerator (2–8°C); do not freeze. Once in use, keep below 25°C as per the leaflet. Keep out of reach of children.";
const EYE = "Store below 25°C. Do not touch the dropper tip. Throw away 4 weeks after opening.";
const DRY = "Store in a clean, dry place at room temperature.";
const BOTTLE = "Store below 25°C in the original bottle, tightly closed. Keep out of reach of children.";

const DOC = "Take exactly as prescribed by your doctor. Do not change the dose or stop on your own.";
const COURSE = "Take as prescribed by your doctor and complete the full course, even if you feel better.";
const LABEL = "Use as directed on the pack or by your pharmacist.";
const DEVICE = "Read the instruction leaflet before first use.";
const ONE = (strength) => [[strength, 0]];

const CATEGORIES = {
    "Pain Relief": "Medicines for pain and fever",
    Allergy: "Medicines for allergy symptoms",
    "Digestive Health": "Medicines for acidity, digestion and rehydration",
    Antibiotics: "Prescription medicines for bacterial infections",
    Diabetes: "Medicines that help control blood sugar",
    "Vitamins & Supplements": "Nutritional supplements",
    "Cold & Cough": "Relief from cold, cough, blocked nose and sore throat",
    "Heart & Blood Pressure": "Medicines for blood pressure, cholesterol and heart care",
    Thyroid: "Medicines for thyroid conditions",
    Antifungal: "Medicines for fungal infections of skin, nails and mouth",
    "Skin Care": "Creams, lotions and antiseptics for the skin",
    "Eye & Ear Care": "Eye drops, ear drops and lubricants",
    "Asthma & Breathing": "Inhalers and medicines for asthma and breathing problems",
    "Women's Health": "Period care, pregnancy tests and women's wellness",
    "Baby Care": "Baby medicines, nutrition and hygiene",
    "Surgical & First Aid": "Bandages, cotton, syringes, antiseptics and supports",
    "Health Devices": "Thermometers, BP monitors, oximeters and nebulizers",
    "Personal Care": "Hygiene, oral care and daily personal care",
    "Ayurveda & Herbal": "Ayurvedic and herbal health products",
    "Nerve & Brain Health": "Medicines for vertigo, migraine and nerve health",
    "Kidney & Urinary": "Medicines for prostate and urinary problems"
};

const ENTRIES = [
    // ---------------- PAIN RELIEF ----------------
    {
        cat: "Pain Relief", rx: false, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Paracetamol {s} mg",
        uses: "Relief of fever and mild to moderate pain such as headache, body ache and toothache.",
        dose: "Adults: 1 tablet every 4–6 hours if needed, after food. Do not take more than 4 g of paracetamol in 24 hours.",
        store: ROOM,
        items: [
            ["Calpol", "GSK Pharmaceuticals Ltd", [["500", 15], ["650", 32]]],
            ["Crocin", "Haleon India", [["650", 34]]],
            ["Pacimol", "Ipca Laboratories Ltd", [["500", 14], ["650", 30]]],
            ["Paracip", "Cipla Ltd", [["500", 12], ["650", 24]]],
            ["Dolo", "Micro Labs Ltd", [["500", 18]]]
        ]
    },
    {
        cat: "Pain Relief", rx: false, form: "Syrup", pack: "Bottle of 60 ml",
        generic: "Paracetamol {s}",
        uses: "Relief of fever and pain in children.",
        dose: "Children: dose depends on body weight; give as advised by the doctor or as printed on the label, using the measuring cup.",
        store: SYRUP,
        items: [
            ["Calpol", "GSK Pharmaceuticals Ltd", [["120 mg/5 ml", 48], ["250 mg/5 ml", 60]]],
            ["Dolo", "Micro Labs Ltd", [["250 mg/5 ml", 55]]],
            ["Pacimol", "Ipca Laboratories Ltd", [["250 mg/5 ml", 50]]]
        ]
    },
    {
        cat: "Pain Relief", rx: false, form: "Tablet", pack: "Strip of 20 tablets",
        generic: "Ibuprofen 400 mg + Paracetamol 325 mg",
        uses: "Relief of pain and fever such as headache, toothache, body ache and period pain.",
        dose: "Adults: 1 tablet up to 3 times a day after food. Avoid if you have stomach ulcers or kidney problems.",
        store: ROOM,
        items: [
            ["Combiflam", "Sanofi India Ltd", ONE("")],
            ["Ibugesic Plus", "Cipla Ltd", ONE("")],
            ["Flexon", "Aristo Pharmaceuticals Pvt Ltd", ONE("")]
        ],
        prices: [45, 32, 30]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Ibuprofen {s} mg",
        uses: "Relief of pain, swelling and fever, such as joint, muscle, dental and period pain.",
        dose: "Take after food, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Brufen", "Abbott India Ltd", [["200", 15], ["600", 40]]],
            ["Ibugesic", "Cipla Ltd", [["400", 20]]]
        ]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Aceclofenac 100 mg + Paracetamol 325 mg",
        uses: "Relief of pain and swelling in back pain, joint pain, sprains and after dental procedures.",
        dose: "1 tablet twice a day after food, or as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Zerodol-P", "Ipca Laboratories Ltd", ONE("")],
            ["Hifenac-P", "Intas Pharmaceuticals Ltd", ONE("")],
            ["Aceclo Plus", "Aristo Pharmaceuticals Pvt Ltd", ONE("")]
        ],
        prices: [70, 65, 60]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg",
        uses: "Relief of pain and swelling after injury, surgery or dental procedures.",
        dose: "1 tablet twice a day after food, or as prescribed by your doctor.",
        store: ROOM,
        items: [["Zerodol-SP", "Ipca Laboratories Ltd", ONE("")]],
        prices: [110]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Diclofenac sodium {s} mg",
        uses: "Relief of pain and inflammation in arthritis, back pain, sprains and injuries.",
        dose: "Take after food, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Voveran", "Dr. Reddy's Laboratories Ltd", [["50", 30]]],
            ["Voveran SR", "Dr. Reddy's Laboratories Ltd", [["100", 60]]]
        ]
    },
    {
        cat: "Pain Relief", rx: false, form: "", pack: "Tube / can",
        generic: "Diclofenac diethylamine 1.16% (topical)",
        uses: "Relief of muscle pain, joint pain, back pain, sprains and strains.",
        dose: "Apply a thin layer on the painful area and rub gently 3–4 times a day. Do not apply on broken skin.",
        store: ROOM,
        items: [
            ["Volini Gel 30 g", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Volini Gel 75 g", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Volini Spray 40 g", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Omnigel 30 g", "Cipla Ltd", ONE("")]
        ],
        prices: [125, 245, 190, 115]
    },
    {
        cat: "Pain Relief", rx: false, form: "", pack: "Tube",
        generic: "Pain relief cream (wintergreen oil, menthol, eucalyptus oil)",
        uses: "Quick relief of back pain, muscle pain and joint pain.",
        dose: "Apply on the painful area and massage gently 2–3 times a day.",
        store: ROOM,
        items: [
            ["Moov Pain Relief Cream 15 g", "Reckitt Benckiser India", ONE("")],
            ["Moov Pain Relief Cream 50 g", "Reckitt Benckiser India", ONE("")]
        ],
        prices: [60, 165]
    },
    {
        cat: "Pain Relief", rx: false, form: "", pack: "Jar",
        generic: "Pain relief balm (menthol, camphor, natural oils)",
        uses: "Relief of headache, body ache, cold and muscle pain.",
        dose: "Rub a small amount gently on the forehead, temples or painful area. Keep away from eyes.",
        store: ROOM,
        items: [
            ["Zandu Balm 8 ml", "Emami Ltd", ONE("")],
            ["Zandu Balm 25 ml", "Emami Ltd", ONE("")],
            ["Amrutanjan Pain Balm 8 ml", "Amrutanjan Healthcare Ltd", ONE("")],
            ["Iodex Balm 8 g", "Haleon India", ONE("")],
            ["Tiger Balm White 10 g", "Haw Par Healthcare", ONE("")]
        ],
        prices: [45, 110, 40, 50, 120]
    },
    {
        cat: "Pain Relief", rx: false, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Paracetamol 650 mg + Caffeine 50 mg",
        uses: "Relief of headache and body pain.",
        dose: "Adults: 1 tablet every 4–6 hours if needed. Not more than 4 tablets a day.",
        store: ROOM,
        items: [["Crocin Pain Relief", "Haleon India", ONE("")]],
        prices: [60]
    },
    {
        cat: "Pain Relief", rx: false, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Propyphenazone 150 mg + Paracetamol 250 mg + Caffeine 50 mg",
        uses: "Fast relief of headache.",
        dose: "Adults: 1–2 tablets if needed; not more than 4 tablets a day.",
        store: ROOM,
        items: [["Saridon", "Bayer Pharmaceuticals Pvt Ltd", ONE("")]],
        prices: [42]
    },
    {
        cat: "Pain Relief", rx: false, form: "Tablet", pack: "Strip of 10 soluble tablets",
        generic: "Aspirin 350 mg (soluble)",
        uses: "Relief of headache, toothache and body pain.",
        dose: "Adults: dissolve 1–2 tablets in water every 4–6 hours if needed. Not for children under 16.",
        store: ROOM,
        items: [["Disprin", "Reckitt Benckiser India", ONE("")]],
        prices: [12]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Mefenamic acid {s} mg",
        uses: "Relief of mild to moderate pain, including period pain.",
        dose: "Take after food, as prescribed by your doctor.",
        store: ROOM,
        items: [["Meftal", "Blue Cross Laboratories Pvt Ltd", [["500", 40]]]]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Etoricoxib {s} mg",
        uses: "Relief of pain and swelling in arthritis, gout and after dental surgery.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Nucoxia", "Zydus Lifesciences Ltd", [["60", 110], ["90", 150], ["120", 190]]],
            ["Etoshine", "Sun Pharmaceutical Industries Ltd", [["90", 140]]]
        ]
    },
    {
        cat: "Pain Relief", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Naproxen {s} mg",
        uses: "Relief of pain and swelling in arthritis, sprains and period pain.",
        dose: "Take after food, as prescribed by your doctor.",
        store: ROOM,
        items: [["Naprosyn", "RPG Life Sciences Ltd", [["250", 45], ["500", 85]]]]
    },

    // ---------------- COLD & COUGH ----------------
    {
        cat: "Cold & Cough", rx: false, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Paracetamol + Phenylephrine + Chlorpheniramine",
        uses: "Relief of common cold symptoms such as blocked or runny nose, sneezing, headache and fever.",
        dose: "Adults: 1 tablet up to 3 times a day after food. May cause drowsiness; do not drive after taking it.",
        store: ROOM,
        items: [
            ["Sinarest", "Centaur Pharmaceuticals Pvt Ltd", ONE("")],
            ["D'Cold Total", "Reckitt Benckiser India", ONE("")],
            ["Cheston Cold", "Cipla Ltd", ONE("")],
            ["Wikoryl", "Alembic Pharmaceuticals Ltd", ONE("")],
            ["Vicks Action 500 Advanced", "Procter & Gamble Health Ltd", ONE("")]
        ],
        prices: [45, 40, 42, 38, 50]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Bottle of 60 ml",
        generic: "Paracetamol + Phenylephrine + Chlorpheniramine (syrup)",
        uses: "Relief of cold symptoms such as runny nose, sneezing and fever.",
        dose: "Give as advised by the doctor or as printed on the label, using the measuring cup.",
        store: SYRUP,
        items: [["Sinarest Syrup 60 ml", "Centaur Pharmaceuticals Pvt Ltd", ONE("")]],
        prices: [70]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Bottle of 100 ml",
        generic: "Dextromethorphan + Chlorpheniramine (dry cough syrup)",
        uses: "Relief of dry, irritating cough with cold and allergy.",
        dose: "Adults: 5–10 ml up to 3 times a day, or as advised by your doctor. May cause drowsiness.",
        store: SYRUP,
        items: [
            ["Grilinctus Syrup 100 ml", "Franco-Indian Pharmaceuticals Pvt Ltd", ONE("")],
            ["Ascoril D Plus Syrup 100 ml", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Alex Syrup 100 ml", "Glenmark Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [115, 120, 118]
    },
    {
        cat: "Cold & Cough", rx: true, form: "", pack: "Bottle",
        generic: "Ambroxol + Guaifenesin + Terbutaline (wet cough syrup)",
        uses: "Relief of wet cough with phlegm; helps loosen mucus and open the airways.",
        dose: DOC,
        store: SYRUP,
        items: [
            ["Ascoril LS Syrup 100 ml", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Ascoril LS Syrup 200 ml", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Bro-Zedex Syrup 100 ml", "Wockhardt Ltd", ONE("")]
        ],
        prices: [125, 230, 120]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Bottle of 100 ml",
        generic: "Herbal cough syrup",
        uses: "Soothing relief from cough and throat irritation.",
        dose: "Adults: 2 teaspoons 3 times a day. Children: 1 teaspoon 3 times a day.",
        store: SYRUP,
        items: [
            ["Dabur Honitus Syrup 100 ml", "Dabur India Ltd", ONE("")],
            ["Himalaya Koflet Syrup 100 ml", "Himalaya Wellness Company", ONE("")]
        ],
        prices: [95, 90]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Pack of lozenges",
        generic: "Amylmetacresol + Dichlorobenzyl alcohol lozenges",
        uses: "Relief of sore throat and throat irritation.",
        dose: "Adults and children over 6: dissolve 1 lozenge slowly in the mouth every 2–3 hours. Not more than 8 a day.",
        store: ROOM,
        items: [
            ["Strepsils Honey & Lemon (8 lozenges)", "Reckitt Benckiser India", ONE("")],
            ["Strepsils Orange (8 lozenges)", "Reckitt Benckiser India", ONE("")],
            ["Strepsils Ginger Lemon (8 lozenges)", "Reckitt Benckiser India", ONE("")]
        ],
        prices: [40, 40, 40]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Pack",
        generic: "Menthol cough drops",
        uses: "Soothes cough and throat irritation.",
        dose: "Dissolve 1 drop slowly in the mouth when needed.",
        store: ROOM,
        items: [
            ["Vicks Cough Drops Menthol (10 drops)", "Procter & Gamble Health Ltd", ONE("")],
            ["Cofsils Lozenges (10 lozenges)", "Cipla Ltd", ONE("")]
        ],
        prices: [20, 25]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Jar / inhaler",
        generic: "Vapour rub / inhaler (camphor, menthol, eucalyptus oil)",
        uses: "Relief of blocked nose, cough and body ache due to cold.",
        dose: "Rub on the chest, throat and back, or inhale as directed. Do not use inside the nose or on children under 2.",
        store: ROOM,
        items: [
            ["Vicks VapoRub 25 ml", "Procter & Gamble Health Ltd", ONE("")],
            ["Vicks VapoRub 50 ml", "Procter & Gamble Health Ltd", ONE("")],
            ["Vicks Inhaler", "Procter & Gamble Health Ltd", ONE("")]
        ],
        prices: [95, 175, 60]
    },
    {
        cat: "Cold & Cough", rx: false, form: "", pack: "Bottle of 10 ml",
        generic: "Xylometazoline / oxymetazoline nasal spray",
        uses: "Quick relief of blocked nose due to cold, sinusitis or allergy.",
        dose: "1 spray or 2 drops in each nostril up to 3 times a day. Do not use for more than 5–7 days.",
        store: ROOM25,
        items: [
            ["Otrivin Adult Nasal Spray 10 ml", "Haleon India", ONE("")],
            ["Nasivion Adult Nasal Drops 10 ml", "Procter & Gamble Health Ltd", ONE("")]
        ],
        prices: [115, 110]
    },

    // ---------------- ALLERGY ----------------
    {
        cat: "Allergy", rx: false, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Cetirizine {s} mg",
        uses: "Relief of allergy symptoms such as sneezing, runny nose, itchy eyes and skin rash (hives).",
        dose: "Adults: 1 tablet once a day, preferably at night. May cause drowsiness.",
        store: ROOM,
        items: [
            ["Cetzine", "Dr. Reddy's Laboratories Ltd", [["10", 20]]],
            ["Alerid", "Cipla Ltd", [["10", 18]]]
        ]
    },
    {
        cat: "Allergy", rx: false, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Levocetirizine {s} mg",
        uses: "Relief of allergy symptoms such as sneezing, runny nose, itchy or watery eyes and hives.",
        dose: "Adults: 1 tablet once a day in the evening. May cause drowsiness.",
        store: ROOM,
        items: [
            ["Levocet", "Hetero Healthcare Ltd", [["5", 40]]],
            ["Xyzal", "Dr. Reddy's Laboratories Ltd", [["5", 72]]],
            ["Teczine", "Unichem Laboratories Ltd", [["5", 35]]],
            ["Lecope", "Mankind Pharma Ltd", [["5", 28]]]
        ]
    },
    {
        cat: "Allergy", rx: false, form: "Syrup", pack: "Bottle of 60 ml",
        generic: "Levocetirizine {s}",
        uses: "Relief of allergy symptoms in children.",
        dose: "Give as advised by the doctor, using the measuring cup.",
        store: SYRUP,
        items: [["Lecope", "Mankind Pharma Ltd", [["2.5 mg/5 ml", 55]]]]
    },
    {
        cat: "Allergy", rx: false, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Fexofenadine {s} mg",
        uses: "Relief of seasonal allergy (hay fever) and long-lasting hives, without much drowsiness.",
        dose: "Adults: 1 tablet once a day with water.",
        store: ROOM,
        items: [["Allegra", "Sanofi India Ltd", [["180", 290]]]]
    },
    {
        cat: "Allergy", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Montelukast 10 mg + Levocetirizine 5 mg",
        uses: "Relief of allergic rhinitis (sneezing, blocked or runny nose) and allergy with asthma.",
        dose: "1 tablet once a day in the evening, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Montek LC", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Telekast-L", "Lupin Ltd", ONE("")]
        ],
        prices: [185, 175]
    },
    {
        cat: "Allergy", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Montelukast {s} mg",
        uses: "Prevention of asthma attacks and relief of allergic rhinitis.",
        dose: "Once a day in the evening, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Montair", "Cipla Ltd", [["4", 110], ["5", 140], ["10", 190]]],
            ["Romilast", "Sun Pharmaceutical Industries Ltd", [["10", 160]]]
        ]
    },
    {
        cat: "Allergy", rx: false, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Pheniramine maleate {s} mg",
        uses: "Relief of allergy, itching, hives and insect bite reactions.",
        dose: "Adults: 1 tablet up to 3 times a day. Causes drowsiness; do not drive.",
        store: ROOM,
        items: [["Avil", "Sanofi India Ltd", [["25", 12]]]]
    },
    {
        cat: "Allergy", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Hydroxyzine {s} mg",
        uses: "Relief of severe itching due to skin allergy.",
        dose: DOC,
        store: ROOM,
        items: [["Atarax", "Dr. Reddy's Laboratories Ltd", [["10", 55], ["25", 80]]]]
    },

    // ---------------- DIGESTIVE HEALTH ----------------
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Pantoprazole {s} mg",
        uses: "Treatment of acidity, heartburn, GERD and stomach ulcers.",
        dose: "Once a day before breakfast, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Pantocid", "Sun Pharmaceutical Industries Ltd", [["20", 90], ["40", 160]]],
            ["Pantop", "Aristo Pharmaceuticals Pvt Ltd", [["40", 120]]],
            ["Pan", "Alkem Laboratories Ltd", [["20", 95]]],
            ["Pantodac", "Zydus Lifesciences Ltd", [["40", 130]]]
        ]
    },
    {
        cat: "Digestive Health", rx: true, form: "Capsule", pack: "Strip of 15 capsules",
        generic: "Pantoprazole 40 mg + Domperidone 30 mg (SR)",
        uses: "Treatment of acidity and GERD with nausea, bloating or vomiting.",
        dose: "1 capsule once a day before breakfast, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Pan-D", "Alkem Laboratories Ltd", ONE("")],
            ["Pantocid-DSR", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Pantop-DSR", "Aristo Pharmaceuticals Pvt Ltd", ONE("")],
            ["Pantodac-DSR", "Zydus Lifesciences Ltd", ONE("")]
        ],
        prices: [199, 215, 175, 180]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Rabeprazole {s} mg",
        uses: "Treatment of acidity, heartburn, GERD and ulcers.",
        dose: "Once a day before breakfast, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Razo", "Dr. Reddy's Laboratories Ltd", [["20", 150]]],
            ["Rablet", "Lupin Ltd", [["20", 140]]],
            ["Happi", "Zydus Lifesciences Ltd", [["20", 135]]]
        ]
    },
    {
        cat: "Digestive Health", rx: true, form: "Capsule", pack: "Strip of 15 capsules",
        generic: "Rabeprazole 20 mg + Domperidone 30 mg (SR)",
        uses: "Treatment of acidity and GERD with nausea or bloating.",
        dose: "1 capsule once a day before breakfast, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Razo-D", "Dr. Reddy's Laboratories Ltd", ONE("")],
            ["Rablet-D", "Lupin Ltd", ONE("")]
        ],
        prices: [170, 165]
    },
    {
        cat: "Digestive Health", rx: true, form: "Capsule", pack: "Strip of 15 capsules",
        generic: "Omeprazole {s} mg",
        uses: "Treatment of acidity, GERD and stomach or duodenal ulcers.",
        dose: "Once a day before breakfast, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Omez", "Dr. Reddy's Laboratories Ltd", [["10", 45], ["40", 95]]],
            ["Ocid", "Zydus Lifesciences Ltd", [["20", 60]]]
        ]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Esomeprazole {s} mg",
        uses: "Treatment of acidity, GERD and stomach ulcers.",
        dose: "Once a day before breakfast, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Nexpro", "Torrent Pharmaceuticals Ltd", [["20", 120], ["40", 185]]],
            ["Esoz", "Glenmark Pharmaceuticals Ltd", [["40", 170]]]
        ]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Famotidine {s} mg",
        uses: "Relief of acidity, heartburn and stomach ulcers.",
        dose: DOC,
        store: ROOM,
        items: [["Famocid", "Sun Pharmaceutical Industries Ltd", [["20", 20], ["40", 32]]]]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Bottle / strip",
        generic: "Antacid (aluminium hydroxide + magnesium hydroxide + simethicone)",
        uses: "Quick relief of acidity, heartburn, gas and bloating.",
        dose: "Liquid: 2 teaspoons, tablets: chew 1–2, after meals and at bedtime, or as directed.",
        store: SYRUP,
        items: [
            ["Digene Gel Mint 200 ml", "Abbott India Ltd", ONE("")],
            ["Digene Gel Mixed Fruit 200 ml", "Abbott India Ltd", ONE("")],
            ["Gelusil MPS Liquid 200 ml", "Pfizer Ltd", ONE("")],
            ["Digene Tablets Mint (15 tablets)", "Abbott India Ltd", ONE("")],
            ["Gelusil MPS Tablets (15 tablets)", "Pfizer Ltd", ONE("")]
        ],
        prices: [155, 155, 140, 32, 30]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Sachet / bottle",
        generic: "Antacid powder (sodium bicarbonate + citric acid)",
        uses: "Fast relief of acidity and gas.",
        dose: "Mix 1 sachet or 1 teaspoon in a glass of water and drink while fizzing. Not more than 2 times a day.",
        store: DRY,
        items: [
            ["ENO Lemon Sachet 5 g (Pack of 6)", "Haleon India", ONE("")],
            ["ENO Regular 100 g", "Haleon India", ONE("")]
        ],
        prices: [60, 150]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Ondansetron {s} mg",
        uses: "Prevention and treatment of nausea and vomiting.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Emeset", "Cipla Ltd", [["4", 42], ["8", 75]]],
            ["Ondem", "Alkem Laboratories Ltd", [["4", 45]]],
            ["Vomikind", "Mankind Pharma Ltd", [["4", 35]]]
        ]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Domperidone {s} mg",
        uses: "Relief of nausea, vomiting and bloating.",
        dose: "Take 15–30 minutes before meals, as prescribed by your doctor.",
        store: ROOM,
        items: [["Domstal", "Torrent Pharmaceuticals Ltd", [["10", 40]]]]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Metoclopramide {s} mg",
        uses: "Relief of nausea and vomiting.",
        dose: DOC,
        store: ROOM,
        items: [["Perinorm", "Ipca Laboratories Ltd", [["10", 40]]]]
    },
    {
        cat: "Digestive Health", rx: true, form: "Capsule", pack: "Strip of 10 capsules",
        generic: "Loperamide {s} mg",
        uses: "Short-term control of loose motions (diarrhoea).",
        dose: "As prescribed by your doctor. Drink plenty of fluids / ORS. Not for children.",
        store: ROOM,
        items: [["Eldoper", "Micro Labs Ltd", [["2", 25]]]]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Tetra pack / powder",
        generic: "Oral rehydration / electrolyte drink",
        uses: "Prevention and treatment of dehydration due to loose motions, vomiting, heat or exercise.",
        dose: "Sip slowly through the day as needed, or as advised by your doctor.",
        store: DRY,
        items: [
            ["ORSL Apple Drink 200 ml", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["ORSL Orange Drink 200 ml", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["ORSL Lemon Drink 200 ml", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["Enerzal Orange Powder 100 g", "FDC Ltd", ONE("")]
        ],
        prices: [35, 35, 35, 85]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Sachet / capsules",
        generic: "Probiotic (good bacteria)",
        uses: "Helps restore healthy gut bacteria during loose motions or after antibiotics.",
        dose: "As directed by your doctor or on the pack.",
        store: ROOM25,
        items: [
            ["Econorm Sachet 1 g", "Dr. Reddy's Laboratories Ltd", ONE("")],
            ["Enterogermina Oral Suspension 5 ml (Pack of 5)", "Sanofi India Ltd", ONE("")],
            ["Vizylac Capsule (Pack of 10)", "Unichem Laboratories Ltd", ONE("")],
            ["Bifilac Capsule (Pack of 10)", "Tablets (India) Ltd", ONE("")],
            ["Sporlac Sachet 1 g", "Sanzyme Pvt Ltd", ONE("")]
        ],
        prices: [55, 240, 85, 120, 35]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Strip / bottle",
        generic: "Laxative (constipation relief)",
        uses: "Relief of occasional constipation.",
        dose: "Use as directed on the pack. Do not use regularly for more than a week without a doctor's advice.",
        store: ROOM,
        items: [
            ["Dulcolax 5 mg Tablet (Pack of 10)", "Sanofi India Ltd", ONE("")],
            ["Cremaffin Plus Syrup 225 ml", "Abbott India Ltd", ONE("")],
            ["Cremaffin Syrup 225 ml", "Abbott India Ltd", ONE("")],
            ["Duphalac Oral Solution 100 ml", "Abbott India Ltd", ONE("")],
            ["Sat Isabgol 100 g", "Dabur India Ltd", ONE("")]
        ],
        prices: [25, 260, 230, 250, 150]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Antispasmodic (stomach cramps)",
        uses: "Relief of stomach cramps, abdominal pain and colic.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Cyclopam", "Indoco Remedies Ltd", ONE("")],
            ["Drotin 40", "Walter Bushnell", ONE("")],
            ["Drotin-M", "Walter Bushnell", ONE("")]
        ],
        prices: [45, 55, 95]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Strip / bottle",
        generic: "Digestive enzymes",
        uses: "Relief of indigestion, gas and heaviness after meals.",
        dose: LABEL,
        store: ROOM,
        items: [
            ["Unienzyme Tablet (Pack of 15)", "Torrent Pharmaceuticals Ltd", ONE("")],
            ["Aristozyme Syrup 200 ml", "Aristo Pharmaceuticals Pvt Ltd", ONE("")]
        ],
        prices: [60, 140]
    },
    {
        cat: "Digestive Health", rx: false, form: "", pack: "Tablet / suspension",
        generic: "Albendazole 400 mg (deworming)",
        uses: "Treatment of worm infections such as roundworm, hookworm and threadworm.",
        dose: "Single dose as directed by the doctor or on the pack; may be repeated after 2 weeks.",
        store: ROOM,
        items: [
            ["Zentel 400 mg Tablet", "GSK Pharmaceuticals Ltd", ONE("")],
            ["Zentel Suspension 10 ml", "GSK Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [25, 30]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 1 tablet",
        generic: "Albendazole 400 mg + Ivermectin 6 mg",
        uses: "Treatment of worm infections.",
        dose: DOC,
        store: ROOM,
        items: [["Bandy Plus", "Mankind Pharma Ltd", ONE("")]],
        prices: [22]
    },
    {
        cat: "Digestive Health", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Ursodeoxycholic acid {s} mg",
        uses: "Treatment of gallstones and certain liver conditions.",
        dose: DOC,
        store: ROOM,
        items: [["Udiliv", "Abbott India Ltd", [["300", 520]]]]
    },

    // ---------------- ANTIBIOTICS ----------------
    {
        cat: "Antibiotics", rx: true, form: "Capsule", pack: "Strip of 15 capsules",
        generic: "Amoxicillin {s} mg",
        uses: "Treatment of bacterial infections of the throat, ear, chest, urinary tract and teeth.",
        dose: COURSE,
        store: ROOM,
        items: [
            ["Mox", "Sun Pharmaceutical Industries Ltd", [["250", 55], ["500", 100]]],
            ["Novamox", "Cipla Ltd", [["500", 90]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Amoxicillin + Clavulanic acid {s} mg",
        uses: "Treatment of bacterial infections of the chest, ear, sinus, skin and urinary tract.",
        dose: "Take at the start of a meal. " + COURSE,
        store: ROOM25,
        items: [
            ["Moxikind-CV", "Mankind Pharma Ltd", [["375", 110], ["625", 180]]],
            ["Clavam", "Alkem Laboratories Ltd", [["625", 205]]],
            ["Augmentin", "GSK Pharmaceuticals Ltd", [["375", 130]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "", pack: "Bottle",
        generic: "Antibiotic dry syrup for children",
        uses: "Treatment of bacterial infections in children.",
        dose: "Add boiled and cooled water up to the mark and shake. Give as prescribed and finish the course. Use within 7 days of mixing.",
        store: SYRUP,
        items: [
            ["Augmentin Duo Oral Suspension 30 ml", "GSK Pharmaceuticals Ltd", ONE("")],
            ["Azithral 200 mg/5 ml Liquid 15 ml", "Alembic Pharmaceuticals Ltd", ONE("")],
            ["Azee 100 mg/5 ml Dry Syrup 15 ml", "Cipla Ltd", ONE("")],
            ["Taxim-O 50 mg/5 ml Dry Syrup 30 ml", "Alkem Laboratories Ltd", ONE("")],
            ["Mox 250 mg/5 ml Dry Syrup 60 ml", "Sun Pharmaceutical Industries Ltd", ONE("")]
        ],
        prices: [130, 75, 45, 60, 50]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 3 tablets",
        generic: "Azithromycin {s} mg",
        uses: "Treatment of bacterial infections of the throat, chest, ear, skin and typhoid.",
        dose: "Once a day, as prescribed. " + COURSE,
        store: ROOM,
        items: [
            ["Azithral", "Alembic Pharmaceuticals Ltd", [["250", 75], ["500", 120]]],
            ["Azee", "Cipla Ltd", [["250", 70]]],
            ["Zathrin", "FDC Ltd", [["500", 110]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Cefixime {s} mg",
        uses: "Treatment of bacterial infections such as typhoid, urinary tract, throat and chest infections.",
        dose: COURSE,
        store: ROOM,
        items: [
            ["Taxim-O", "Alkem Laboratories Ltd", [["100", 70], ["200", 110]]],
            ["Zifi", "FDC Ltd", [["200", 105]]],
            ["Mahacef", "Mankind Pharma Ltd", [["200", 90]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Ciprofloxacin {s} mg",
        uses: "Treatment of bacterial infections of the urinary tract, stomach and skin.",
        dose: COURSE,
        store: ROOM,
        items: [
            ["Ciplox", "Cipla Ltd", [["250", 30], ["500", 50]]],
            ["Cifran", "Sun Pharmaceutical Industries Ltd", [["500", 60]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Ofloxacin 200 mg + Ornidazole 500 mg",
        uses: "Treatment of mixed bacterial and amoebic infections such as infectious diarrhoea.",
        dose: COURSE,
        store: ROOM,
        items: [
            ["O2", "Medley Pharmaceuticals Ltd", ONE("")],
            ["Zenflox-OZ", "Mankind Pharma Ltd", ONE("")],
            ["Oflox-OZ", "Cipla Ltd", ONE("")]
        ],
        prices: [120, 100, 110]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Ofloxacin {s} mg",
        uses: "Treatment of bacterial infections of the urinary tract, chest and skin.",
        dose: COURSE,
        store: ROOM,
        items: [["Zanocin", "Sun Pharmaceutical Industries Ltd", [["200", 65], ["400", 110]]]]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Norfloxacin 400 mg + Tinidazole 600 mg",
        uses: "Treatment of infectious diarrhoea and dysentery.",
        dose: COURSE,
        store: ROOM,
        items: [["Norflox-TZ", "Cipla Ltd", ONE("")]],
        prices: [85]
    },
    {
        cat: "Antibiotics", rx: true, form: "Capsule", pack: "Strip of 10 capsules",
        generic: "Doxycycline 100 mg + Lactic acid bacillus",
        uses: "Treatment of bacterial infections of the chest, skin (acne), urinary tract and some fevers.",
        dose: "Take with a full glass of water, sitting upright. " + COURSE,
        store: ROOM,
        items: [
            ["Doxy-1 L-DR Forte", "USV Pvt Ltd", ONE("")],
            ["Microdox LBX", "Micro Labs Ltd", ONE("")]
        ],
        prices: [125, 110]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Metronidazole {s} mg",
        uses: "Treatment of amoebic dysentery, giardiasis and some dental and vaginal infections.",
        dose: "Take after food. Avoid alcohol during and for 2 days after the course. " + COURSE,
        store: ROOM,
        items: [
            ["Flagyl", "Abbott India Ltd", [["200", 15], ["400", 25]]],
            ["Metrogyl", "J.B. Chemicals & Pharmaceuticals Ltd", [["400", 22]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Levofloxacin {s} mg",
        uses: "Treatment of bacterial infections of the chest, sinus, urinary tract and skin.",
        dose: COURSE,
        store: ROOM,
        items: [
            ["Levoflox", "Cipla Ltd", [["250", 55], ["500", 90]]],
            ["Glevo", "Glenmark Pharmaceuticals Ltd", [["500", 95]]]
        ]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Cefuroxime axetil {s} mg",
        uses: "Treatment of bacterial infections of the throat, ear, chest, skin and urinary tract.",
        dose: "Take after food. " + COURSE,
        store: ROOM,
        items: [["Ceftum", "GSK Pharmaceuticals Ltd", [["250", 280], ["500", 480]]]]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Cefpodoxime {s} mg",
        uses: "Treatment of bacterial infections of the throat, chest, urinary tract and skin.",
        dose: COURSE,
        store: ROOM,
        items: [["Cepodem", "Sun Pharmaceutical Industries Ltd", [["100", 90], ["200", 150]]]]
    },
    {
        cat: "Antibiotics", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Clarithromycin {s} mg",
        uses: "Treatment of bacterial infections of the chest, throat, sinus and skin.",
        dose: COURSE,
        store: ROOM,
        items: [["Claribid", "Abbott India Ltd", [["250", 220]]]]
    },

    // ---------------- ANTIFUNGAL ----------------
    {
        cat: "Antifungal", rx: true, form: "Tablet", pack: "Strip of 1 tablet",
        generic: "Fluconazole {s} mg",
        uses: "Treatment of fungal infections such as vaginal yeast infection and oral thrush.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Forcan", "Cipla Ltd", [["150", 28]]],
            ["Zocon", "FDC Ltd", [["150", 22]]]
        ]
    },
    {
        cat: "Antifungal", rx: false, form: "", pack: "Tube / bottle",
        generic: "Clotrimazole 1% (topical)",
        uses: "Treatment of fungal skin infections such as ringworm, jock itch, athlete's foot and oral thrush (mouth paint).",
        dose: "Apply 2–3 times a day on clean, dry skin and continue for 2 weeks after the rash clears.",
        store: ROOM,
        items: [
            ["Candid Cream 20 g", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Candid Dusting Powder 100 g", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Candid Mouth Paint 25 ml", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Clocip Cream 20 g", "Cipla Ltd", ONE("")]
        ],
        prices: [95, 115, 95, 75]
    },
    {
        cat: "Antifungal", rx: true, form: "Tablet", pack: "Strip of 7 tablets",
        generic: "Terbinafine {s} mg",
        uses: "Treatment of fungal infections of the skin and nails.",
        dose: DOC,
        store: ROOM,
        items: [["Terbicip", "Cipla Ltd", [["250", 105]]]]
    },
    {
        cat: "Antifungal", rx: true, form: "Capsule", pack: "Strip of 4 capsules",
        generic: "Itraconazole {s} mg",
        uses: "Treatment of fungal infections of the skin, nails and mouth.",
        dose: "Take right after a full meal, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Itaspor", "Intas Pharmaceuticals Ltd", [["100", 210]]],
            ["Canditral", "Glenmark Pharmaceuticals Ltd", [["200", 300]]]
        ]
    },
    {
        cat: "Antifungal", rx: false, form: "", pack: "Bottle of 100 ml",
        generic: "Ketoconazole 2% shampoo",
        uses: "Treatment of dandruff and fungal infection of the scalp.",
        dose: "Apply to wet hair, leave for 3–5 minutes and rinse. Use twice a week.",
        store: ROOM,
        items: [["Nizral Shampoo 100 ml", "Johnson & Johnson Pvt Ltd", ONE("")]],
        prices: [320]
    },

    // ---------------- DIABETES ----------------
    {
        cat: "Diabetes", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Metformin {s} mg",
        uses: "Helps control blood sugar in type 2 diabetes, together with diet and exercise.",
        dose: "Take with or after meals, as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Glycomet", "USV Pvt Ltd", [["250", 18], ["850", 40]]],
            ["Glycomet SR", "USV Pvt Ltd", [["500", 30], ["1000", 55]]],
            ["Obimet", "Abbott India Ltd", [["500", 22]]],
            ["Glyciphage", "Franco-Indian Pharmaceuticals Pvt Ltd", [["500", 25], ["850", 38]]],
            ["Cetapin XR", "Sanofi India Ltd", [["500", 35]]]
        ]
    },
    {
        cat: "Diabetes", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Glimepiride {s} mg",
        uses: "Helps control blood sugar in type 2 diabetes.",
        dose: "Take once a day with breakfast, as prescribed. Do not skip meals (risk of low sugar).",
        store: ROOM,
        items: [
            ["Amaryl", "Sanofi India Ltd", [["1", 120], ["2", 200]]],
            ["Glimy", "Dr. Reddy's Laboratories Ltd", [["1", 50], ["2", 85]]],
            ["Glimestar", "Mankind Pharma Ltd", [["1", 45], ["2", 70]]]
        ]
    },
    {
        cat: "Diabetes", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Glimepiride {s} mg + Metformin 500 mg",
        uses: "Helps control blood sugar in type 2 diabetes.",
        dose: "Take with breakfast, as prescribed. Do not skip meals.",
        store: ROOM,
        items: [
            ["Glycomet-GP", "USV Pvt Ltd", [["1", 110], ["2", 150]]],
            ["Gemer", "Sun Pharmaceutical Industries Ltd", [["1", 100], ["2", 140]]],
            ["Glimestar-M", "Mankind Pharma Ltd", [["1", 75], ["2", 100]]]
        ]
    },
    {
        cat: "Diabetes", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Diabetes tablets (newer medicines)",
        uses: "Help control blood sugar in type 2 diabetes.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Diamicron XR 60", "Serdia Pharmaceuticals (India) Pvt Ltd", ONE("")],
            ["Istavel 50", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Istavel 100", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Januvia 100", "MSD Pharmaceuticals Pvt Ltd", ONE("")],
            ["Ziten 20", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Galvus 50", "Novartis India Ltd", ONE("")],
            ["Jalra 50", "USV Pvt Ltd", ONE("")],
            ["Galvus Met 50/500", "Novartis India Ltd", ONE("")],
            ["Jalra-M 50/500", "USV Pvt Ltd", ONE("")],
            ["Volix 0.2", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Volix 0.3", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Trajenta 5", "Boehringer Ingelheim India", ONE("")],
            ["Jardiance 10", "Boehringer Ingelheim India", ONE("")],
            ["Forxiga 10", "AstraZeneca Pharma India Ltd", ONE("")]
        ],
        prices: [230, 300, 450, 1150, 150, 520, 350, 560, 380, 110, 150, 650, 600, 600],
        generics: [
            "Gliclazide 60 mg (extended release)", "Sitagliptin 50 mg", "Sitagliptin 100 mg", "Sitagliptin 100 mg",
            "Teneligliptin 20 mg", "Vildagliptin 50 mg", "Vildagliptin 50 mg", "Vildagliptin 50 mg + Metformin 500 mg",
            "Vildagliptin 50 mg + Metformin 500 mg", "Voglibose 0.2 mg", "Voglibose 0.3 mg", "Linagliptin 5 mg",
            "Empagliflozin 10 mg", "Dapagliflozin 10 mg"
        ],
        addForm: true
    },
    {
        cat: "Diabetes", rx: true, form: "", pack: "Vial / cartridge / pen",
        generic: "Insulin injection",
        uses: "Control of blood sugar in diabetes.",
        dose: "Inject exactly as prescribed by your doctor. Check your blood sugar regularly.",
        store: FRIDGE,
        items: [
            ["Huminsulin R 40 IU/ml Injection 10 ml", "Eli Lilly and Company (India) Pvt Ltd", ONE("")],
            ["Huminsulin 30/70 40 IU/ml Injection 10 ml", "Eli Lilly and Company (India) Pvt Ltd", ONE("")],
            ["Mixtard 30 Penfill 3 ml", "Novo Nordisk India Pvt Ltd", ONE("")],
            ["Lantus SoloStar Pen 3 ml", "Sanofi India Ltd", ONE("")],
            ["Basalog One Pen 3 ml", "Biocon Ltd", ONE("")]
        ],
        prices: [165, 170, 450, 690, 550],
        generics: [
            "Human insulin (regular) 40 IU/ml", "Human insulin premix 30/70 40 IU/ml", "Human insulin premix 30/70 100 IU/ml",
            "Insulin glargine 100 IU/ml", "Insulin glargine 100 IU/ml"
        ]
    },
    {
        cat: "Diabetes", rx: false, form: "", pack: "Pack",
        generic: "Blood sugar testing supplies",
        uses: "Checking blood sugar at home.",
        dose: DEVICE,
        store: DRY,
        items: [
            ["Accu-Chek Active Glucometer", "Roche Diabetes Care India Pvt Ltd", ONE("")],
            ["Accu-Chek Active Test Strips (Pack of 50)", "Roche Diabetes Care India Pvt Ltd", ONE("")],
            ["Accu-Chek Softclix Lancets (Pack of 25)", "Roche Diabetes Care India Pvt Ltd", ONE("")],
            ["OneTouch Select Plus Test Strips (Pack of 50)", "LifeScan India", ONE("")],
            ["BD Insulin Syringe 40 IU 1 ml (Pack of 10)", "Becton Dickinson India Pvt Ltd", ONE("")],
            ["Accu-Chek Instant Glucometer", "Roche Diabetes Care India Pvt Ltd", ONE("")]
        ],
        prices: [1350, 950, 180, 1150, 130, 1200],
        generics: ["Blood glucose meter", "Blood glucose test strips", "Lancets", "Blood glucose test strips", "Insulin syringe 40 IU", "Blood glucose meter"]
    },

    // ---------------- HEART & BLOOD PRESSURE ----------------
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Amlodipine {s} mg",
        uses: "Treatment of high blood pressure and angina (chest pain).",
        dose: "Once a day at the same time, as prescribed. Do not stop suddenly.",
        store: ROOM,
        items: [
            ["Amlong", "Micro Labs Ltd", [["2.5", 22], ["5", 35], ["10", 60]]],
            ["Amlopres", "Cipla Ltd", [["5", 40]]],
            ["Stamlo", "Dr. Reddy's Laboratories Ltd", [["5", 45], ["10", 75]]],
            ["Amlokind", "Mankind Pharma Ltd", [["5", 20]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Telmisartan {s} mg",
        uses: "Treatment of high blood pressure and protection of the heart and kidneys.",
        dose: "Once a day at the same time, as prescribed. Do not stop suddenly.",
        store: ROOM,
        items: [
            ["Telma", "Glenmark Pharmaceuticals Ltd", [["20", 110], ["40", 185], ["80", 290]]],
            ["Telmikind", "Mankind Pharma Ltd", [["40", 80]]],
            ["Telvas", "Aristo Pharmaceuticals Pvt Ltd", [["40", 100]]],
            ["Tazloc", "USV Pvt Ltd", [["40", 150]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Telmisartan 40 mg + Hydrochlorothiazide 12.5 mg",
        uses: "Treatment of high blood pressure.",
        dose: "Once a day in the morning, as prescribed.",
        store: ROOM,
        items: [
            ["Telma-H", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Telmikind-H", "Mankind Pharma Ltd", ONE("")],
            ["Tazloc-H", "USV Pvt Ltd", ONE("")]
        ],
        prices: [205, 95, 165]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Telmisartan 40 mg + Amlodipine 5 mg",
        uses: "Treatment of high blood pressure.",
        dose: "Once a day at the same time, as prescribed.",
        store: ROOM,
        items: [
            ["Telma-AM", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Telmikind-AM", "Mankind Pharma Ltd", ONE("")],
            ["Tazloc-AM", "USV Pvt Ltd", ONE("")]
        ],
        prices: [215, 100, 170]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Losartan {s} mg",
        uses: "Treatment of high blood pressure and protection of the kidneys in diabetes.",
        dose: "Once a day, as prescribed.",
        store: ROOM,
        items: [
            ["Losar", "Unichem Laboratories Ltd", [["25", 35], ["50", 60]]],
            ["Repace", "Sun Pharmaceutical Industries Ltd", [["50", 90]]],
            ["Losacar", "Zydus Lifesciences Ltd", [["50", 70]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Olmesartan {s} mg",
        uses: "Treatment of high blood pressure.",
        dose: "Once a day, as prescribed.",
        store: ROOM,
        items: [
            ["Olmezest", "Sun Pharmaceutical Industries Ltd", [["20", 120], ["40", 200]]],
            ["Olsar", "Unichem Laboratories Ltd", [["20", 115]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Metoprolol succinate ER {s} mg",
        uses: "Treatment of high blood pressure, angina, fast heartbeat and heart failure.",
        dose: "Once a day, as prescribed. Do not stop suddenly.",
        store: ROOM,
        items: [
            ["Met XL", "Ajanta Pharma Ltd", [["25", 60], ["50", 95]]],
            ["Metolar XR", "Cipla Ltd", [["25", 70], ["50", 110]]],
            ["Prolomet XL", "Sun Pharmaceutical Industries Ltd", [["25", 75]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 14 tablets",
        generic: "Atenolol {s} mg",
        uses: "Treatment of high blood pressure and angina.",
        dose: "Once a day, as prescribed. Do not stop suddenly.",
        store: ROOM,
        items: [["Aten", "Zydus Lifesciences Ltd", [["25", 15], ["50", 25]]]]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Nebivolol {s} mg",
        uses: "Treatment of high blood pressure.",
        dose: "Once a day, as prescribed.",
        store: ROOM,
        items: [
            ["Nebicard", "Torrent Pharmaceuticals Ltd", [["5", 110]]],
            ["Nebistar", "Lupin Ltd", [["5", 105]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Cilnidipine {s} mg",
        uses: "Treatment of high blood pressure.",
        dose: "Once a day after food, as prescribed.",
        store: ROOM,
        items: [["Cilacar", "J.B. Chemicals & Pharmaceuticals Ltd", [["10", 140]]]]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Capsule", pack: "Strip of 10 capsules",
        generic: "Ramipril {s} mg",
        uses: "Treatment of high blood pressure and heart failure; protects heart and kidneys.",
        dose: "Once a day, as prescribed.",
        store: ROOM,
        items: [["Cardace", "Sanofi India Ltd", [["2.5", 90], ["5", 140]]]]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Atorvastatin {s} mg",
        uses: "Lowers bad cholesterol and reduces the risk of heart attack and stroke.",
        dose: "Once a day, usually at night, as prescribed.",
        store: ROOM,
        items: [
            ["Atorva", "Zydus Lifesciences Ltd", [["10", 95], ["20", 165], ["40", 260]]],
            ["Storvas", "Sun Pharmaceutical Industries Ltd", [["10", 105], ["20", 180]]],
            ["Atocor", "Dr. Reddy's Laboratories Ltd", [["10", 85]]],
            ["Tonact", "Lupin Ltd", [["10", 90]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Rosuvastatin {s} mg",
        uses: "Lowers bad cholesterol and reduces the risk of heart attack and stroke.",
        dose: "Once a day, as prescribed.",
        store: ROOM,
        items: [
            ["Rosuvas", "Sun Pharmaceutical Industries Ltd", [["5", 120], ["10", 220], ["20", 380]]],
            ["Rozavel", "Sun Pharmaceutical Industries Ltd", [["10", 210]]],
            ["Crestor", "AstraZeneca Pharma India Ltd", [["10", 310]]]
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Cholesterol / triglyceride combination",
        uses: "Lowers cholesterol and triglycerides.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Rosuvas F 10", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Lipicard 160", "USV Pvt Ltd", ONE("")]
        ],
        prices: [300, 110],
        generics: ["Rosuvastatin 10 mg + Fenofibrate 160 mg", "Fenofibrate 160 mg"],
        addForm: true
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 14 tablets",
        generic: "Aspirin {s} mg (low dose)",
        uses: "Prevents blood clots, heart attack and stroke in people at risk.",
        dose: "Once a day after food, as prescribed.",
        store: ROOM,
        items: [["Ecosprin", "USV Pvt Ltd", [["75", 6], ["150", 9]]]]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "", pack: "Strip",
        generic: "Antiplatelet and heart combinations",
        uses: "Prevents blood clots, heart attack and stroke.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Ecosprin-AV 75 Capsule", "USV Pvt Ltd", ONE("")],
            ["Clopilet 75 Tablet", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Deplatt 75 Tablet", "Torrent Pharmaceuticals Ltd", ONE("")],
            ["Clopilet-A 75 Tablet", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Deplatt-A 75 Tablet", "Torrent Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [65, 95, 105, 70, 75],
        generics: [
            "Aspirin 75 mg + Atorvastatin 10 mg", "Clopidogrel 75 mg", "Clopidogrel 75 mg",
            "Clopidogrel 75 mg + Aspirin 75 mg", "Clopidogrel 75 mg + Aspirin 75 mg"
        ]
    },
    {
        cat: "Heart & Blood Pressure", rx: true, form: "Tablet", pack: "Strip of 15 tablets",
        generic: "Diuretics and heart medicines",
        uses: "Removes extra water from the body (swelling, heart failure, high blood pressure) or relieves angina.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Lasix 40", "Sanofi India Ltd", ONE("")],
            ["Dytor 10", "Cipla Ltd", ONE("")],
            ["Dytor 20", "Cipla Ltd", ONE("")],
            ["Aldactone 25", "RPG Life Sciences Ltd", ONE("")],
            ["Sorbitrate 5", "Abbott India Ltd", ONE("")]
        ],
        prices: [15, 70, 120, 50, 22],
        generics: ["Furosemide 40 mg", "Torsemide 10 mg", "Torsemide 20 mg", "Spironolactone 25 mg", "Isosorbide dinitrate 5 mg (under the tongue)"],
        addForm: true
    },

    // ---------------- THYROID ----------------
    {
        cat: "Thyroid", rx: true, form: "Tablet", pack: "Bottle of 100 tablets",
        generic: "Levothyroxine {s} mcg",
        uses: "Treatment of hypothyroidism (underactive thyroid).",
        dose: "Once a day on an empty stomach, 30–60 minutes before breakfast, exactly as prescribed.",
        store: BOTTLE,
        items: [
            ["Thyronorm", "Abbott India Ltd", [["12.5", 120], ["25", 130], ["50", 155], ["75", 180], ["88", 190], ["100", 210]]],
            ["Eltroxin", "GSK Pharmaceuticals Ltd", [["25", 110], ["50", 130], ["100", 175]]],
            ["Thyrox", "Macleods Pharmaceuticals Ltd", [["25", 105], ["50", 125], ["100", 165]]]
        ]
    },
    {
        cat: "Thyroid", rx: true, form: "Tablet", pack: "Strip of 30 tablets",
        generic: "Carbimazole {s} mg",
        uses: "Treatment of hyperthyroidism (overactive thyroid).",
        dose: DOC,
        store: ROOM,
        items: [["Neo-Mercazole", "Abbott India Ltd", [["5", 85], ["10", 130]]]]
    },

    // ---------------- VITAMINS & SUPPLEMENTS ----------------
    {
        cat: "Vitamins & Supplements", rx: false, form: "", pack: "Strip / bottle",
        generic: "Calcium + Vitamin D3",
        uses: "Calcium and vitamin D supplement for strong bones and teeth, and in deficiency.",
        dose: "1 tablet once or twice a day after meals, or as advised.",
        store: ROOM,
        items: [
            ["Calcimax 500 Tablet (Pack of 15)", "Meyer Organics Pvt Ltd", ONE("")],
            ["Calcimax Forte Plus Tablet (Pack of 30)", "Meyer Organics Pvt Ltd", ONE("")],
            ["Gemcal Capsule (Pack of 10)", "Alkem Laboratories Ltd", ONE("")],
            ["Ostocalcium Tablet (Pack of 30)", "GSK Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [170, 330, 210, 120]
    },
    {
        cat: "Vitamins & Supplements", rx: true, form: "", pack: "Strip / sachet",
        generic: "Vitamin D3 (Cholecalciferol) 60,000 IU",
        uses: "Treatment of vitamin D deficiency.",
        dose: "Usually once a week or once a month, exactly as prescribed by your doctor.",
        store: ROOM,
        items: [
            ["Uprise-D3 60K Capsule (Pack of 4)", "Alkem Laboratories Ltd", ONE("")],
            ["Calcirol 60K Granules Sachet 1 g", "Zydus Lifesciences Ltd", ONE("")],
            ["D-Rise 60K Capsule (Pack of 4)", "USV Pvt Ltd", ONE("")],
            ["Tayo 60K Tablet (Pack of 4)", "Eris Lifesciences Ltd", ONE("")]
        ],
        prices: [155, 55, 140, 140]
    },
    {
        cat: "Vitamins & Supplements", rx: false, form: "", pack: "Strip / bottle",
        generic: "Multivitamin and multimineral",
        uses: "Daily nutritional supplement for energy, immunity and general health.",
        dose: "1 tablet or capsule a day after a meal, or as advised.",
        store: ROOM,
        items: [
            ["Becosules Capsule (Pack of 20)", "Pfizer Ltd", ONE("")],
            ["Becosules Z Capsule (Pack of 20)", "Pfizer Ltd", ONE("")],
            ["Becadexamin Capsule (Pack of 30)", "GSK Pharmaceuticals Ltd", ONE("")],
            ["Supradyn Daily Multivitamin Tablet (Pack of 15)", "Bayer Pharmaceuticals Pvt Ltd", ONE("")],
            ["Revital H Capsule (Pack of 30)", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Zincovit Tablet (Pack of 15)", "Apex Laboratories Pvt Ltd", ONE("")],
            ["A to Z NS Tablet (Pack of 15)", "Alkem Laboratories Ltd", ONE("")],
            ["Neurobion Forte Tablet (Pack of 30)", "Procter & Gamble Health Ltd", ONE("")],
            ["Polybion SF Syrup 200 ml", "Procter & Gamble Health Ltd", ONE("")],
            ["Zincovit Syrup 200 ml", "Apex Laboratories Pvt Ltd", ONE("")],
            ["Evion 400 Capsule (Pack of 10)", "Procter & Gamble Health Ltd", ONE("")],
            ["Evion 600 Capsule (Pack of 10)", "Procter & Gamble Health Ltd", ONE("")]
        ],
        prices: [52, 70, 45, 60, 340, 110, 125, 42, 120, 130, 35, 45],
        generics: [
            "Vitamin B-complex + Vitamin C", "Vitamin B-complex + Vitamin C + Zinc", "Multivitamin with minerals",
            "Multivitamin with minerals", "Multivitamin with ginseng and minerals", "Multivitamin with zinc and minerals",
            "Multivitamin with minerals", "Vitamin B1 + B6 + B12", "Vitamin B-complex syrup", "Multivitamin with zinc syrup",
            "Vitamin E 400 mg", "Vitamin E 600 mg"
        ]
    },
    {
        cat: "Vitamins & Supplements", rx: false, form: "", pack: "Strip / bottle",
        generic: "Iron + Folic acid",
        uses: "Treatment and prevention of iron deficiency anaemia, also in pregnancy.",
        dose: "Once a day after food, or as advised by your doctor. May darken the stools.",
        store: ROOM,
        items: [
            ["Livogen Tablet (Pack of 15)", "Procter & Gamble Health Ltd", ONE("")],
            ["Orofer XT Tablet (Pack of 10)", "Emcure Pharmaceuticals Ltd", ONE("")],
            ["Autrin Capsule (Pack of 30)", "Pfizer Ltd", ONE("")],
            ["Dexorange Syrup 200 ml", "Franco-Indian Pharmaceuticals Pvt Ltd", ONE("")],
            ["Folvite 5 mg Tablet (Pack of 45)", "Pfizer Ltd", ONE("")]
        ],
        prices: [60, 185, 120, 210, 45],
        generics: [
            "Ferrous fumarate + Folic acid", "Ferrous ascorbate + Folic acid", "Iron + Folic acid + Vitamin B12",
            "Iron + Vitamin B12 + Folic acid syrup", "Folic acid 5 mg"
        ]
    },
    {
        cat: "Vitamins & Supplements", rx: false, form: "", pack: "Strip / bottle",
        generic: "Vitamin C and omega-3",
        uses: "Supplements for immunity (vitamin C) and heart and joint health (omega-3 / cod liver oil).",
        dose: "As directed on the pack.",
        store: ROOM,
        items: [
            ["Limcee 500 mg Chewable Tablet (Pack of 15)", "Abbott India Ltd", ONE("")],
            ["Seven Seas Original Cod Liver Oil Capsule (Pack of 100)", "Procter & Gamble Health Ltd", ONE("")],
            ["Maxepa Capsule (Pack of 10)", "Procter & Gamble Health Ltd", ONE("")]
        ],
        prices: [25, 420, 280],
        generics: ["Vitamin C 500 mg", "Cod liver oil (omega-3, vitamins A and D)", "Omega-3 fatty acids (EPA + DHA)"]
    },
    {
        cat: "Vitamins & Supplements", rx: false, form: "", pack: "Jar / pack",
        generic: "Nutrition drink / glucose powder",
        uses: "Nutrition support for energy, recovery and growth.",
        dose: "Mix in water or milk as directed on the pack.",
        store: DRY,
        items: [
            ["Protinex Original Powder 250 g", "Danone India", ONE("")],
            ["Ensure Vanilla Powder 400 g", "Abbott India Ltd", ONE("")],
            ["PediaSure Vanilla Powder 400 g", "Abbott India Ltd", ONE("")],
            ["Glucon-D Original 500 g", "Zydus Wellness Ltd", ONE("")],
            ["Glucon-D Orange 450 g", "Zydus Wellness Ltd", ONE("")],
            ["Ensure Chocolate Powder 400 g", "Abbott India Ltd", ONE("")]
        ],
        prices: [460, 760, 690, 160, 180, 760],
        generics: ["Protein supplement powder", "Complete nutrition powder (adults)", "Complete nutrition powder (children)", "Glucose powder", "Glucose powder", "Complete nutrition powder (adults)"]
    },

    // ---------------- SKIN CARE ----------------
    {
        cat: "Skin Care", rx: false, form: "", pack: "Tube",
        generic: "Antiseptic and wound care cream",
        uses: "Care of minor cuts, burns, wounds and cracked skin; prevents infection.",
        dose: "Clean the area and apply a thin layer 2–3 times a day.",
        store: ROOM,
        items: [
            ["Boroline Antiseptic Cream 20 g", "G.D. Pharmaceuticals Pvt Ltd", ONE("")],
            ["Soframycin Skin Cream 30 g", "Sanofi India Ltd", ONE("")],
            ["Burnol Cream 20 g", "Dr. Morepen Ltd", ONE("")],
            ["Betadine 5% Ointment 20 g", "Win-Medicare Pvt Ltd", ONE("")],
            ["Neosporin Powder 10 g", "GSK Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [40, 95, 70, 125, 135],
        generics: [
            "Boric acid + Zinc oxide antiseptic cream", "Framycetin 1% cream", "Aminacrine + Cetrimide burn cream",
            "Povidone-iodine 5% ointment", "Neomycin + Polymyxin B + Bacitracin powder"
        ]
    },
    {
        cat: "Skin Care", rx: false, form: "", pack: "Bottle / tube",
        generic: "Moisturisers and skin soothers",
        uses: "Relief of dry, itchy or irritated skin and sunburn.",
        dose: "Apply on the skin as often as needed.",
        store: ROOM,
        items: [
            ["Lacto Calamine Lotion 120 ml", "Piramal Pharma Ltd", ONE("")],
            ["Cetaphil Moisturising Lotion 100 ml", "Galderma India Pvt Ltd", ONE("")],
            ["Cetaphil Gentle Skin Cleanser 125 ml", "Galderma India Pvt Ltd", ONE("")],
            ["Nivea Soft Cream 100 ml", "Nivea India Pvt Ltd", ONE("")],
            ["Vaseline Original Petroleum Jelly 85 g", "Hindustan Unilever Ltd", ONE("")],
            ["Venusia Max Cream 100 g", "Dr. Reddy's Laboratories Ltd", ONE("")]
        ],
        prices: [220, 410, 450, 220, 110, 470],
        generics: [
            "Calamine + Zinc oxide lotion", "Moisturising lotion", "Gentle skin cleanser", "Moisturising cream",
            "Petroleum jelly", "Intensive moisturising cream"
        ]
    },
    {
        cat: "Skin Care", rx: false, form: "", pack: "Tube",
        generic: "Sunscreen",
        uses: "Protects the skin from sunburn and tanning.",
        dose: "Apply generously 15 minutes before going out; re-apply every 2–3 hours.",
        store: ROOM,
        items: [
            ["Suncros Aqua Gel SPF 50 50 g", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["La Shield SPF 40 Gel 60 g", "Glenmark Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [550, 650]
    },
    {
        cat: "Skin Care", rx: true, form: "", pack: "Tube",
        generic: "Medicated skin creams",
        uses: "Treatment of skin infections, eczema and inflamed rashes.",
        dose: "Apply a thin layer on the affected area as prescribed. Do not use on the face or for long periods without a doctor's advice.",
        store: ROOM,
        items: [
            ["Betnovate-N Cream 20 g", "GSK Pharmaceuticals Ltd", ONE("")],
            ["Betnovate-C Cream 30 g", "GSK Pharmaceuticals Ltd", ONE("")],
            ["Candid-B Cream 15 g", "Glenmark Pharmaceuticals Ltd", ONE("")],
            ["Panderm Plus Cream 15 g", "Macleods Pharmaceuticals Ltd", ONE("")],
            ["T-Bact Ointment 5 g", "GSK Pharmaceuticals Ltd", ONE("")],
            ["Fusiderm Cream 15 g", "Ipca Laboratories Ltd", ONE("")],
            ["Clindac A Gel 20 g", "Galderma India Pvt Ltd", ONE("")]
        ],
        prices: [58, 65, 145, 120, 190, 120, 175],
        generics: [
            "Betamethasone + Neomycin cream", "Betamethasone + Clioquinol cream", "Beclometasone + Clotrimazole cream",
            "Clobetasol + Ofloxacin + Ornidazole + Terbinafine cream", "Mupirocin 2% ointment", "Fusidic acid 2% cream",
            "Clindamycin 1% gel"
        ]
    },
    {
        cat: "Skin Care", rx: false, form: "", pack: "Tube",
        generic: "Acne and itch care",
        uses: "Treatment of pimples (acne) and fungal itching.",
        dose: "Apply on clean skin as directed on the pack.",
        store: ROOM,
        items: [
            ["Benzac AC 2.5% Gel 20 g", "Galderma India Pvt Ltd", ONE("")],
            ["Itch Guard Cream 20 g", "Reckitt Benckiser India", ONE("")]
        ],
        prices: [290, 65],
        generics: ["Benzoyl peroxide 2.5% gel", "Antifungal anti-itch cream"]
    },

    // ---------------- EYE & EAR CARE ----------------
    {
        cat: "Eye & Ear Care", rx: false, form: "", pack: "Dropper bottle",
        generic: "Lubricant eye drops",
        uses: "Relief of dry, tired or irritated eyes, for example after screen use.",
        dose: "1–2 drops in each eye as often as needed.",
        store: EYE,
        items: [
            ["Refresh Tears Eye Drops 10 ml", "Allergan India Pvt Ltd", ONE("")],
            ["Refresh Liquigel Eye Drops 10 ml", "Allergan India Pvt Ltd", ONE("")],
            ["Tears Naturale II Eye Drops 15 ml", "Alcon Laboratories (India) Pvt Ltd", ONE("")],
            ["Systane Ultra Eye Drops 10 ml", "Alcon Laboratories (India) Pvt Ltd", ONE("")],
            ["Itone Eye Drops 10 ml", "Deys Medical Stores (Mfg) Ltd", ONE("")]
        ],
        prices: [165, 220, 175, 520, 70],
        generics: [
            "Carboxymethylcellulose 0.5%", "Carboxymethylcellulose 1%", "Dextran 70 + Hypromellose",
            "Polyethylene glycol + Propylene glycol", "Herbal eye drops"
        ]
    },
    {
        cat: "Eye & Ear Care", rx: true, form: "", pack: "Dropper bottle",
        generic: "Antibiotic eye / ear drops",
        uses: "Treatment of bacterial eye infections (conjunctivitis) and ear infections.",
        dose: "As prescribed by your doctor. Complete the course.",
        store: EYE,
        items: [
            ["Moxicip 0.5% Eye Drops 5 ml", "Cipla Ltd", ONE("")],
            ["Vigamox Eye Drops 5 ml", "Alcon Laboratories (India) Pvt Ltd", ONE("")],
            ["Ciplox Eye/Ear Drops 10 ml", "Cipla Ltd", ONE("")],
            ["Toba Eye Drops 5 ml", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Tobradex Eye Drops 5 ml", "Alcon Laboratories (India) Pvt Ltd", ONE("")],
            ["Candibiotic Plus Ear Drops 5 ml", "Glenmark Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [85, 235, 25, 80, 185, 105],
        generics: [
            "Moxifloxacin 0.5%", "Moxifloxacin 0.5%", "Ciprofloxacin 0.3%", "Tobramycin 0.3%",
            "Tobramycin + Dexamethasone", "Chloramphenicol + Clotrimazole + Beclometasone + Lidocaine"
        ]
    },

    // ---------------- ASTHMA & BREATHING ----------------
    {
        cat: "Asthma & Breathing", rx: true, form: "", pack: "Inhaler / pack",
        generic: "Asthma inhalers and nebuliser medicines",
        uses: "Relief and prevention of asthma and COPD symptoms such as wheezing and breathlessness.",
        dose: "Use exactly as prescribed. Rinse your mouth after steroid inhalers.",
        store: ROOM,
        items: [
            ["Asthalin 100 mcg Inhaler (200 doses)", "Cipla Ltd", ONE("")],
            ["Levolin 50 mcg Inhaler (200 doses)", "Cipla Ltd", ONE("")],
            ["Foracort 200 Inhaler", "Cipla Ltd", ONE("")],
            ["Foracort 400 Inhaler", "Cipla Ltd", ONE("")],
            ["Budecort 200 Inhaler", "Cipla Ltd", ONE("")],
            ["Foracort 200 Rotacaps (Pack of 30)", "Cipla Ltd", ONE("")],
            ["Budecort 0.5 mg Respules (Pack of 5)", "Cipla Ltd", ONE("")],
            ["Duolin Respules (Pack of 5)", "Cipla Ltd", ONE("")],
            ["Asthalin 2 mg Tablet (Pack of 10)", "Cipla Ltd", ONE("")],
            ["Deriphyllin Retard 150 Tablet (Pack of 10)", "Zydus Lifesciences Ltd", ONE("")]
        ],
        prices: [155, 210, 460, 560, 360, 380, 125, 110, 12, 32],
        generics: [
            "Salbutamol 100 mcg", "Levosalbutamol 50 mcg", "Budesonide 200 mcg + Formoterol 6 mcg",
            "Budesonide 400 mcg + Formoterol 6 mcg", "Budesonide 200 mcg", "Budesonide 200 mcg + Formoterol 6 mcg",
            "Budesonide 0.5 mg nebuliser suspension", "Levosalbutamol + Ipratropium nebuliser solution",
            "Salbutamol 2 mg", "Etofylline + Theophylline 150 mg"
        ]
    },
    {
        cat: "Asthma & Breathing", rx: false, form: "", pack: "Device",
        generic: "Inhalation device",
        uses: "Device for taking rotacap (capsule) inhalers.",
        dose: DEVICE,
        store: DRY,
        items: [["Rotahaler Device", "Cipla Ltd", ONE("")]],
        prices: [160]
    },

    // ---------------- WOMEN'S HEALTH ----------------
    {
        cat: "Women's Health", rx: false, form: "", pack: "Pack",
        generic: "Women's care products",
        uses: "Period care, pregnancy testing and intimate hygiene.",
        dose: "Use as directed on the pack.",
        store: DRY,
        items: [
            ["Prega News Pregnancy Test Kit", "Mankind Pharma Ltd", ONE("")],
            ["Whisper Ultra Clean XL+ Pads (Pack of 7)", "Procter & Gamble Hygiene and Health Care Ltd", ONE("")],
            ["Stayfree Secure XL Pads (Pack of 6)", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["Sofy Antibacteria XL Pads (Pack of 7)", "Unicharm India Pvt Ltd", ONE("")],
            ["V Wash Plus Intimate Hygiene Wash 100 ml", "Glenmark Pharmaceuticals Ltd", ONE("")]
        ],
        prices: [55, 99, 55, 85, 210],
        generics: ["Urine pregnancy test (hCG)", "Sanitary pads", "Sanitary pads", "Sanitary pads", "Intimate hygiene wash"]
    },
    {
        cat: "Women's Health", rx: false, form: "Tablet", pack: "Strip of 1 tablet",
        generic: "Levonorgestrel 1.5 mg (emergency contraceptive)",
        uses: "Emergency contraception within 72 hours of unprotected sex. Not for regular use.",
        dose: "Take 1 tablet as soon as possible, within 72 hours. Consult a doctor if you vomit within 2 hours.",
        store: ROOM,
        items: [
            ["i-pill", "Piramal Pharma Ltd", ONE("")],
            ["Unwanted 72", "Mankind Pharma Ltd", ONE("")]
        ],
        prices: [110, 100]
    },
    {
        cat: "Women's Health", rx: true, form: "Tablet", pack: "Strip",
        generic: "Women's health tablets",
        uses: "Period pain and cramps (Meftal-Spas) or regular birth control (Ovral L).",
        dose: DOC,
        store: ROOM,
        items: [
            ["Meftal-Spas", "Blue Cross Laboratories Pvt Ltd", ONE("")],
            ["Ovral L", "Pfizer Ltd", ONE("")]
        ],
        prices: [48, 60],
        generics: ["Mefenamic acid 250 mg + Dicyclomine 10 mg", "Levonorgestrel 0.15 mg + Ethinyl estradiol 0.03 mg"]
    },
    {
        cat: "Women's Health", rx: false, form: "", pack: "Bottle of 450 ml",
        generic: "Ayurvedic uterine tonic (Ashokarishta)",
        uses: "Traditional Ayurvedic tonic for women's health and menstrual problems.",
        dose: "15–30 ml with equal water after meals, or as advised.",
        store: ROOM,
        items: [["Dabur Ashokarishta 450 ml", "Dabur India Ltd", ONE("")]],
        prices: [190]
    },

    // ---------------- BABY CARE ----------------
    {
        cat: "Baby Care", rx: false, form: "Drops", pack: "Bottle of 15 ml",
        generic: "Paracetamol {s} (drops for infants)",
        uses: "Relief of fever and pain in infants.",
        dose: "Give only the dose advised by the doctor, using the dropper. Dose depends on the baby's weight.",
        store: SYRUP,
        items: [
            ["Calpol", "GSK Pharmaceuticals Ltd", [["100 mg/ml", 45]]],
            ["Pacimol", "Ipca Laboratories Ltd", [["100 mg/ml", 40]]]
        ]
    },
    {
        cat: "Baby Care", rx: false, form: "", pack: "Pack",
        generic: "Baby care products",
        uses: "Daily care, hygiene and nutrition for babies.",
        dose: "Use as directed on the pack.",
        store: DRY,
        items: [
            ["Woodward's Gripe Water 130 ml", "TTK Healthcare Ltd", ONE("")],
            ["Himalaya Diaper Rash Cream 50 g", "Himalaya Wellness Company", ONE("")],
            ["Johnson's Baby Powder 200 g", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["Johnson's Baby Oil 200 ml", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["Himalaya Gentle Baby Wipes (Pack of 72)", "Himalaya Wellness Company", ONE("")],
            ["Pampers Baby Dry Pants Medium (Pack of 20)", "Procter & Gamble Home Products Pvt Ltd", ONE("")],
            ["MamyPoko Pants Large (Pack of 20)", "Unicharm India Pvt Ltd", ONE("")],
            ["Cerelac Wheat Apple 300 g", "Nestle India Ltd", ONE("")],
            ["Nestle NAN Pro 1 Infant Formula 400 g", "Nestle India Ltd", ONE("")],
            ["Lactogen 1 Infant Formula 400 g", "Nestle India Ltd", ONE("")],
            ["Sebamed Baby Lotion 100 ml", "Sebapharma GmbH", ONE("")],
            ["Dabur Lal Tail 100 ml", "Dabur India Ltd", ONE("")]
        ],
        prices: [80, 140, 200, 230, 199, 399, 399, 299, 690, 480, 450, 140],
        generics: [
            "Gripe water (dill oil + sodium bicarbonate)", "Diaper rash cream", "Baby powder", "Baby oil", "Baby wipes",
            "Baby diaper pants", "Baby diaper pants", "Infant cereal", "Infant formula (stage 1)", "Infant formula (stage 1)",
            "Baby lotion", "Ayurvedic baby massage oil"
        ]
    },

    // ---------------- SURGICAL & FIRST AID ----------------
    {
        cat: "Surgical & First Aid", rx: false, form: "", pack: "Pack",
        generic: "First aid dressings",
        uses: "Covering and protecting minor cuts, wounds and sprains.",
        dose: "Clean the wound before applying. Change dressings daily or when wet.",
        store: DRY,
        items: [
            ["Band-Aid Washproof (Pack of 10)", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["Hansaplast Regular Strips (Pack of 20)", "Beiersdorf India Pvt Ltd", ONE("")],
            ["Hansaplast Washproof Strips (Pack of 20)", "Beiersdorf India Pvt Ltd", ONE("")],
            ["Absorbent Cotton Wool IP 50 g", "Ramaraju Surgical Cotton Mills Ltd", ONE("")],
            ["Absorbent Cotton Wool IP 100 g", "Ramaraju Surgical Cotton Mills Ltd", ONE("")],
            ["Sterile Gauze Swabs 10 cm x 10 cm (Pack of 10)", "Romsons Group", ONE("")],
            ["Gauze Bandage Roll 10 cm x 3 m", "Romsons Group", ONE("")],
            ["Dyna Crepe Bandage 7.5 cm", "Dynamic Techno Medicals Pvt Ltd", ONE("")],
            ["Dyna Crepe Bandage 10 cm", "Dynamic Techno Medicals Pvt Ltd", ONE("")],
            ["3M Micropore Surgical Tape 1 inch", "3M India Ltd", ONE("")],
            ["3M Micropore Surgical Tape 2 inch", "3M India Ltd", ONE("")],
            ["Johnson's Cotton Buds (Pack of 100)", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")]
        ],
        prices: [40, 55, 65, 40, 75, 60, 30, 120, 140, 95, 170, 70],
        generics: [
            "Adhesive bandage strips", "Adhesive bandage strips", "Adhesive bandage strips", "Absorbent cotton",
            "Absorbent cotton", "Sterile gauze swabs", "Gauze bandage", "Crepe bandage", "Crepe bandage",
            "Surgical paper tape", "Surgical paper tape", "Cotton buds"
        ]
    },
    {
        cat: "Surgical & First Aid", rx: false, form: "", pack: "Bottle",
        generic: "Antiseptic liquid",
        uses: "Cleaning cuts and wounds, and general hygiene.",
        dose: "Dilute as directed on the label before use on skin.",
        store: ROOM,
        items: [
            ["Dettol Antiseptic Liquid 125 ml", "Reckitt Benckiser India", ONE("")],
            ["Dettol Antiseptic Liquid 250 ml", "Reckitt Benckiser India", ONE("")],
            ["Savlon Antiseptic Liquid 200 ml", "ITC Ltd", ONE("")],
            ["Betadine 10% Solution 100 ml", "Win-Medicare Pvt Ltd", ONE("")],
            ["Dettol Antiseptic Liquid 500 ml", "Reckitt Benckiser India", ONE("")]
        ],
        prices: [90, 175, 115, 125, 330],
        generics: ["Chloroxylenol antiseptic", "Chloroxylenol antiseptic", "Chlorhexidine + Cetrimide antiseptic", "Povidone-iodine 10% solution", "Chloroxylenol antiseptic"]
    },
    {
        cat: "Surgical & First Aid", rx: false, form: "", pack: "Piece / pack",
        generic: "Syringes, cannulas and medical disposables",
        uses: "Medical disposables for injections, drips and samples, used by a doctor or nurse.",
        dose: "For single use only. Dispose of safely after use.",
        store: DRY,
        items: [
            ["Dispovan Syringe 2 ml with Needle", "Hindustan Syringes & Medical Devices Ltd", ONE("")],
            ["Dispovan Syringe 5 ml with Needle", "Hindustan Syringes & Medical Devices Ltd", ONE("")],
            ["Dispovan Syringe 10 ml with Needle", "Hindustan Syringes & Medical Devices Ltd", ONE("")],
            ["BD Venflon IV Cannula 20G", "Becton Dickinson India Pvt Ltd", ONE("")],
            ["BD Venflon IV Cannula 22G", "Becton Dickinson India Pvt Ltd", ONE("")],
            ["Romsons Urine Collection Bag 2 L", "Romsons Group", ONE("")],
            ["Romsons Sterile Urine Container", "Romsons Group", ONE("")]
        ],
        prices: [7, 9, 12, 130, 130, 60, 15],
        generics: [
            "Disposable syringe 2 ml", "Disposable syringe 5 ml", "Disposable syringe 10 ml", "IV cannula 20G",
            "IV cannula 22G", "Urine collection bag", "Sterile sample container"
        ]
    },
    {
        cat: "Surgical & First Aid", rx: false, form: "", pack: "Pack",
        generic: "Gloves and masks",
        uses: "Protection during medical care and against infection.",
        dose: "For single use only.",
        store: DRY,
        items: [
            ["Romsons Latex Examination Gloves (Box of 100)", "Romsons Group", ONE("")],
            ["Romsons Sterile Surgical Gloves Size 7 (1 pair)", "Romsons Group", ONE("")],
            ["3-Ply Surgical Face Mask (Pack of 50)", "Romsons Group", ONE("")],
            ["Venus N95 V-4400 Mask", "Venus Safety & Health Pvt Ltd", ONE("")]
        ],
        prices: [480, 35, 250, 85],
        generics: ["Latex examination gloves", "Sterile surgical gloves", "Surgical face mask (3-ply)", "N95 respirator mask"]
    },
    {
        cat: "Surgical & First Aid", rx: false, form: "", pack: "Piece",
        generic: "Hot / cold therapy and supports",
        uses: "Relief of pain with heat or cold, and support for knees, neck and back.",
        dose: DEVICE,
        store: DRY,
        items: [
            ["Flamingo Hot Water Bag 2 L", "Flamingo Healthcare Ltd", ONE("")],
            ["Flamingo Ice Bag 9 inch", "Flamingo Healthcare Ltd", ONE("")],
            ["Tynor Knee Cap Medium", "Tynor Orthotics Pvt Ltd", ONE("")],
            ["Tynor Cervical Collar Soft", "Tynor Orthotics Pvt Ltd", ONE("")],
            ["Tynor Lumbo Sacral Belt Medium", "Tynor Orthotics Pvt Ltd", ONE("")]
        ],
        prices: [260, 210, 330, 380, 950],
        generics: ["Hot water bag", "Ice bag", "Knee support", "Soft cervical collar", "Lumbar support belt"]
    },

    // ---------------- HEALTH DEVICES ----------------
    {
        cat: "Health Devices", rx: false, form: "", pack: "Device",
        generic: "Home health monitors",
        uses: "Checking temperature, blood pressure and oxygen level at home, and steam or nebuliser therapy.",
        dose: DEVICE,
        store: DRY,
        items: [
            ["Omron HEM-7120 BP Monitor", "Omron Healthcare India Pvt Ltd", ONE("")],
            ["Omron MC-246 Digital Thermometer", "Omron Healthcare India Pvt Ltd", ONE("")],
            ["Dr. Morepen MT-101 Digital Thermometer", "Dr. Morepen Ltd", ONE("")],
            ["Dr Trust Infrared Forehead Thermometer", "Nureca Ltd", ONE("")],
            ["Dr Trust Fingertip Pulse Oximeter", "Nureca Ltd", ONE("")],
            ["Omron NE-C101 Compressor Nebulizer", "Omron Healthcare India Pvt Ltd", ONE("")],
            ["Dr. Morepen Steam Vaporizer", "Dr. Morepen Ltd", ONE("")],
            ["Omron HEM-7156 BP Monitor", "Omron Healthcare India Pvt Ltd", ONE("")]
        ],
        prices: [2300, 260, 190, 1800, 1500, 2200, 450, 3200],
        generics: [
            "Automatic blood pressure monitor", "Digital thermometer", "Digital thermometer", "Infrared thermometer",
            "Fingertip pulse oximeter", "Compressor nebulizer", "Steam vaporizer", "Automatic blood pressure monitor"
        ]
    },

    // ---------------- PERSONAL CARE ----------------
    {
        cat: "Personal Care", rx: false, form: "", pack: "Pack",
        generic: "Hygiene and personal care",
        uses: "Daily hygiene, oral care and personal care.",
        dose: "Use as directed on the pack.",
        store: DRY,
        items: [
            ["Dettol Instant Hand Sanitizer 200 ml", "Reckitt Benckiser India", ONE("")],
            ["Savlon Hand Sanitizer 200 ml", "ITC Ltd", ONE("")],
            ["Sensodyne Fresh Mint Toothpaste 70 g", "Haleon India", ONE("")],
            ["Sensodyne Repair & Protect Toothpaste 70 g", "Haleon India", ONE("")],
            ["Listerine Cool Mint Mouthwash 250 ml", "Kenvue (Johnson & Johnson Pvt Ltd)", ONE("")],
            ["Hexidine Mouthwash 160 ml", "ICPA Health Products Ltd", ONE("")],
            ["Colgate Plax Peppermint Mouthwash 250 ml", "Colgate-Palmolive (India) Ltd", ONE("")],
            ["Durex Extra Safe Condoms (Pack of 10)", "Reckitt Benckiser India", ONE("")],
            ["Manforce Condoms (Pack of 10)", "Mankind Pharma Ltd", ONE("")],
            ["Selsun Suspension 120 ml", "Abbott India Ltd", ONE("")],
            ["Friends Adult Diapers Medium (Pack of 10)", "Nobel Hygiene Pvt Ltd", ONE("")],
            ["Odomos Mosquito Repellent Cream 100 g", "Dabur India Ltd", ONE("")],
            ["Dettol Original Soap 75 g", "Reckitt Benckiser India", ONE("")]
        ],
        prices: [100, 95, 135, 220, 185, 115, 140, 230, 110, 300, 480, 110, 40],
        generics: [
            "Alcohol hand sanitizer", "Alcohol hand sanitizer", "Toothpaste for sensitive teeth", "Toothpaste for sensitive teeth",
            "Antiseptic mouthwash", "Chlorhexidine 0.2% mouthwash", "Antibacterial mouthwash", "Condoms", "Condoms",
            "Selenium sulfide 2.5% anti-dandruff suspension", "Adult diapers", "Mosquito repellent cream", "Antibacterial soap"
        ]
    },

    // ---------------- AYURVEDA & HERBAL ----------------
    {
        cat: "Ayurveda & Herbal", rx: false, form: "", pack: "Pack",
        generic: "Ayurvedic and herbal products",
        uses: "Traditional Ayurvedic and herbal products for immunity, digestion, liver, urinary and general health.",
        dose: "As directed on the pack or by an Ayurvedic practitioner.",
        store: ROOM,
        items: [
            ["Dabur Chyawanprash 500 g", "Dabur India Ltd", ONE("")],
            ["Dabur Chyawanprash 1 kg", "Dabur India Ltd", ONE("")],
            ["Dabur Chyawanprash Sugar Free 500 g", "Dabur India Ltd", ONE("")],
            ["Dabur Honey 250 g", "Dabur India Ltd", ONE("")],
            ["Himalaya Liv.52 Tablet (Pack of 100)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Liv.52 Syrup 200 ml", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Septilin Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Cystone Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Ashwagandha Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Neem Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Tulasi Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Rumalaya Forte Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Himalaya Pilex Tablet (Pack of 60)", "Himalaya Wellness Company", ONE("")],
            ["Dabur Hajmola Regular (120 tablets)", "Dabur India Ltd", ONE("")],
            ["Dabur Pudin Hara Pearls (Pack of 10)", "Dabur India Ltd", ONE("")],
            ["Zandu Pancharishta 450 ml", "Emami Ltd", ONE("")],
            ["Baidyanath Triphala Churna 100 g", "Shree Baidyanath Ayurved Bhawan Pvt Ltd", ONE("")]
        ],
        prices: [240, 430, 330, 130, 165, 150, 165, 200, 210, 190, 190, 210, 190, 70, 30, 215, 70],
        generics: [
            "Chyawanprash (immunity)", "Chyawanprash (immunity)", "Chyawanprash sugar free (immunity)", "Honey", "Liver care (herbal)", "Liver care (herbal)",
            "Immunity booster (herbal)", "Kidney stone and urinary care (herbal)", "Ashwagandha (stress and strength)",
            "Neem (skin and blood purifier)", "Tulasi (respiratory care)", "Joint pain care (herbal)", "Piles care (herbal)",
            "Digestive tablets (herbal)", "Pudina oil pearls (gas and indigestion)", "Digestive tonic (Ayurvedic)",
            "Triphala powder (digestion and constipation)"
        ]
    },

    // ---------------- NERVE & BRAIN HEALTH ----------------
    {
        cat: "Nerve & Brain Health", rx: true, form: "Tablet", pack: "Strip of 10 tablets",
        generic: "Nerve and brain medicines",
        uses: "Relief of vertigo, motion sickness, migraine and nerve weakness.",
        dose: DOC,
        store: ROOM,
        items: [
            ["Vertin 8", "Abbott India Ltd", ONE("")],
            ["Vertin 16", "Abbott India Ltd", ONE("")],
            ["Avomine", "Abbott India Ltd", ONE("")],
            ["Suminat 50", "Sun Pharmaceutical Industries Ltd", ONE("")],
            ["Nurokind OD", "Mankind Pharma Ltd", ONE("")]
        ],
        prices: [90, 180, 35, 160, 130],
        generics: [
            "Betahistine 8 mg", "Betahistine 16 mg", "Promethazine theoclate 25 mg", "Sumatriptan 50 mg",
            "Methylcobalamin 1500 mcg"
        ],
        addForm: true
    },

    // ---------------- KIDNEY & URINARY ----------------
    {
        cat: "Kidney & Urinary", rx: true, form: "Capsule", pack: "Strip of 15 capsules",
        generic: "Prostate and urinary medicines",
        uses: "Relief of urinary problems due to an enlarged prostate.",
        dose: "Once a day after the same meal each day, as prescribed.",
        store: ROOM,
        items: [
            ["Urimax 0.4", "Cipla Ltd", ONE("")],
            ["Urimax-D", "Cipla Ltd", ONE("")]
        ],
        prices: [250, 380],
        generics: ["Tamsulosin 0.4 mg", "Tamsulosin 0.4 mg + Dutasteride 0.5 mg"],
        addForm: true
    }
];


/*
| Turns ENTRIES into one row per product:
| { category, name, generic, brand, maker, price, rx, uses, dose, store, pack }
*/
function buildProducts() {

    const products = [];

    for (const entry of ENTRIES) {
        entry.items.forEach(([brand, maker, strengths], itemIndex) => {
            for (const [strength, listedPrice] of strengths) {
                const price = listedPrice || entry.prices?.[itemIndex];
                const addForm = entry.form && (entry.addForm || strength !== "" || entry.prices);

                products.push({
                    category: entry.cat,
                    name: [brand, strength, addForm ? entry.form : ""].filter(Boolean).join(" "),
                    generic: entry.generics?.[itemIndex] || entry.generic.replace("{s}", strength).trim(),
                    brand: brand.split(/ \d| \(/)[0],
                    maker,
                    price,
                    rx: entry.rx,
                    uses: entry.uses,
                    dose: entry.dose,
                    store: entry.store,
                    pack: entry.pack
                });
            }
        });
    }

    return products;
}


module.exports = { CATEGORIES, buildProducts };
