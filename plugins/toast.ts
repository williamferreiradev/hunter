// plugins/toast.ts
import { defineNuxtPlugin } from '#app'
import Vue3Toastify, { toast, type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default defineNuxtPlugin((nuxtApp: any) => {
    nuxtApp.vueApp.use(Vue3Toastify, {
        autoClose: 3000,
        position: 'top-right',
        theme: 'dark',
    } as ToastContainerOptions);

    return {
        provide: {
            toast: (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
                // @ts-ignore
                return toast(msg, { type });
            }
        }
    }
});
