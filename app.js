/* =====================================================
   نظام متابعة مرضى الصيدلية
   app.js
===================================================== */


/* =====================================================
   رابط Google Apps Script
===================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbxpciZPGC7wvRK-0hAYiZP1PETQh4m5hnWtgHGvCk56roAOtCPcGCR_pWhhek2iSfKB/exec";


/* =====================================================
   متغيرات عامة
===================================================== */

let allPatients = [];

let html5QrCode = null;


/* =====================================================
   عند فتح الصفحة
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPatients();

    }
);


/* =====================================================
   إضافة مريض جديد
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


    if (
        !nameElement ||
        !phoneElement
    ) {

        alert(
            "تعذر العثور على حقول المريض في الصفحة."
        );

        return;

    }


    const name =
        nameElement.value.trim();


    const phone =
        phoneElement.value.trim();


    const birthDate =
        birthElement
            ? birthElement.value
            : "";


    const notes =
        notesElement
            ? notesElement.value.trim()
            : "";


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


        const text =
            await response.text();


        console.log(
            "Google Apps Script:",
            text
        );


        let data;


        try {

            data =
                JSON.parse(text);

        } catch (error) {

            console.error(
                "استجابة غير صالحة:",
                text
            );

            alert(
                "تم الاتصال بالخادم لكن الاستجابة غير مفهومة."
            );

            return;

        }


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


        /*
        تنظيف الحقول
        */

        nameElement.value = "";

        phoneElement.value = "";


        if (birthElement) {

            birthElement.value = "";

        }


        if (notesElement) {

            notesElement.value = "";

        }


        /*
        تحديث قائمة المرضى
        */

        loadPatients();


    } catch (error) {

        console.error(
            "خطأ الاتصال:",
            error
        );


        alert(
            "❌ تعذر الاتصال بقاعدة بيانات المرضى.\n\nتأكد من نشر Google Apps Script كـ Web App."
        );

    }

}


/* =====================================================
   تحميل جميع المرضى
===================================================== */

async function loadPatients() {


    try {


        const response =
            await fetch(
                API_URL +
                "?action=patients"
            );


        const text =
            await response.text();


        console.log(
            "Patients:",
            text
        );


        const data =
            JSON.parse(text);


        /*
        إذا كان السيرفر يرجع
        success:false
        */

        if (
            data &&
            data.success === false
        ) {

            alert(
                data.message ||
                "تعذر تحميل المرضى."
            );

            return;

        }


        /*
        حفظ البيانات
        */

        if (
            Array.isArray(data)
        ) {

            allPatients = data;

        } else if (
            data &&
            Array.isArray(data.patients)
        ) {

            allPatients =
                data.patients;

        } else {

            allPatients = [];

        }


        displayPatients(
            allPatients
        );


    } catch (error) {

        console.error(
            "خطأ تحميل المرضى:",
            error
        );


        /*
        لا تظهر رسالة عند فتح الصفحة
        حتى لا تزعج المستخدم
        */

        const container =
            getPatientsContainer();


        if (container) {

            container.innerHTML = `

                <div class="no-result">

                    لا توجد بيانات للعرض.

                </div>

            `;

        }

    }

}


/* =====================================================
   البحث عن المريض
   الاسم + الهاتف + الباركود
===================================================== */

function searchPatients() {


    const input =
        getSearchInput();


    if (!input) {

        return;

    }


    const search =
        input.value
            .trim()
            .toLowerCase();


    if (!search) {

        displayPatients(
            allPatients
        );

        return;

    }


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

                    id.includes(search) ||

                    name.includes(search) ||

                    phone.includes(search)

                );

            }
        );


    displayPatients(
        results
    );

}


/* =====================================================
   عرض المرضى
===================================================== */

function displayPatients(
    patients
) {


    const container =
        getPatientsContainer();


    if (!container) {

        return;

    }


    if (
        !patients ||
        patients.length === 0
    ) {

        container.innerHTML = `

            <div class="no-result">

                🔍 لم يتم العثور على مريض.

            </div>

        `;

        return;

    }


    container.innerHTML =
        patients
            .map(
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
                                        patient.Phone
                                    )}

                                </p>


                                <p>

                                    ▣ رقم المريض:
                                    ${escapeHTML(
                                        patient.ID
                                    )}

                                </p>

                            </div>


                            <button
                                class="primary-button"
                                onclick="openPatient('${escapeAttribute(patient.ID)}')"
                            >

                                📂 فتح الملف

                            </button>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   فتح ملف المريض
===================================================== */

function openPatient(
    id
) {


    if (!id) {

        return;

    }


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


/* =====================================================
   تشغيل ماسح الباركود
===================================================== */

async function startBarcodeScanner() {


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


    try {


        if (!html5QrCode) {

            html5QrCode =
                new Html5Qrcode(
                    "reader"
                );

        }


        await html5QrCode.start(

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

            function (
                decodedText
            ) {


                /*
                إيقاف الكاميرا
                */

                stopBarcodeScanner();


                /*
                وضع رقم الباركود
                داخل مربع البحث
                */

                const input =
                    getSearchInput();


                if (input) {

                    input.value =
                        decodedText;

                }


                /*
                البحث مباشرة
                */

                searchPatients();

            },

            function (errorMessage) {

                /*
                تجاهل أخطاء القراءة
                المؤقتة
                */

            }

        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "تعذر تشغيل الكاميرا.\n\nتأكد من السماح للموقع باستخدام الكاميرا."
        );

    }

}


/* =====================================================
   إيقاف ماسح الباركود
===================================================== */

async function stopBarcodeScanner() {


    try {

        if (html5QrCode) {

            const state =
                html5QrCode.getState();


            if (
                state ===
                Html5QrcodeScannerState.SCANNING
            ) {

                await html5QrCode.stop();

            }

        }

    } catch (error) {

        console.log(
            error
        );

    }

}


/* =====================================================
   البحث عند الكتابة
===================================================== */

function setupSearch() {


    const input =
        getSearchInput();


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            searchPatients();

        }
    );

}


/* =====================================================
   العثور على مربع البحث
===================================================== */

function getSearchInput() {


    return (

        document.getElementById(
            "searchInput"
        ) ||

        document.getElementById(
            "search"
        ) ||

        document.getElementById(
            "patientSearch"
        )

    );

}


/* =====================================================
   العثور على قائمة المرضى
===================================================== */

function getPatientsContainer() {


    return (

        document.getElementById(
            "patientsList"
        ) ||

        document.getElementById(
            "searchResults"
        ) ||

        document.getElementById(
            "patients"
        )

    );

}


/* =====================================================
   حماية HTML
===================================================== */

function escapeHTML(
    value
) {


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
   حماية ID داخل onclick
===================================================== */

function escapeAttribute(
    value
) {


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


/* =====================================================
   تشغيل البحث بعد تحميل الصفحة
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupSearch();

    }
);
