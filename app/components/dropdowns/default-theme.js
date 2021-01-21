export default {
  dark: {
    container: 'text-white bg-gray-800 border rounded-3xl',
    open: 'border-2 border-primary-400 bg-gray-800 text-white text-base rounded-2xl',
    closed: 'border-gray-400 text-gray-400',
    icon: {
      closed: 'text-white',
      open: 'text-primary-500 transform rotate-180',
      disabled: 'text-gray-400',
    },
    item: {
      base: 'text-gray-300',
      highlighted: 'bg-gray-700 text-white',
      disabled: 'opacity-50 pointer-events-none',
    },
  },
  light: {
    container: 'text-gray-600 bg-white border rounded-3xl',
    open: 'border-2 border-primary-400 bg-white text-gray-600 text-base rounded-2xl',
    closed: 'border-gray-400 text-gray-400',
    icon: {
      closed: 'text-gray-600',
      open: 'text-primary-500 transform rotate-180',
      disabled: 'text-gray-400',
    },
    item: {
      base: 'text-gray-400',
      highlighted: 'bg-gray-100 text-gray-800',
      disabled: 'opacity-50 pointer-events-none',
    },
  },
  states: {
    none: '',
    error: 'border-red-500',
    valid: 'border-green-500',
  },
};
