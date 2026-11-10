window.alert = function(mensagem) {
    Toastify({
        text: mensagem,
        duration: 4000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "#f97316",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            fontWeight: "bold"
        }
    }).showToast();
};

window.showConfirm = function(mensagem) {
    return Swal.fire({
        title: 'Atencao',
        text: mensagem,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#475569',
        confirmButtonText: 'Sim, continuar',
        cancelButtonText: 'Cancelar',
        background: '#0f172a',
        color: '#fff'
    }).then(function(result) {
        return result.isConfirmed;
    });
};