// ========================================
// رابط Google Apps Script الجديد
// ========================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzkvBi5jiox12ObEG8RKoWgJM3hJrp1djQQpeopzKkrTmPAZvqdZUoUzT82etTZ11UG/exec";


// ========================================
// متغيرات عامة
// ========================================

let allPatients = [];
let scanner = null;


// ========================================
// عند فتح الصفحة
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    loadPatients();

});


// ========================================
// تحميل جميع المرضى
// ========================================

async function loadPatients() {

    const resultsBox = document.getElementById("searchResults");

    if (!resultsBox) {
        console.error("لم يتم العثور على searchResults");
        return;
    }

    resultsBox.innerHTML = `
        <div class="no-result">
            ⏳ جاري تحميل المرضى...
        </div>
    `;

    try {

        const response = await fetch(
            API_URL + "?action=patients&t=" + Date.now()
        );

        const data = await response.json();

        console.log("بيانات المرضى:", data);

        if (Array.isArray(data)) {

            allPatients = data;

            displayPatients(allPatients);

        } else {

            allPatients = [];

            resultsBox.innerHTML = `
                <div class="no-result">
                    ❌ لم يتم العثور على بيانات المرضى
                </div>
            `;

        }

    } catch (error) {

        console.error("خطأ تحميل المرضى:", error);

        resultsBox.innerHTML = `
            <div class="no-result">
                ❌ تعذر الاتصال بقاعدة بيانات المرضى
            </div>
        `;

    }

}


// ========================================
// إضافة مريض جديد
// ========================================

async function addPatient() {

    const nameElement =
        document.getElementById("patientName");

    const phoneElement =
        document.getElementById("patientPhone");

    const birthDateElement =
        document.getElementById("patientBirthDate");

    const notesElement =
        document.getElementById("patientNotes");


    const name =
        nameElement ? nameElement.value.trim() : "";

    const phone =
        phoneElement ? phoneElement.value.trim() : "";

    const birthDate =
        birthDateElement ? birthDateElement.value : "";

    const notes =
        notesElement ? notesElement.value.trim() : "";


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


        console.log("إرسال:", url);


        const response =
            await fetch(url);


        const data =
            await response.json();


        console.log("نتيجة الإضافة:", data);


        if (!data.success) {

            alert(
                "❌ لم تتم إضافة المريض\n" +
                (data.message || "")
            );

            return;

        }


        alert("✅ تمت إضافة المريض بنجاح");


        // تنظيف الحقول

        if (nameElement)
            nameElement.value = "";

        if (phoneElement)
            phoneElement.value = "";

        if (birthDateElement)
            birthDateElement.value = "";

        if (notesElement)
            notesElement.value = "";


        // إعادة تحميل المرضى

        await loadPatients();


    } catch (error) {

        console.error("خطأ إضافة المريض:", error);

        alert(
            "❌ حدث خطأ أثناء الاتصال بقاعدة البيانات"
        );

    }

}


// ========================================
// البحث عن مريض
// ========================================

function searchPatients() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;


    const value =
        input.value.trim().toLowerCase();


    if (!value) {

        displayPatients(allPatients);

        return;

    }


    const results =
        allPatients.filter(function (patient) {

            const id =
                String(patient.ID || "")
                .toLowerCase();

            const name =
                String(patient.Name || "")
                .toLowerCase();

            const phone =
                String(patient.Phone || "")
                .toLowerCase();


            return (
                id.includes(value) ||
                name.includes(value) ||
                phone.includes(value)
            );

        });


    displayPatients(results);

}


// ========================================
// عرض المرضى
// ========================================

function displayPatients(patients) {

    const container =
        document.getElementById("searchResults");


    if (!container) {

        console.error(
            "لم يتم العثور على searchResults"
        );

        return;

    }


    if (!patients || patients.length === 0) {

        container.innerHTML = `
            <div class="no-result">
                🔍 لا يوجد مريض مطابق للبحث
            </div>
        `;

        return;

    }


    container.innerHTML =
        patients.map(function (patient) {

            const id =
                String(patient.ID || "");

            const name =
                String(patient.Name || "");

            const phone =
                String(patient.Phone || "");

            const birthDate =
                String(patient.BirthDate || "");

            const notes =
                String(patient.Notes || "");


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


// ========================================
// فتح ملف المريض
// ========================================

function openPatient(id) {

    if (!id) {

        alert("رقم المريض غير موجود");

        return;

    }


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


// ========================================
// عرض باركود المريض
// ========================================

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
            "المريض: " + name +
            " | الرقم: " + id;

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


// ========================================
// طباعة الباركود
// ========================================

function printBarcode() {

    const barcode =
        document.getElementById("barcode");


    const title =
        document.getElementById("barcodePatientName");


    if (!barcode) {

        alert("لا يوجد باركود للطباعة");

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

                h2 {

                    margin-bottom: 30px;

                }

                svg {

                    max-width: 90%;

                }

            </style>

        </head>


        <body>

            <h2>
                ${title ? escapeHTML(title.textContent) : ""}
            </h2>

            ${barcode.outerHTML}

            <script>

                window.onload = function () {

                    window.print();

                };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


// ========================================
// تشغيل قارئ الباركود
// ========================================

function startScanner() {

    const reader =
        document.getElementById("reader");


    if (!reader) {

        alert("لم يتم العثور على مكان الكاميرا");

        return;

    }


    if (typeof Html5Qrcode === "undefined") {

        alert(
            "مكتبة قارئ الباركود لم يتم تحميلها"
        );

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


        function (decodedText) {

            console.log(
                "تم قراءة الباركود:",
                decodedText
            );


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


        function (errorMessage) {

            // تجاهل أخطاء القراءة المستمرة

        }

    ).catch(function (error) {

        console.error(error);

        scanner = null;

        alert(
            "❌ تعذر تشغيل الكاميرا\n\n" +
            "تأكد من السماح للموقع باستخدام الكاميرا"
        );

    });

}


// ========================================
// إيقاف قارئ الباركود
// ========================================

function stopScanner() {

    if (!scanner) {

        return;

    }


    scanner.stop()

        .then(function () {

            scanner.clear();

            scanner = null;

        })

        .catch(function (error) {

            console.error(error);

            scanner = null;

        });

}


// ========================================
// حماية النصوص
// ========================================

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ========================================
// حماية ID داخل onclick
// ========================================

function escapeJS(value) {

    return String(value || "")

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/"/g, '\\"');

}
