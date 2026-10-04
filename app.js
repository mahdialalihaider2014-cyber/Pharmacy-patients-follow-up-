/* =====================================================
   نظام متابعة مرضى الصيدلية
   app.js
===================================================== */


/* =====================================================
   رابط Google Apps Script الجديد
===================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbzkvBi5jiox12ObEG8RKoWgJM3hJrp1djQQpeopzKkrTmPAZvqdZUoUzT82etTZ11UG/exec";


/* =====================================================
   متغيرات عامة
===================================================== */

let allPatients = [];
let scanner = null;


/* =====================================================
   عند فتح الصفحة
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadPatients();

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            searchPatients
        );

    }

});


/* =====================================================
   جلب المرضى من Google Sheets
===================================================== */

async function loadPatients() {

    try {

        const url =
            API_URL +
            "?action=patients&_=" +
            Date.now();


        const response =
            await fetch(url, {
                method: "GET",
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "بيانات المرضى:",
            data
        );


        /*
         إذا كان Google Apps Script
         أرسل رسالة خطأ
        */

        if (
            data &&
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "خطأ في قاعدة البيانات"
            );

        }


        /*
         البيانات الصحيحة يجب أن تكون Array
        */

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
                "patientsList"
            );


        if (container) {

            container.innerHTML = `

                <div class="no-result">

                    ❌ تعذر الاتصال بقاعدة بيانات المرضى.

                    <br><br>

                    <small>
                    تأكد من إعداد Google Apps Script.
                    </small>

                </div>

            `;

        }

    }

}


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


    const birthDateElement =
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
        birthDateElement
            ? birthDateElement.value
            : "";


    const notes =
        notesElement
            ? notesElement.value.trim()
            : "";


    /* التحقق من الاسم */

    if (!name) {

        alert(
            "يرجى إدخال اسم المريض."
        );

        return;

    }


    /* التحقق من الهاتف */

    if (!phone) {

        alert(
            "يرجى إدخال رقم الهاتف."
        );

        return;

    }


    try {


        /*
         بناء رابط الإضافة
        */

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
            encodeURIComponent(notes) +

            "&_=" +
            Date.now();


        console.log(
            "رابط إضافة المريض:",
            url
        );


        const response =
            await fetch(url, {

                method: "GET",

                cache: "no-store"

            });


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "نتيجة إضافة المريض:",
            data
        );


        /* إذا فشل الإضافة */

        if (
            !data ||
            data.success !== true
        ) {

            alert(
                "❌ " +
                (
                    data.message ||
                    "لم تتم إضافة المريض."
                )
            );

            return;

        }


        /* نجاح */

        alert(
            "✅ تمت إضافة المريض بنجاح"
        );


        /* تنظيف الحقول */

        if (nameElement) {

            nameElement.value = "";

        }


        if (phoneElement) {

            phoneElement.value = "";

        }


        if (birthDateElement) {

            birthDateElement.value = "";

        }


        if (notesElement) {

            notesElement.value = "";

        }


        /* إعادة تحميل المرضى */

        await loadPatients();


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
   البحث عن المريض
   بالاسم أو الهاتف أو رقم المريض أو الباركود
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


    /* إذا كان البحث فارغًا */

    if (!value) {

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
            "patientsList"
        );


    if (!container) {

        return;

    }


    /* لا يوجد مرضى */

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
                    escapeHTML(
                        patient.ID
                    );


                const name =
                    escapeHTML(
                        patient.Name
                    );


                const phone =
                    escapeHTML(
                        patient.Phone
                    );


                return `

                    <div class="patient-result">

                        <div class="patient-info">

                            <strong>
                                👤 ${name}
                            </strong>

                            <p>
                                📱 ${phone}
                            </p>

                            <p>
                                ▣ ${id}
                            </p>

                        </div>


                        <button
                            class="primary-button"
                            onclick="openPatient('${escapeJS(patient.ID)}')"
                        >

                            📂 فتح الملف

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
   تشغيل قارئ الباركود
===================================================== */

function startBarcodeScanner() {


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
            "قارئ الباركود غير محمل."
        );

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


        function (decodedText) {


            const search =
                document.getElementById(
                    "searchInput"
                );


            if (search) {

                search.value =
                    decodedText;

            }


            searchPatients();


            stopBarcodeScanner();

        },


        function (errorMessage) {

            /*
             تجاهل أخطاء البحث
             أثناء قراءة الكاميرا
            */

        }

    ).catch(
        function (error) {


            console.error(
                "Barcode error:",
                error
            );


            alert(
                "❌ تعذر تشغيل الكاميرا.\n\n" +
                "تأكد من السماح للموقع باستخدام الكاميرا."
            );

        }
    );

}


/* =====================================================
   إيقاف قارئ الباركود
===================================================== */

function stopBarcodeScanner() {


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
   حماية HTML
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
   حماية JavaScript
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
