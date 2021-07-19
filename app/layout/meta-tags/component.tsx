import React from 'react';
import Head from 'next/head';

export interface MetaTagsProps {
  name: string,
  title: string,
  description: string,
  url?: string,
  type: string,
  publisher?: string,
  section?: string,
  tag?: string,
  image: string,
  imageURL?: string,
  imageWidth?: string,
  imageHeight?: string,
  twitterCard?: string,
  twitterImage?: string,
  twitterSite?: string,
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  name,
  title,
  description,
  url,
  type,
  publisher,
  section,
  tag,
  image,
  imageURL,
  imageWidth,
  imageHeight,
  twitterCard,
  twitterImage,
  twitterSite,
}: MetaTagsProps) => {
  return (
    <Head>
      {name && <meta property="og:site_name" content={name} key="name" />}
      {title && <meta property="og:title" content={title} key="title" />}
      {description && <meta property="og:description" content={description} key="description" />}
      {url && <meta property="og:url" content={url} key="url" />}
      {type && <meta property="og:type" content={type} key="type" />}
      {publisher && <meta property="article:publisher" content={publisher} key="publisher" />}
      {section && <meta property="article:section" content={section} key="section" />}
      {tag && <meta property="article:tag" content={tag} key="tag" />}
      {image && <meta property="og:image" content={image} key="image" />}
      {imageURL && <meta property="og:image:secure_url" content={imageURL} key="imageURL" />}
      {imageWidth && <meta property="og:image:width" content={imageWidth} key="imageWidth" />}
      {imageHeight && <meta property="og:image:height" content={imageHeight} key="imageHeight" />}
      {twitterCard && <meta property="twitter:card" content={twitterCard} key="twitterCard" />}
      {twitterImage && <meta property="twitter:image" content={twitterImage} key="twitterImage" />}
      {twitterSite && <meta property="twitter:site" content={twitterSite} key="twitterSite" />}
    </Head>
  );
};

export default MetaTags;
