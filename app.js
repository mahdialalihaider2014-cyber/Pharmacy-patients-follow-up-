const API_URL =
"https://script.google.com/macros/s/AKfycbxpciZPGC7wvRK-0hAYiZP1PETQh4m5hnWtgHGvCk56roAOtCPcGCR_pWhhek2iSfKB/exec";


let allPatients = [];


/* =====================================
   عند فتح الصفحة
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    loadPatients();

    const search =
        document.getElementById("searchInput");

    if (search) {

        search.addEventListener(
            "input",
            searchPatients
        );

    }

});


/* =====================================
   تحميل المرضى
===================================== */

async function loadPatients() {

    try {

        const response = await fetch(
            API_URL + "?action=patients"
        );

        const data = await response.json();

        console.log("Patients:", data);

        if (Array.isArray(data)) {

            allPatients = data;

        } else {

            allPatients = [];

        }

        displayPatients(allPatients);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "patientsList"
        ).innerHTML = `

            <div class="no-result">

                ❌ تعذر تحميل بيانات المرضى.

            </div>

        `;

    }

}


/* =====================================
   إضافة مريض
===================================== */

async function addPatient() {

    const name =
        document.getElementById(
            "patientName"
        ).value.trim();


    const phone =
        document.getElementById(
            "patientPhone"
        ).value.trim();


    const birthDate =
        document.getElementById(
            "patientBirthDate"
        )?.value || "";


    const notes =
        document.getElementById(
            "patientNotes"
        )?.value.trim() || "";


    if (!name) {

        alert("يرجى إدخال اسم المريض.");

        return;

    }


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


        const response =
            await fetch(url);


        const data =
            await response.json();


        console.log(
            "إضافة المريض:",
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


        document.getElementById(
            "patientName"
        ).value = "";


        document.getElementById(
            "patientPhone"
        ).value = "";


        if (
            document.getElementById(
                "patientBirthDate"
            )
        ) {

            document.getElementById(
                "patientBirthDate"
            ).value = "";

        }


        if (
            document.getElementById(
                "patientNotes"
            )
        ) {

            document.getElementById(
                "patientNotes"
            ).value = "";

        }


        loadPatients();


    } catch (error) {

        console.error(error);

        alert(
            "❌ تعذر الاتصال بقاعدة بيانات المرضى."
        );

    }

}


/* =====================================
   البحث بالاسم أو الهاتف أو الباركود
===================================== */

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


    if (!value) {

        displayPatients(
            allPatients
        );

        return;

    }


    const results =
        allPatients.filter(
            function(patient) {

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


/* =====================================
   عرض المرضى
===================================== */

function displayPatients(patients) {

    const container =
        document.getElementById(
            "patientsList"
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
            function(patient) {

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
                                ▣
                                ${escapeHTML(
                                    patient.ID
                                )}
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


/* =====================================
   فتح ملف المريض
===================================== */

function openPatient(id) {

    if (!id) {

        return;

    }


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


/* =====================================
   ماسح الباركود
===================================== */

let scanner = null;


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


    scanner =
        new Html5Qrcode("reader");


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

        function(errorMessage) {

            // تجاهل أخطاء القراءة المؤقتة

        }

    ).catch(
        function(error) {

            console.error(error);

            alert(
                "تعذر تشغيل الكاميرا. اسمح للموقع باستخدام الكاميرا."
            );

        }
    );

}


/* =====================================
   إيقاف الباركود
===================================== */

function stopBarcodeScanner() {

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


/* =====================================
   حماية HTML
===================================== */

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================
   حماية ID
===================================== */

function escapeJS(value) {

    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}
