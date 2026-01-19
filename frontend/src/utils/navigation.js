// Navigation utility to allow navigation from API layer
let navigateInstance = null;

export const setNavigate = (navigate) => {
  navigateInstance = navigate;
};

export const navigateTo = (path) => {
  if (navigateInstance) {
    navigateInstance(path);
  } else {
    console.warn('Navigate instance not set. Make sure to call setNavigate in your App component.');
  }
};
