import Swal from "sweetalert2";

export const showError = (title, txt) => {
    if (Swal.isVisible()) {
        Swal.close(); // закрываем старое окно мгновенно
    }

    Swal.fire({
        title: title,
        text: txt,
        icon: "error",
        showClass: {
            popup: 'swal2-show-fast'
        },
        hideClass: {
            popup: 'swal2-hide-fast'
        },
        showCancelButton: false,
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: true,
        backdrop: true,
    })
};

export const showWarningQuestion = (title, txt, handler) => {
    if (Swal.isVisible()) {
        Swal.close();
    }

    Swal.fire({
        title: title,
        text: txt,
        icon: "warning",
        showClass: {
            popup: 'swal2-show-fast'
        },
        hideClass: {
            popup: 'swal2-hide-fast'
        },
        showCancelButton: true,
        confirmButtonText: 'Так',
        cancelButtonText: 'Ні',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: true,
        backdrop: true,
    }).then(result => handler(result)); // ← ВАЖНО
};


export const showQuestion = (title, txt, handler) => {
    if (Swal.isVisible()) {
        Swal.close();
    }

    Swal.fire({
        title: title,
        html: txt,
        icon: "warning",
        showClass: {
            popup: 'swal2-show-fast'
        },
        hideClass: {
            popup: 'swal2-hide-fast'
        },
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: true,
        backdrop: true,
        width: "80%"
    }).then(result => handler(result)); // ← ВАЖНО
};