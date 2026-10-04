// ==========================================
// رابط Google Apps Script
// ==========================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzkvBi5jiox12ObEG8RKoWgJM3hJrp1djQQpeopzKkrTmPAZvqdZUoUzT82etTZ11UG/exec";


// ==========================================
// متغيرات البرنامج
// ==========================================

let allPatients = [];
let scanner = null;


// ==========================================
// تشغيل البرنامج
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    loadPatients();

});


// ==========================================
// تحميل المرضى
// ==========================================

async function loadPatients() {

    const box =
        document.getElementById("searchResults");

    if (!box) {
        console.log("searchResults غير موجود");
        return;
    }

    box.innerHTML = `
        <div class="no-result">
            ⏳ جاري تحميل بيانات المرضى...
        </div>
    `;

    try {

        const response = await fetch(
            API_URL + "?action=patients&t=" + Date.now()
        );

        const data = await response.json();

        console.log("المرضى:", data);

        if (Array.isArray(data)) {

            allPatients = data;

            displayPatients(allPatients);

        } else {

            allPatients = [];

            box.innerHTML = `
                <div class="no-result">
                    ❌ لا توجد بيانات مرضى
                </div>
            `;

        }

    } catch (error) {

        console.error(error);

        box.innerHTML = `
            <div class="no-result">
                ❌ تعذر الاتصال بقاعدة بيانات المرضى
            </div>
        `;

    }

}


// ==========================================
// إضافة مريض
// ==========================================

async function addPatient() {

    const name =
        document.getElementById("patientName").value.trim();

    const phone =
        document.getElementById("patientPhone").value.trim();

    const birthDate =
        document.getElementById("patientBirthDate").value;

    const notes =
        document.getElementById("patientNotes").value.trim();


    if (!name) {

        alert("يرجى إدخال اسم المريض");

        return;

    }


    if (!phone) {

        alert("يرجى إدخال رقم الهاتف");

        return;

    }


    try {

        const url =
            API_URL +
            "?action=addPatient" +
            "&name=" + encodeURIComponent(name) +
            "&phone=" + encodeURIComponent(phone) +
            "&birthDate=" + encodeURIComponent(birthDate) +
            "&notes=" + encodeURIComponent(notes) +
            "&t=" + Date.now();


        const response =
            await fetch(url);


        const data =
            await response.json();


        console.log("إضافة:", data);


        if (!data.success) {

            alert(
                "❌ " +
                (data.message || "فشلت إضافة المريض")
            );

            return;

        }


        alert("✅ تمت إضافة المريض بنجاح");


        document.getElementById("patientName").value = "";

        document.getElementById("patientPhone").value = "";

        document.getElementById("patientBirthDate").value = "";

        document.getElementById("patientNotes").value = "";


        await loadPatients();


    } catch (error) {

        console.error(error);

        alert(
            "❌ حدث خطأ في الاتصال بقاعدة البيانات"
        );

    }

}


// ==========================================
// تحويل الأرقام العربية إلى إنجليزية
// ==========================================

function normalizeText(value) {

    return String(value || "")

        .toLowerCase()

        .trim()

        .replace(/[٠-٩]/g, function (digit) {

            return "٠١٢٣٤٥٦٧٨٩".indexOf(digit);

        })

        .replace(/\s+/g, "");

}


// ==========================================
// البحث
// ==========================================

function searchPatients() {

    const input =
        document.getElementById("searchInput");


    const box =
        document.getElementById("searchResults");


    if (!input || !box) {

        console.log("عنصر البحث غير موجود");

        return;

    }


    const searchValue =
        normalizeText(input.value);


    console.log("البحث عن:", searchValue);


    // إذا كان مربع البحث فارغاً
    if (searchValue === "") {

        displayPatients(allPatients);

        return;

    }


    const results =
        allPatients.filter(function (patient) {

            const id =
                normalizeText(patient.ID);

            const name =
                normalizeText(patient.Name);

            const phone =
                normalizeText(patient.Phone);


            return (

                id.includes(searchValue) ||

                name.includes(searchValue) ||

                phone.includes(searchValue)

            );

        });


    console.log("نتائج البحث:", results);


    displayPatients(results);

}


// ==========================================
// عرض المرضى
// ==========================================

function displayPatients(patients) {

    const box =
        document.getElementById("searchResults");


    if (!box) {

        return;

    }


    if (!patients || patients.length === 0) {

        box.innerHTML = `
            <div class="no-result">

                🔍 لا يوجد مريض مطابق للبحث

            </div>
        `;

        return;

    }


    box.innerHTML = patients.map(function (patient) {

        const id =
            patient.ID || "";

        const name =
            patient.Name || "";

        const phone =
            patient.Phone || "";

        const birthDate =
            patient.BirthDate || "";


        return `

            <div class="patient-result">

                <div class="patient-info">

                    <h3>
                        👤 ${escapeHTML(name)}
                    </h3>

                    <p>
                        📱 ${escapeHTML(phone)}
                    </p>

                    <p>
                        🆔 ${escapeHTML(id)}
                    </p>

                    ${
                        birthDate
                        ?
                        `<p>🎂 ${escapeHTML(birthDate)}</p>`
                        :
                        ""
                    }

                </div>


                <div class="patient-buttons">

                    <button
                        class="primary-button"
                        onclick="openPatient('${escapeJS(id)}')"
                    >
                        📂 فتح الملف
                    </button>


                    <button
                        class="scan-button"
                        onclick="showBarcode('${escapeJS(id)}','${escapeJS(name)}')"
                    >
                        ▣ الباركود
                    </button>

                </div>

            </div>

        `;

    }).join("");

}


// ==========================================
// فتح ملف المريض
// ==========================================

function openPatient(id) {

    if (!id) {

        alert("رقم المريض غير موجود");

        return;

    }


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


// ==========================================
// عرض الباركود
// ==========================================

function showBarcode(id, name) {

    const section =
        document.getElementById("barcodeSection");

    const title =
        document.getElementById("barcodePatientName");

    const barcode =
        document.getElementById("barcode");


    if (!section || !barcode) {

        alert("قسم الباركود غير موجود");

        return;

    }


    section.style.display = "block";


    if (title) {

        title.textContent =
            "المريض: " +
            name +
            " | الرقم: " +
            id;

    }


    if (typeof JsBarcode !== "undefined") {

        JsBarcode(
            "#barcode",
            id,
            {
                format: "CODE128",
                width: 2,
                height: 80,
                displayValue: true,
                margin: 10
            }
        );

    }


    section.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// طباعة الباركود
// ==========================================

function printBarcode() {

    const barcode =
        document.getElementById("barcode");

    const title =
        document.getElementById("barcodePatientName");


    if (!barcode) {

        alert("لا يوجد باركود");

        return;

    }


    const printWindow =
        window.open("", "_blank");


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="ar" dir="rtl">

        <head>

            <meta charset="UTF-8">

            <title>باركود المريض</title>

            <style>

                body {
                    text-align: center;
                    font-family: Arial;
                    padding: 40px;
                }

            </style>

        </head>

        <body>

            <h2>
                ${
                    title
                    ?
                    escapeHTML(title.textContent)
                    :
                    ""
                }
            </h2>

            ${barcode.outerHTML}

            <script>

                window.onload = function() {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


// ==========================================
// تشغيل الكاميرا
// ==========================================

function startScanner() {

    const reader =
        document.getElementById("reader");


    if (!reader) {

        alert("مكان الكاميرا غير موجود");

        return;

    }


    if (typeof Html5Qrcode === "undefined") {

        alert("قارئ الباركود غير محمل");

        return;

    }


    if (scanner) {

        return;

    }


    scanner =
        new Html5Qrcode("reader");


    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,

            qrbox: {
                width: 280,
                height: 150
            }

        },

        function(decodedText) {

            const search =
                document.getElementById(
                    "searchInput"
                );


            if (search) {

                search.value =
                    decodedText;

            }


            searchPatients();


            stopScanner();

        },

        function(errorMessage) {

            // تجاهل أخطاء القراءة

        }

    ).catch(function(error) {

        console.error(error);

        scanner = null;

        alert(
            "❌ تعذر تشغيل الكاميرا"
        );

    });

}


// ==========================================
// إيقاف الكاميرا
// ==========================================

function stopScanner() {

    if (!scanner) {

        return;

    }


    scanner.stop()

        .then(function() {

            scanner.clear();

            scanner = null;

        })

        .catch(function() {

            scanner = null;

        });

}


// ==========================================
// حماية HTML
// ==========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// حماية JavaScript
// ==========================================

function escapeJS(value) {

    return String(value || "")

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"');

}
