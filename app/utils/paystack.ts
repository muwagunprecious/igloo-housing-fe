export const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined') return resolve(false);
        if ((window as any).PaystackPop) return resolve(true);

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
