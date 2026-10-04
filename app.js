/* =====================================================
   نظام متابعة مرضى الصيدلية
   app.js
===================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbzkvBi5jiox12ObEG8RKoWgJM3hJrp1djQQpeopzKkrTmPAZvqdZUoUzT82etTZ11UG/exec";


let allPatients = [];
let scanner = null;


/* =====================================================
   عند فتح الصفحة
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadPatients();

});


/* =====================================================
   جلب المرضى
===================================================== */

async function loadPatients() {

    try {

        const response = await fetch(
            API_URL + "?action=patients"
        );

        const data = await response.json();

        console.log("بيانات المرضى:", data);


        if (Array.isArray(data)) {

            allPatients = data;

        } else {

            allPatients = [];

        }


        displayPatients(allPatients);


    } catch (error) {

        console.error(
            "خطأ تحميل المرضى:",
            error
        );


        const container =
            document.getElementById(
                "searchResults"
            );


        if (container) {

            container.innerHTML = `
                <div class="no-result">
                    ❌ تعذر تحميل بيانات المرضى.
                    <br>
                    تأكد من اتصال الإنترنت.
                </div>
            `;

        }

    }

}


/* =====================================================
   إضافة مريض
===================================================== */

async function addPatient() {


    const nameElement =
        document.getElementById(
            "patientName"
        );


    const phoneElement =
        document.getElementById(
            "patientPhone"
        );


    const birthElement =
        document.getElementById(
            "patientBirthDate"
        );


    const notesElement =
        document.getElementById(
            "patientNotes"
        );


    const name =
        nameElement
            ? nameElement.value.trim()
            : "";


    const phone =
        phoneElement
            ? phoneElement.value.trim()
            : "";


    const birthDate =
        birthElement
            ? birthElement.value
            : "";


    const notes =
        notesElement
            ? notesElement.value.trim()
            : "";


    /* ---------------------------------------------
       التحقق من البيانات
    --------------------------------------------- */

    if (!name) {

        alert(
            "يرجى إدخال اسم المريض."
        );

        return;

    }


    if (!phone) {

        alert(
            "يرجى إدخال رقم الهاتف."
        );

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
            "رابط الإضافة:",
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
                "❌ " +
                (
                    data.message ||
                    "لم تتم إضافة المريض."
                )
            );

            return;

        }


        /* ---------------------------------------------
           نجاح الإضافة
        --------------------------------------------- */

        alert(
            "✅ تمت إضافة المريض بنجاح\n\n" +
            "رقم المريض: " +
            data.id
        );


        /* ---------------------------------------------
           مسح الحقول
        --------------------------------------------- */

        if (nameElement) {

            nameElement.value = "";

        }


        if (phoneElement) {

            phoneElement.value = "";

        }


        if (birthElement) {

            birthElement.value = "";

        }


        if (notesElement) {

            notesElement.value = "";

        }


        /* ---------------------------------------------
           إعادة تحميل المرضى
        --------------------------------------------- */

        await loadPatients();


        /* ---------------------------------------------
           البحث عن المريض الجديد
        --------------------------------------------- */

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (searchInput) {

            searchInput.value =
                data.id;

            searchPatients();

        }


    } catch (error) {

        console.error(
            "خطأ إضافة المريض:",
            error
        );


        alert(
            "❌ تعذر الاتصال بقاعدة بيانات المرضى."
        );

    }

}


/* =====================================================
   البحث عن مريض
===================================================== */

function searchPatients() {


    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {

        return;

    }


    const value =
        input.value
            .trim()
            .toLowerCase();


    /* ---------------------------------------------
       إذا كان البحث فارغًا
    --------------------------------------------- */

    if (!value) {

        displayPatients(
            allPatients
        );

        return;

    }


    /* ---------------------------------------------
       البحث بالاسم أو الهاتف أو ID
    --------------------------------------------- */

    const results =
        allPatients.filter(
            function (patient) {


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

            }
        );


    displayPatients(results);

}


/* =====================================================
   عرض المرضى
===================================================== */

function displayPatients(patients) {


    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) {

        return;

    }


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


    container.innerHTML =
        patients.map(
            function (patient) {


                const id =
                    String(
                        patient.ID || ""
                    );


                const name =
                    String(
                        patient.Name || ""
                    );


                const phone =
                    String(
                        patient.Phone || ""
                    );


                return `

                    <div class="patient-result">

                        <div class="patient-info">

                            <strong>
                                👤
                                ${escapeHTML(name)}
                            </strong>

                            <p>
                                📱
                                ${escapeHTML(phone)}
                            </p>

                            <p>
                                ▣
                                ${escapeHTML(id)}
                            </p>

                        </div>


                        <button
                            class="primary-button"
                            onclick="openPatient('${escapeJS(id)}')"
                        >

                            📂 فتح الملف

                        </button>


                        <button
                            class="scan-button"
                            onclick="showPatientBarcode('${escapeJS(id)}','${escapeJS(name)}')"
                        >

                            ▣ الباركود

                        </button>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   فتح ملف المريض
===================================================== */

function openPatient(id) {


    if (!id) {

        return;

    }


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


/* =====================================================
   إظهار باركود المريض
===================================================== */

function showPatientBarcode(
    id,
    name
) {


    const section =
        document.getElementById(
            "barcodeSection"
        );


    const title =
        document.getElementById(
            "barcodePatientName"
        );


    const barcode =
        document.getElementById(
            "barcode"
        );


    if (
        !section ||
        !title ||
        !barcode
    ) {

        return;

    }


    section.style.display =
        "block";


    title.textContent =
        name +
        " - " +
        id;


    if (
        typeof JsBarcode ===
        "undefined"
    ) {

        alert(
            "مكتبة الباركود لم يتم تحميلها."
        );

        return;

    }


    JsBarcode(
        barcode,
        id,
        {

            format: "CODE128",

            displayValue: true,

            fontSize: 18,

            height: 80,

            margin: 20

        }
    );


    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   طباعة الباركود
===================================================== */

function printBarcode() {


    const barcode =
        document.getElementById(
            "barcode"
        );


    const title =
        document.getElementById(
            "barcodePatientName"
        );


    if (!barcode) {

        return;

    }


    const barcodeHTML =
        barcode.outerHTML;


    const titleText =
        title
            ? title.textContent
            : "باركود المريض";


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

        <html
            lang="ar"
            dir="rtl"
        >

        <head>

            <meta charset="UTF-8">

            <title>
                ${escapeHTML(titleText)}
            </title>

            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    text-align:
                        center;

                    padding:
                        40px;

                }

                svg {

                    max-width:
                        100%;

                    height:
                        auto;

                }

                h2 {

                    margin-bottom:
                        30px;

                }

            </style>

        </head>

        <body>

            <h2>
                ${escapeHTML(titleText)}
            </h2>

            ${barcodeHTML}

            <script>

                window.onload =
                    function () {

                        window.print();

                    };

            <\/script>

        </body>

        </html>

    `);


    printWindow.document.close();

}


/* =====================================================
   تشغيل قارئ الباركود
===================================================== */

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


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        alert(
            "قارئ الباركود لم يتم تحميله."
        );

        return;

    }


    /* ---------------------------------------------
       منع تشغيل قارئين في نفس الوقت
    --------------------------------------------- */

    if (scanner) {

        return;

    }


    scanner =
        new Html5Qrcode(
            "reader"
        );


    scanner.start(

        {
            facingMode:
                "environment"
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
                "Barcode:",
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

            /* تجاهل أخطاء القراءة
               أثناء البحث عن الباركود */

        }

    ).catch(
        function(error) {

            console.error(
                "Camera error:",
                error
            );


            alert(
                "❌ تعذر تشغيل الكاميرا.\n\n" +
                "تأكد من السماح للموقع باستخدام الكاميرا."
            );


            scanner = null;

        }
    );

}


/* =====================================================
   إيقاف قارئ الباركود
===================================================== */

function stopScanner() {


    if (!scanner) {

        return;

    }


    scanner
        .stop()
        .then(
            function () {

                scanner.clear();

                scanner = null;

            }
        )
        .catch(
            function () {

                scanner = null;

            }
        );

}


/* =====================================================
   تنظيف النص قبل وضعه داخل HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )

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


/* =====================================================
   تنظيف النص قبل وضعه داخل onclick
===================================================== */

function escapeJS(value) {

    return String(
        value || ""
    )

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}
