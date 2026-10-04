/* ========================================
   رابط Google Apps Script
======================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbxpciZPGC7wvRK-0hAYiZP1PETQh4m5hnWtgHGvCk56roAOtCPcGCR_pWhhek2iSfKB/exec";


/* ========================================
   متغيرات
======================================== */

let patients = [];

let scanner = null;

let currentPatient = null;


/* ========================================
   عند فتح الموقع
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPatients();

    }
);


/* ========================================
   تحميل المرضى
======================================== */

async function loadPatients() {

    try {

        const response =
            await fetch(
                API_URL +
                "?action=patients"
            );


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            console.error(data);

            alert(
                data.message ||
                "تعذر تحميل بيانات المرضى"
            );

            return;
        }


        patients = data;


        console.log(
            "تم تحميل المرضى:",
            patients
        );


    } catch (error) {

        console.error(error);

        alert(
            "تعذر الاتصال بقاعدة بيانات المرضى"
        );

    }

}


/* ========================================
   إضافة مريض
======================================== */

async function addPatient() {


    const name =
        document
            .getElementById(
                "patientName"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "patientPhone"
            )
            .value
            .trim();


    const birthDate =
        document
            .getElementById(
                "patientBirthDate"
            )
            .value;


    const notes =
        document
            .getElementById(
                "patientNotes"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "يرجى إدخال اسم المريض"
        );

        return;

    }


    try {


        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    body: JSON.stringify({

                        action:
                            "addPatient",

                        name:
                            name,

                        phone:
                            phone,

                        birthDate:
                            birthDate,

                        notes:
                            notes

                    })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "حدث خطأ"
            );

            return;

        }


        alert(
            "تمت إضافة المريض بنجاح\n\n" +
            "رقم المريض: " +
            data.patient.ID
        );


        /*
        تنظيف الحقول
        */

        document
            .getElementById(
                "patientName"
            )
            .value = "";


        document
            .getElementById(
                "patientPhone"
            )
            .value = "";


        document
            .getElementById(
                "patientBirthDate"
            )
            .value = "";


        document
            .getElementById(
                "patientNotes"
            )
            .value = "";


        /*
        تحديث قائمة المرضى
        */

        await loadPatients();


        /*
        عرض باركود المريض
        */

        showBarcode(
            data.patient.ID
        );


    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء إضافة المريض"
        );

    }

}


/* ========================================
   البحث
======================================== */

function searchPatients() {


    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .trim()
            .toLowerCase();


    const results =
        document
            .getElementById(
                "searchResults"
            );


    /*
    إذا كان البحث فارغاً
    */

    if (!search) {

        results.innerHTML = "";

        return;

    }


    /*
    البحث في:

    ID
    الاسم
    الهاتف
    */

    const filtered =
        patients.filter(
            function (patient) {


                const id =
                    String(
                        patient.ID || ""
                    )
                    .toLowerCase();


                const name =
                    String(
                        patient.Name || ""
                    )
                    .toLowerCase();


                const phone =
                    String(
                        patient.Phone || ""
                    )
                    .toLowerCase();


                return (

                    id.includes(search)

                    ||

                    name.includes(search)

                    ||

                    phone.includes(search)

                );

            }
        );


    /*
    لا توجد نتائج
    */

    if (
        filtered.length === 0
    ) {

        results.innerHTML = `

            <div class="no-result">

                ❌ لم يتم العثور على المريض

            </div>

        `;

        return;

    }


    /*
    عرض النتائج
    */

    results.innerHTML =
        filtered.map(
            function (patient) {


                return `

                    <div class="patient-result">


                        <div class="patient-info">

                            <strong>

                                👤
                                ${escapeHTML(
                                    patient.Name
                                )}

                            </strong>


                            <p>

                                📱
                                ${escapeHTML(
                                    patient.Phone ||
                                    "لا يوجد"
                                )}

                            </p>


                            <p>

                                🆔
                                ${escapeHTML(
                                    patient.ID
                                )}

                            </p>

                        </div>


                        <div class="patient-buttons">


                            <button
                                class="open-button"
                                onclick="openPatient('${escapeJS(
                                    patient.ID
                                )}')"
                            >

                                📂 فتح الملف

                            </button>


                            <button
                                class="barcode-button"
                                onclick="showBarcode('${escapeJS(
                                    patient.ID
                                )}')"
                            >

                                ▣ الباركود

                            </button>


                        </div>


                    </div>

                `;

            }
        )
        .join("");

}


/* ========================================
   فتح ملف المريض
======================================== */

function openPatient(id) {


    /*
    حالياً نرسل رقم المريض إلى patient.html

    سننشئ patient.html في الخطوة التالية.
    */

    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


/* ========================================
   إظهار الباركود
======================================== */

function showBarcode(id) {


    const patient =
        patients.find(
            function (p) {

                return String(
                    p.ID
                ) === String(id);

            }
        );


    if (!patient) {

        alert(
            "لم يتم العثور على المريض"
        );

        return;

    }


    currentPatient =
        patient;


    document
        .getElementById(
            "barcodeSection"
        )
        .style.display =
        "block";


    document
        .getElementById(
            "barcodePatientName"
        )
        .textContent =
        "المريض: " +
        patient.Name;


    /*
    إنشاء الباركود
    */

    JsBarcode(
        "#barcode",

        String(
            patient.ID
        ),

        {

            format:
                "CODE128",

            width:
                2,

            height:
                80,

            displayValue:
                true,

            fontSize:
                18,

            margin:
                10

        }
    );


    /*
    الانتقال إلى الباركود
    */

    document
        .getElementById(
            "barcodeSection"
        )
        .scrollIntoView({
            behavior:
                "smooth"
        });

}


/* ========================================
   طباعة الباركود
======================================== */

function printBarcode() {


    if (!currentPatient) {

        alert(
            "اختر مريضاً أولاً"
        );

        return;

    }


    const barcode =
        document
            .getElementById(
                "barcode"
            )
            .outerHTML;


    const name =
        escapeHTML(
            currentPatient.Name
        );


    const id =
        escapeHTML(
            currentPatient.ID
        );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html
            lang="ar"
            dir="rtl"
        >

        <head>

            <meta charset="UTF-8">

            <title>
                باركود المريض
            </title>

            <style>

                body {

                    text-align: center;

                    font-family: Arial;

                    padding: 30px;

                }

                svg {

                    max-width: 350px;

                }

            </style>

        </head>


        <body>

            <h2>
                ${name}
            </h2>

            <p>
                رقم المريض:
                ${id}
            </p>

            ${barcode}


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


/* ========================================
   تشغيل الكاميرا
======================================== */

function startScanner() {


    const reader =
        document.getElementById(
            "reader"
        );


    reader.innerHTML = "";


    /*
    إنشاء قارئ جديد
    */

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

            fps:
                10,

            qrbox: {

                width:
                    280,

                height:
                    120

            }

        },


        function (decodedText) {


            /*
            وضع رقم الباركود
            داخل مربع البحث
            */

            document
                .getElementById(
                    "searchInput"
                )
                .value =
                decodedText;


            /*
            البحث مباشرة
            */

            searchPatients();


            /*
            إيقاف الكاميرا
            */

            stopScanner();


        },


        function (errorMessage) {

            /*
            لا نفعل شيئاً
            أثناء البحث عن الباركود
            */

        }

    )
    .catch(
        function (error) {

            console.error(error);


            alert(
                "تعذر تشغيل الكاميرا.\n\n" +
                "تأكد من السماح للموقع باستخدام الكاميرا."
            );

        }
    );

}


/* ========================================
   إيقاف الكاميرا
======================================== */

function stopScanner() {


    if (!scanner) {

        return;

    }


    scanner.stop()

        .then(
            function () {

                scanner.clear();

                scanner = null;

            }
        )

        .catch(
            function (error) {

                console.log(
                    error
                );

            }
        );

}


/* ========================================
   حماية HTML
======================================== */

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


/* ========================================
   حماية ID داخل JavaScript
======================================== */

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
