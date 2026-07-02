import Swal, { type SweetAlertIcon } from "sweetalert2";

interface AlertOptions {
  icon: SweetAlertIcon;
  title: string;
  timer?: number;
}

export const AppAlert = ({ icon, title, timer = 2500 }: AlertOptions) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    width: 350,
    padding: "0.5rem",
    customClass: {
      popup: "app-alert-popup",
    },
    icon,
    title,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};
