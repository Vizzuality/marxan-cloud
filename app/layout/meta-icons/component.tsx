import React from 'react';

import Head from 'next/head';

import ANDROID_XL from 'images/meta-icons/android-icon-192x192.png';
import APPLE_M from 'images/meta-icons/apple-icon-114x114.png';
import APPLE_L from 'images/meta-icons/apple-icon-120x120.png';
import APPLE_XL from 'images/meta-icons/apple-icon-144x144.png';
import APPLE_XXL from 'images/meta-icons/apple-icon-152x152.png';
import APPLE_XXXL from 'images/meta-icons/apple-icon-180x180.png';
import APPLE_XXXS from 'images/meta-icons/apple-icon-57x57.png';
import APPLE_XXS from 'images/meta-icons/apple-icon-60x60.png';
import APPLE_XS from 'images/meta-icons/apple-icon-72x72.png';
import APPLE_S from 'images/meta-icons/apple-icon-76x76.png';
import FAVICON_S from 'images/meta-icons/favicon-16x16.png';
import FAVICON_M from 'images/meta-icons/favicon-32x32.png';
import FAVICON_L from 'images/meta-icons/favicon-96x96.png';
import PIN_ICON from 'images/meta-icons/ms-icon-144x144.png';

export interface MetaIconsProps {

}

export const MetaIcons: React.FC<MetaIconsProps> = () => {
  return (
    <Head>
      <link rel="apple-touch-icon" sizes="57x57" href={APPLE_XXXS} />
      <link rel="apple-touch-icon" sizes="60x60" href={APPLE_XXS} />
      <link rel="apple-touch-icon" sizes="72x72" href={APPLE_XS} />
      <link rel="apple-touch-icon" sizes="76x76" href={APPLE_S} />
      <link rel="apple-touch-icon" sizes="114x114" href={APPLE_M} />
      <link rel="apple-touch-icon" sizes="120x120" href={APPLE_L} />
      <link rel="apple-touch-icon" sizes="144x144" href={APPLE_XL} />
      <link rel="apple-touch-icon" sizes="152x152" href={APPLE_XXL} />
      <link rel="apple-touch-icon" sizes="180x180" href={APPLE_XXXL} />
      <link rel="icon" type="image/png" sizes="192x192" href={ANDROID_XL} />
      <link rel="icon" type="image/png" sizes="32x32" href={FAVICON_M} />
      <link rel="icon" type="image/png" sizes="96x96" href={FAVICON_L} />
      <link rel="icon" type="image/png" sizes="16x16" href={FAVICON_S} />
      <link rel="manifest" href="/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content={PIN_ICON} />
      <meta name="theme-color" content="#ffffff" />
    </Head>
  );
};

export default MetaIcons;
