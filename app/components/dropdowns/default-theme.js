export default {
  dark: {
    container: 'text-white bg-gray-800 border-2 rounded-3xl py-1.5',
    open: 'border-2 border-primary-400 text-base',
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
    container: 'text-gray-600 bg-white border-2 rounded-3xl py-1.5',
    open: 'border-2 border-primary-400 text-base',
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
