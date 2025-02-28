
import * as React from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

type ToastActionElement = React.ReactElement<any, string | React.JSXElementConstructor<any>>;

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

export type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const listeners: Array<(toast: Toast) => void> = [];

let memoryState: Toast[] = [];

function dispatch(toast: Toast) {
  memoryState = [...memoryState, toast].slice(-TOAST_LIMIT);
  listeners.forEach((listener) => {
    listener(toast);
  });

  return toast;
}

function remove(toastId: string) {
  memoryState = memoryState.filter((t) => t.id !== toastId);
  
  listeners.forEach((listener) => {
    listener({ id: toastId, title: "" });
  });
  
  return toastId;
}

function update(toastId: string, toast: Toast) {
  memoryState = memoryState.map((t) => (t.id === toastId ? { ...t, ...toast } : t));
  
  listeners.forEach((listener) => {
    listener({ id: toastId, ...toast } as Toast);
  });
}

function subscribe(onToast: (toast: Toast) => void) {
  listeners.push(onToast);
  
  return () => {
    const index = listeners.indexOf(onToast);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function getToasts() {
  return memoryState;
}

export const toast = (props: ToastOptions) => {
  const id = genId();

  const update = (props: ToastOptions) =>
    updateToast({ ...props, id });
  
  const dismiss = () => removeToast(id);

  const newToast = {
    ...props,
    id,
    dismiss,
    update,
  } as Toast;
  
  dispatch(newToast);
  
  return {
    id,
    dismiss,
    update,
  };
};

function updateToast(toast: Toast) {
  if (toastTimeouts.has(toast.id)) {
    clearTimeout(toastTimeouts.get(toast.id));
    toastTimeouts.delete(toast.id);
  }
  
  update(toast.id, toast);
  
  return toast;
}

function removeToast(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
    toastTimeouts.delete(toastId);
  }
  
  remove(toastId);
  
  return toastId;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryState);
  
  React.useEffect(() => {
    const unsubscribe = subscribe((toast) => {
      if (toast.id) {
        setToasts((prevToasts) =>
          prevToasts
            .filter(
              (t) => (t.id === toast.id ? false : true)
            )
            .concat(toast)
        );
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return {
    toasts,
    toast,
    dismiss: removeToast,
  };
}
