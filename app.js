// ======================================
// رابط Google Apps Script
// ======================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbxpciZPGC7wvRK-0hAYiZP1PETQh4m5hnWtgHGvCk56roAOtCPcGCR_pWhhek2iSfKB/exec";


// ======================================
// نموذج إضافة المريض
// ======================================

const patientForm =
    document.getElementById("patientForm");


const saveButton =
    document.getElementById("saveButton");


const message =
    document.getElementById("message");


patientForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();


        const phone =
            document.getElementById("phone").value.trim();


        const birthDate =
            document.getElementById("birthDate").value;


        const notes =
            document.getElementById("notes").value.trim();


        if (!name || !phone) {

            showMessage(
                "يرجى إدخال اسم المريض ورقم الهاتف",
                "error"
            );

            return;

        }


        saveButton.disabled = true;

        saveButton.textContent =
            "⏳ جارٍ الحفظ...";


        try {


            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "text/plain;charset=utf-8"

                        },

                        body: JSON.stringify({

                            sheet: "Patients",

                            name: name,

                            phone: phone,

                            birthDate: birthDate,

                            notes: notes

                        })

                    }
                );


            const result =
                await response.json();


            if (result.success) {


                showMessage(
                    "✅ تم حفظ المريض بنجاح",
                    "success"
                );


                patientForm.reset();


                document.getElementById(
                    "patientsCount"
                ).textContent = "تمت الإضافة";


            }

            else {

                showMessage(
                    "❌ حدث خطأ: " +
                    result.message,
                    "error"
                );

            }


        }

        catch (error) {

            console.error(error);


            showMessage(
                "❌ تعذر الاتصال بالخادم",
                "error"
            );

        }


        saveButton.disabled = false;

        saveButton.textContent =
            "💾 حفظ المريض";

    }
);


// ======================================
// رسالة الحالة
// ======================================

function showMessage(text, type) {

    message.textContent = text;


    if (type === "success") {

        message.style.color = "green";

    }

    else {

        message.style.color = "red";

    }

}
