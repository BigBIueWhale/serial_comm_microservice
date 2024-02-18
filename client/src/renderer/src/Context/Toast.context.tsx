import { createContext } from "react";
import { toast, ToastPosition, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { multilineHtmlSupport } from "../utils/MultilineHtmlSupport";

export enum ToastNotifyMode {
  SUCCESS = "success",
  ERROR = "error",
}

export const ToastContext = createContext({
  notify: (toastId: string, message: string, mode: ToastNotifyMode): void => {
    throw new Error("ToastContext was not initialized");
  },
});

function toastConfiguration(toastId: string): ToastOptions<{}> {
  return {
    position: "top-center" as ToastPosition,
    autoClose: 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    toastId: toastId,
    style: {
      maxHeight: '512px',
      overflow: 'auto', // Enable scroll on overflow
    },
  };
}

function displayToast(toastId: string, message: string, mode: ToastNotifyMode) {
  const config = toastConfiguration(toastId);
  if (mode === ToastNotifyMode.SUCCESS) {
    toast.success(multilineHtmlSupport(message), config);
  } else if (mode === ToastNotifyMode.ERROR) {
    toast.error(multilineHtmlSupport(message), config);
  } else {
    throw new Error(`Toast mode ${mode} was not found`);
  }
}

type ToastProviderProps = {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <ToastContext.Provider
      value={{
        notify: (toastId: string, message: string, mode: ToastNotifyMode) => {
          displayToast(toastId, message, mode);
        },
      }}
    >
      <ToastContainer />
      {children}
    </ToastContext.Provider>
  );
}
