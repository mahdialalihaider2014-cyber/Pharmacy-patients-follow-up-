const API_URL =
"https://script.google.com/macros/s/AKfycbzkvBi5jiox12ObEG8RKoWgJM3hJrp1djQQpeopzKkrTmPAZvqdZUoUzT82etTZ11UG/exec";


let allPatients = [];

let scanner = null;


// ==========================================
// عند فتح الموقع
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPatients();

    }
);


// ==========================================
// JSONP
// ==========================================

function jsonp(action, params = {}) {

    return new Promise(function(resolve, reject) {

        const callbackName =
            "callback_" +
            Date.now() +
            "_" +
            Math.floor(
                Math.random() * 100000
            );


        const script =
            document.createElement("script");


        let url =
            API_URL +
            "?action=" +
            encodeURIComponent(action);


        Object.keys(params).forEach(function(key) {

            url +=
                "&" +
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(
                    params[key] || ""
                );

        });


        url +=
            "&callback=" +
            callbackName;


        const timeout =
            setTimeout(function() {

                cleanup();

                reject(
                    new Error(
                        "انتهت مهلة الاتصال"
                    )
                );

            }, 15000);


        window[callbackName] =
            function(data) {

                clearTimeout(timeout);

                cleanup();

                resolve(data);

            };


        function cleanup() {

            delete window[callbackName];

            if (script.parentNode) {

                script.parentNode.removeChild(
                    script
                );

            }

        }


        script.onerror =
            function() {

                clearTimeout(timeout);

                cleanup();

                reject(
                    new Error(
                        "فشل الاتصال"
                    )
                );

            };


        script.src = url;


        document.body.appendChild(script);

    });

}


// ==========================================
// تحميل المرضى
// ==========================================

async function loadPatients() {

    const box =
        document.getElementById(
            "searchResults"
        );


    if (!box) return;


    box.innerHTML = `

        <div class="no-result">

            ⏳ جاري تحميل بيانات المرضى...

        </div>

    `;


    try {

        const data =
            await jsonp("patients");


        console.log(
            "بيانات المرضى:",
            data
        );


        if (
            Array.isArray(data)
        ) {

            allPatients = data;

            displayPatients(
                allPatients
            );

        } else {

            allPatients = [];

            box.innerHTML = `

                <div class="no-result">

                    ❌ لم يتم العثور على بيانات

                </div>

            `;

        }


    } catch (error) {

        console.error(error);


        box.innerHTML = `

            <div class="no-result">

                ❌ تعذر تحميل بيانات المرضى

                <br><br>

                حاول تحديث الصفحة

            </div>

        `;

    }

}


// ==========================================
// البحث
// ==========================================

function searchPatients() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    const value =
        normalizeText(
            input.value
        );


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
                    normalizeText(
                        patient.ID
                    );


                const name =
                    normalizeText(
                        patient.Name
                    );


                const phone =
                    normalizeText(
                        patient.Phone
                    );


                return (

                    id.includes(value) ||

                    name.includes(value) ||

                    phone.includes(value)

                );

            }
        );


    displayPatients(results);

}


// ==========================================
// توحيد الأرقام والنصوص
// ==========================================

function normalizeText(value) {

    return String(
        value || ""
    )

    .toLowerCase()

    .trim()

    .replace(
        /[٠-٩]/g,
        function(digit) {

            return String(
                "٠١٢٣٤٥٦٧٨٩"
                .indexOf(digit)
            );

        }
    )

    .replace(
        /\s+/g,
        ""
    );

}


// ==========================================
// عرض المرضى
// ==========================================

function displayPatients(
    patients
) {

    const box =
        document.getElementById(
            "searchResults"
        );


    if (!box) return;


    if (
        !patients ||
        patients.length === 0
    ) {

        box.innerHTML = `

            <div class="no-result">

                🔍 لا يوجد مريض مطابق للبحث

            </div>

        `;

        return;

    }


    box.innerHTML =
        patients.map(
            function(patient) {

                const id =
                    patient.ID || "";


                const name =
                    patient.Name || "";


                const phone =
                    patient.Phone || "";


                return `

                    <div class="patient-result">

                        <div class="patient-info">

                            <h3>
                                👤
                                ${escapeHTML(name)}
                            </h3>

                            <p>
                                📱
                                ${escapeHTML(phone)}
                            </p>

                            <p>
                                🆔
                                ${escapeHTML(id)}
                            </p>

                        </div>


                        <div>

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

            }
        ).join("");

}


// ==========================================
// إضافة مريض
// ==========================================

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
        ).value;


    const notes =
        document.getElementById(
            "patientNotes"
        ).value.trim();


    if (!name) {

        alert(
            "يرجى إدخال اسم المريض"
        );

        return;

    }


    if (!phone) {

        alert(
            "يرجى إدخال رقم الهاتف"
        );

        return;

    }


    try {

        const data =
            await jsonp(
                "addPatient",
                {
                    name: name,
                    phone: phone,
                    birthDate: birthDate,
                    notes: notes
                }
            );


        console.log(
            "نتيجة الإضافة:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "لم تتم إضافة المريض"
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


        document.getElementById(
            "patientBirthDate"
        ).value = "";


        document.getElementById(
            "patientNotes"
        ).value = "";


        await loadPatients();


    } catch (error) {

        console.error(error);


        alert(
            "❌ تعذر الاتصال بقاعدة البيانات"
        );

    }

}


// ==========================================
// فتح ملف المريض
// ==========================================

function openPatient(id) {

    if (!id) return;


    window.location.href =
        "patient.html?id=" +
        encodeURIComponent(id);

}


// ==========================================
// عرض الباركود
// ==========================================

function showBarcode(
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


    if (!section || !barcode) {

        alert(
            "قسم الباركود غير موجود"
        );

        return;

    }


    section.style.display =
        "block";


    if (title) {

        title.textContent =
            "المريض: " +
            name +
            " | الرقم: " +
            id;

    }


    if (
        typeof JsBarcode !==
        "undefined"
    ) {

        JsBarcode(
            "#barcode",
            id,
            {
                format: "CODE128",
                width: 2,
                height: 80,
                displayValue: true
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
        document.getElementById(
            "barcode"
        );


    if (!barcode) return;


    const win =
        window.open(
            "",
            "_blank"
        );


    win.document.write(`

        <html lang="ar" dir="rtl">

        <body
            style="
                text-align:center;
                font-family:Arial;
                padding:40px;
            "
        >

            ${barcode.outerHTML}

            <br><br>

            <button
                onclick="window.print()"
            >
                طباعة
            </button>

        </body>

        </html>

    `);


    win.document.close();

}


// ==========================================
// قارئ الباركود
// ==========================================

function startScanner() {

    const reader =
        document.getElementById(
            "reader"
        );


    if (!reader) {

        alert(
            "مكان الكاميرا غير موجود"
        );

        return;

    }


    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        alert(
            "قارئ الباركود غير محمل"
        );

        return;

    }


    if (scanner) return;


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

        function() {}

    ).catch(
        function(error) {

            console.error(error);

            scanner = null;

            alert(
                "❌ تعذر تشغيل الكاميرا"
            );

        }
    );

}


// ==========================================
// إيقاف الكاميرا
// ==========================================

function stopScanner() {

    if (!scanner) return;


    scanner.stop()
        .then(
            function() {

                scanner.clear();

                scanner = null;

            }
        )
        .catch(
            function() {

                scanner = null;

            }
        );

}


// ==========================================
// حماية HTML
// ==========================================

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


// ==========================================
// حماية JavaScript
// ==========================================

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
    )

    .replace(
        /"/g,
        '\\"'
    );

}
