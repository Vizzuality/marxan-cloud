import BIOPAMA_LOGO from 'images/partners/biopama_logo.png';
import EU_COMISSION_LOGO from 'images/partners/european-commission_logo.png';
import MAPBOX_LOGO from 'images/partners/mapbox_logo.png';
import MICROSOFT_LOGO from 'images/partners/microsoft_logo.png';
import PACMARA_LOGO from 'images/partners/pacmara_logo.png';
import THE_NATURE_CONSERVANCY_LOGO from 'images/partners/the-nature-conservancy_logo.png';
import UN_ENVIRONMENT_LOGO from 'images/partners/un-environment_logo.png';
import UNIVERSITY_QUEENSLAND_LOGO from 'images/partners/university-queensland_logo.png';
import VIZZUALITY_LOGO from 'images/partners/vizzuality_logo.png';

export const PARTNER_LOGOS = [
  {
    // FOUNDING LOGOS
    id: 'founding',
    title: 'Brought to you by:',
    logos: [
      {
        id: 1,
        alt: 'The Nature Conservancy logo',
        hyperlink: 'https://www.nature.org',
        src: THE_NATURE_CONSERVANCY_LOGO,
      },
      {
        id: 2,
        alt: 'Microsoft logo',
        hyperlink: 'https://www.microsoft.com',
        src: MICROSOFT_LOGO,
      }],
  }, {
    // PARTNERSHIP LOGOS
    id: 'partnership',
    title: 'In partnership with:',
    logos: [
      {
        id: 3,
        alt: 'Biopama logo',
        hyperlink: 'https://biopama.org',
        src: BIOPAMA_LOGO,
      },
      {
        id: 4,
        alt: 'The University of Queensland logo',
        hyperlink: 'https://www.uq.edu.au',
        src: UNIVERSITY_QUEENSLAND_LOGO,
      },
    ],
  },
  {
    // INITIATIVE LOGOS
    id: 'initiative',
    title: 'Supported by an initiative of the:',
    logos: [
      {
        id: 5,
        alt: 'European Commission logo',
        hyperlink: 'https://ec.europa.eu',
        src: EU_COMISSION_LOGO,
      },
    ],
  }, {
    // ADDITIONAL SUPPORT LOGOS
    id: 'additional-support',
    title: 'With additional support from:',
    logos: [
      {
        id: 6,
        alt: 'Vizzuality logo',
        hyperlink: 'https://www.vizzuality.com',
        src: VIZZUALITY_LOGO,
      },
      {
        id: 7,
        alt: 'Mapbox logo',
        hyperlink: 'https://www.mapbox.com',
        src: MAPBOX_LOGO,
      },
      {
        id: 8,
        alt: 'United Nations Environment Programme logo',
        hyperlink: 'https://www.unep.org',
        src: UN_ENVIRONMENT_LOGO,
      },
      {
        id: 9,
        alt: 'Pacmara logo',
        hyperlink: 'https://pacmara.org',
        src: PACMARA_LOGO,
      },
    ],
  },
];
