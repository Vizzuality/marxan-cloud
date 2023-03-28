export const BACKGROUND_IMAGES = [{
  backgroundColor: '#10223a',
  image: '/images/home/intro/bg-01.png',
}, {
  backgroundColor: '#0f171a',
  image: '/images/home/intro/bg-02.png',
}, {
  backgroundColor: '#0f171a',
  image: '/images/home/intro/bg-03.png',
}, {
  backgroundColor: '#11161a',
  image: '/images/home/intro/bg-04.png',
}];

const MAIN_IMAGES_SIZE = {
  width: 409,
  height: 368,
};

export const MAIN_IMAGES = [{
  image: '/images/home/intro/image-01.jpg',
  size: MAIN_IMAGES_SIZE,
  position: {
    right: '10rem',
    bottom: '8rem',
  },
  slides: [{
    scale: 0.7,
    filter: 'blur(0px)',
  }, {
    scale: 0.76,
    filter: 'blur(0px)',
  }, {
    scale: 0.76,
    filter: 'blur(0px)',
  }, {
    scale: 0.76,
    filter: 'blur(0px)',
  }],
}, {
  image: '/images/home/intro/image-02.jpg',
  size: MAIN_IMAGES_SIZE,
  position: {
    right: '-4rem',
    bottom: '22rem',
  },
  slides: [{
    scale: 0.54,
    filter: 'blur(1px)',
    opacity: 1,
  }, {
    scale: 0.54,
    filter: 'blur(2px)',
    opacity: 0.7,
  }, {
    scale: 0.6,
    filter: 'blur(0px)',
    opacity: 1,
  }, {
    scale: 0.6,
    filter: 'blur(0px)',
    opacity: 1,
  }],
}, {
  image: '/images/home/intro/image-03.jpg',
  size: MAIN_IMAGES_SIZE,
  position: {
    right: '12rem',
    bottom: '25rem',
  },
  slides: [{
    scale: 0.36,
    filter: 'blur(2px)',
    opacity: 0.7,
  }, {
    scale: 0.36,
    filter: 'blur(2px)',
    opacity: 0.5,
  }, {
    scale: 0.36,
    filter: 'blur(2px)',
    opacity: 0.5,
  }, {
    scale: 0.4,
    filter: 'blur(0px)',
    opacity: 1,
  }],
}];
