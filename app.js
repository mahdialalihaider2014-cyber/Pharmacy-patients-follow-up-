// =====================================================
// إعداد رابط Google Apps Script
// =====================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzkvBi5jiox12ObEG8RKoWgJM3hJrp1djQQpeopzKkrTmPAZvqdZUoUzT82etTZ11UG/exec";


// =====================================================
// متغيرات البرنامج
// =====================================================

let allPatients = [];
let scanner = null;


// =====================================================
// عند فتح الصفحة
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("بدأ تشغيل نظام متابعة المرضى");

    loadPatients();

});


// =====================================================
// تحميل جميع المرضى
// =====================================================

async function loadPatients() {

    const results = document.getElementById("searchResults");

    if (results) {

        results.innerHTML = `
            <div class="no-result">
                جاري تحميل بيانات المرضى...
            </div>
        `;

    }

    try {

        const response = await fetch(
            API_URL + "?action=patients&v=" + Date.now()
        );

        if (!response.ok) {

            throw new Error(
                "HTTP Error: " + response.status
            );

        }

        const data = await response.json();

        console.log("البيانات القادمة من Google:");
        console.log(data);


        // التأكد من أن البيانات مصفوفة

        if (Array.isArray(data)) {

            allPatients = data;

        } else {

            allPatients = [];

            console.error(
                "البيانات ليست مصفوفة:",
                data
            );

        }


        // عرض جميع المرضى

        displayPatients(allPatients);


    } catch (error) {

        console.error(
            "خطأ في تحميل المرضى:",
            error
        );


        if (results) {

            results.innerHTML = `
                <div class="no-result">

                    ❌ تعذر تحميل بيانات المرضى

                    <br><br>

                    تأكد من اتصال البرنامج بقاعدة البيانات.

                </div>
            `;

        }

    }

}


// =====================================================
// إضافة مريض جديد
// =====================================================

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
        nameElement
            ? nameElement.value.trim()
            : "";

    const phone =
        phoneElement
            ? phoneElement.value.trim()
            : "";

    const birthDate =
        birthDateElement
            ? birthDateElement.value
            : "";

    const notes =
        notesElement
            ? notesElement.value.trim()
            : "";


    // التحقق من الاسم

    if (!name) {

        alert("يرجى إدخال اسم المريض.");

        return;

    }


    // التحقق من الهاتف

    if (!phone) {

        alert("يرجى إدخال رقم الهاتف.");

        return;

    }


    try {


        const url =
            API_URL +

            "?action=addPatient" +

            "&name=" +
            encodeURIComponent(name) +

            "&phone=" +
            encodeURIComponent(phone) +

            "&birthDate=" +
            encodeURIComponent(birthDate) +

            "&notes=" +
            encodeURIComponent(notes);


        console.log(
            "إرسال إضافة المريض:",
            url
        );


        const response =
            await fetch(url);


        const data =
            await response.json();


        console.log(
            "نتيجة إضافة المريض:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "لم تتم إضافة المريض."
            );

            return;

        }


        alert(
            "✅ تمت إضافة المريض بنجاح"
        );


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


        // البحث عن المريض الجديد

        const searchInput =
            document.getElementById("searchInput");


        if (searchInput) {

            searchInput.value = name;

            searchPatients();

        }


    } catch (error) {

        console.error(
            "خطأ في إضافة المريض:",
            error
        );


        alert(
            "❌ تعذر الاتصال بقاعدة بيانات المرضى."
        );

    }

}


// =====================================================
// البحث عن مريض
// =====================================================

function searchPatients() {


    const input =
        document.getElementById("searchInput");


    if (!input) {

        console.error(
            "لم يتم العثور على searchInput"
        );

        return;

    }


    const value =
        input.value
            .trim()
            .toLowerCase();


    console.log(
        "البحث عن:",
        value
    );


    // إذا كان مربع البحث فارغًا
    // عرض جميع المرضى

    if (!value) {

        displayPatients(allPatients);

        return;

    }


    const results =
        allPatients.filter(function (patient) {


            const id =
                String(
                    patient.ID || ""
                ).toLowerCase();


            const name =
                String(
                    patient.Name || ""
                ).toLowerCase();


            const phone =
                String(
                    patient.Phone || ""
                ).toLowerCase();


            return (

                id.includes(value) ||

                name.includes(value) ||

                phone.includes(value)

            );

        });


    console.log(
        "نتائج البحث:",
        results
    );


    displayPatients(results);

}


// =====================================================
// عرض المرضى
// =====================================================

function displayPatients(patients) {


    // مهم جدًا:
    // HTML عندك يستخدم searchResults

    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) {

        console.error(
            "لم يتم العثور على searchResults"
        );

        return;

    }


    // لا توجد نتائج

    if (
        !patients ||
        patients.length === 0
    ) {

        container.innerHTML = `

            <div class="no-result">

                🔍 لا يوجد مريض مطابق للبحث.

            </div>

        `;

        return;

    }


    // إنشاء قائمة المرضى

    container.innerHTML = patients
        .map(function (patient) {


            const id =
                patient.ID || "";


            const name =
                patient.Name || "بدون اسم";


            const phone =
                patient.Phone || "بدون رقم";


            return `

                <div class="patient-result">

                    <div class="patient-info">

                        <strong>
                            👤 ${escapeHTML(name)}
                        </strong>

                        <p>
                            📱 ${escapeHTML(phone)}
                        </p>

                        <p>
                            ▣ رقم الملف:
                            ${escapeHTML(id)}
                        </p>

                    </div>


                    <button
                        class="primary-button"
                        onclick="openPatient('${escapeJS(id)}')"
                    >

                        📂 فتح ملف المريض

                    </button>

                </div>

            `;

        })
        .join("");


}


// =====================================================
// فتح ملف المريض
// =====================================================

function openPatient(id) {


    if (!id) {

        alert(
            "رقم المريض غير موجود."
        );

        return;

    }


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


// =====================================================
// تشغيل قارئ الباركود
// =====================================================

function startScanner() {


    const reader =
        document.getElementById(
            "reader"
        );


    if (!reader) {

        alert(
            "لم يتم العثور على مكان الكاميرا."
        );

        return;

    }


    // التأكد من وجود مكتبة قارئ الباركود

    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        alert(
            "مكتبة قارئ الباركود لم يتم تحميلها."
        );

        return;

    }


    // إذا كان الماسح يعمل بالفعل

    if (scanner) {

        return;

    }


    scanner =
        new Html5Qrcode(
            "reader"
        );


    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 120
            }

        },


        function(decodedText) {


            console.log(
                "تم قراءة الباركود:",
                decodedText
            );


            const searchInput =
                document.getElementById(
                    "searchInput"
                );


            if (searchInput) {

                searchInput.value =
                    decodedText;

            }


            searchPatients();


            stopScanner();


        },


        function(errorMessage) {

            // أخطاء القراءة العادية
            // لا نعرضها للمستخدم

        }

    )

    .catch(function(error) {


        console.error(
            "خطأ تشغيل الكاميرا:",
            error
        );


        scanner = null;


        alert(
            "❌ تعذر تشغيل الكاميرا.\n\n" +
            "تأكد من السماح للموقع باستخدام الكاميرا."
        );


    });

}


// =====================================================
// إيقاف قارئ الباركود
// =====================================================

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


            console.error(
                "خطأ إيقاف الكاميرا:",
                error
            );


            scanner = null;

        });

}


// =====================================================
// إنشاء باركود للمريض
// =====================================================

function showBarcode(
    patientId,
    patientName
) {


    const section =
        document.getElementById(
            "barcodeSection"
        );


    const nameElement =
        document.getElementById(
            "barcodePatientName"
        );


    const barcode =
        document.getElementById(
            "barcode"
        );


    if (
        !section ||
        !barcode
    ) {

        return;

    }


    section.style.display =
        "block";


    if (nameElement) {

        nameElement.textContent =
            patientName || "";

    }


    if (
        typeof JsBarcode !==
        "undefined"
    ) {


        JsBarcode(
            barcode,
            String(patientId),
            {
                format: "CODE128",

                displayValue: true,

                fontSize: 18,

                margin: 10
            }
        );


    }

}


// =====================================================
// طباعة الباركود
// =====================================================

function printBarcode() {


    const section =
        document.getElementById(
            "barcodeSection"
        );


    if (!section) {

        return;

    }


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "يرجى السماح بفتح نافذة الطباعة."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="ar" dir="rtl">

        <head>

            <meta charset="UTF-8">

            <title>
                باركود المريض
            </title>

            <style>

                body {

                    text-align: center;

                    font-family: Arial;

                    padding: 40px;

                }

                h2 {

                    margin-bottom: 30px;

                }

            </style>

        </head>

        <body>

            ${section.innerHTML}

        </body>

        </html>

    `);


    printWindow.document.close();


    setTimeout(function () {

        printWindow.print();

    }, 500);

}


// =====================================================
// حماية عرض النصوص
// =====================================================

function escapeHTML(value) {


    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// حماية النص داخل onclick
// =====================================================

function escapeJS(value) {


    return String(value || "")

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}
