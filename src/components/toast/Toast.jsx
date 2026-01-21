import { Toast, ToastToggle } from "flowbite-react";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

export default function AppToast({ type = "success", message, onClose }) {
  const config = {
    success: {
      icon: <HiCheck className="h-5 w-5" />,
      bg: "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200",
    },
    error: {
      icon: <HiX className="h-5 w-5" />,
      bg: "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200",
    },
    warning: {
      icon: <HiExclamation className="h-5 w-5" />,
      bg: "bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200",
    },
  };

  const { icon, bg } = config[type];

  return (
    <Toast>
      <div
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
      >
        {icon}
      </div>

      <div className="ml-3 text-sm font-normal">{message}</div>

      <ToastToggle onDismiss={onClose} />
    </Toast>
  );
}
