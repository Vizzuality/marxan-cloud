export default {
  dark: {
    container: 'text-white bg-gray-800 ring-1 ring-gray-600 rounded-3xl',
    open: 'ring-2 ring-primary-400 bg-gray-800 text-white rounded-2xl',
    closed: 'border-gray-100 text-gray-100',
    prefix: {
      base: 'text-white',
    },
    icon: {
      closed: 'text-white',
      open: 'text-primary-500 transform rotate-180',
      disabled: 'text-gray-100',
    },
    item: {
      base: 'text-sm text-gray-400',
      highlighted: 'text-sm bg-gray-800 text-white',
      disabled: 'text-sm opacity-50 pointer-events-none',
    },
  },
  light: {
    container: 'text-gray-700 bg-white ring-1 ring-gray-100 rounded-3xl',
    open: 'ring-2 ring-primary-400 bg-white text-gray-700 rounded-xl',
    closed: 'text-gray-100',
    prefix: {
      base: 'text-gray-900',
    },
    icon: {
      closed: 'text-gray-700',
      open: 'text-primary-500 transform rotate-180',
      disabled: 'text-gray-100',
    },
    item: {
      base: 'text-sm text-gray-100',
      highlighted: 'text-sm bg-gray-200 text-gray-900',
      disabled: 'text-sm opacity-50 pointer-events-none',
    },
  },
  'light-square': {
    container: 'text-gray-700 bg-white ring-1 ring-gray-100 rounded',
    open: 'ring-1 ring-primary-400 bg-white text-gray-700 rounded',
    closed: 'text-gray-100',
    prefix: {
      base: 'text-gray-900',
    },
    icon: {
      closed: 'text-gray-700',
      open: 'text-primary-500 transform rotate-180',
      disabled: 'text-gray-100',
    },
    item: {
      base: 'text-sm text-gray-100',
      highlighted: 'text-sm bg-gray-200 text-gray-900',
      disabled: 'text-sm opacity-50 pointer-events-none',
    },
  },
  states: {
    none: '',
    error: 'ring-red-600',
    valid: '',
  },
  sizes: {
    base: 'pl-4 pr-10 text-sm',
    s: 'pl-4 pr-10 text-sm',
    label: {
      base: 'py-3',
      s: 'py-1',
    },
  },
};
